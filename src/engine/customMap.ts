import {
  CustomMapData,
  CustomMapEntity,
  DungeonFloor,
  Enemy,
  EnemyArchetypeId,
  HeroClassId,
  LootDrop,
  LootType,
  MapValidationResult,
  TileType,
  Trap,
  TrapType,
} from '../types/game';
import {
  computeFogOfWar,
  createEnemy,
  ENEMY_ARCHETYPES,
  HERO_CLASSES,
  ITEM_CATALOG,
} from './dungeon';

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Validates a custom dungeon map using BFS pathfinding.
 * Checks boundary safety, spawn/exit presence and validity, and ensures
 * that a walkable path exists between the hero spawn and the exit stairs.
 */
export function validateCustomMap(map: CustomMapData): MapValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const { width, height, tiles, spawn, exit } = map;

  // 1. Dimension validation
  if (!width || !height || width < 5 || height < 5) {
    errors.push(`Map dimensions must be at least 5x5 (currently ${width}x${height}).`);
  }

  if (tiles.length !== height) {
    errors.push(`Tile row count (${tiles.length}) does not match height (${height}).`);
  }

  // 2. Spawn validation
  if (spawn.x < 0 || spawn.x >= width || spawn.y < 0 || spawn.y >= height) {
    errors.push(`Hero spawn position (${spawn.x}, ${spawn.y}) is outside map boundaries.`);
  } else if (tiles[spawn.y]?.[spawn.x] === '#') {
    errors.push(`Hero spawn at (${spawn.x}, ${spawn.y}) is blocked by a wall.`);
  }

  // 3. Exit validation
  if (exit.x < 0 || exit.x >= width || exit.y < 0 || exit.y >= height) {
    errors.push(`Exit stairs position (${exit.x}, ${exit.y}) is outside map boundaries.`);
  } else if (tiles[exit.y]?.[exit.x] === '#') {
    errors.push(`Exit stairs at (${exit.x}, ${exit.y}) are blocked by a wall.`);
  }

  if (spawn.x === exit.x && spawn.y === exit.y) {
    errors.push('Hero spawn and exit stairs cannot occupy the exact same tile.');
  }

  // 4. Entity validations & warnings
  let bossCount = 0;
  for (const entity of map.entities) {
    if (entity.x < 0 || entity.x >= width || entity.y < 0 || entity.y >= height) {
      warnings.push(`Entity ${entity.subType} at (${entity.x}, ${entity.y}) is outside map bounds.`);
      continue;
    }
    if (tiles[entity.y]?.[entity.x] === '#') {
      warnings.push(`Entity ${entity.subType} at (${entity.x}, ${entity.y}) is placed inside a wall tile.`);
    }
    if (entity.x === spawn.x && entity.y === spawn.y && entity.kind === 'enemy') {
      errors.push(`Enemy ${entity.subType} cannot spawn directly on top of the hero.`);
    }
    if (entity.kind === 'enemy' && entity.subType === 'floor_warden') {
      bossCount++;
    }
  }

  if (bossCount > 2) {
    warnings.push(`Map has ${bossCount} Zenexis Overlords. This will be an extreme challenge!`);
  }

  if (errors.length > 0) {
    return {
      valid: false,
      reachable: false,
      pathLength: null,
      pathCoords: [],
      errors,
      warnings,
    };
  }

  // 5. BFS Reachability Check: find shortest path from spawn to exit
  const queue: { x: number; y: number; path: { x: number; y: number }[] }[] = [
    { x: spawn.x, y: spawn.y, path: [{ x: spawn.x, y: spawn.y }] },
  ];
  const visited = new Set<string>([`${spawn.x},${spawn.y}`]);
  let foundPath: { x: number; y: number }[] | null = null;

  const directions = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.x === exit.x && current.y === exit.y) {
      foundPath = current.path;
      break;
    }

    for (const { dx, dy } of directions) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      const key = `${nx},${ny}`;

      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      if (visited.has(key)) continue;
      if (tiles[ny][nx] === '#') continue; // Impassable wall

      visited.add(key);
      queue.push({
        x: nx,
        y: ny,
        path: [...current.path, { x: nx, y: ny }],
      });
    }
  }

  if (!foundPath) {
    errors.push('Exit stairs are unreachable from hero spawn. Ensure there is an open corridor connecting them.');
    return {
      valid: false,
      reachable: false,
      pathLength: null,
      pathCoords: [],
      errors,
      warnings,
    };
  }

  return {
    valid: true,
    reachable: true,
    pathLength: foundPath.length - 1,
    pathCoords: foundPath,
    errors: [],
    warnings,
  };
}

/**
 * Creates a blank, bounded starter map for the editor.
 */
export function createDefaultCustomMap(
  name = 'Custom Crypt',
  author = 'Runner',
  width = 17,
  height = 13
): CustomMapData {
  const tiles: ('#' | '.' | '>')[][] = [];

  for (let y = 0; y < height; y++) {
    const row: ('#' | '.' | '>')[] = [];
    for (let x = 0; x < width; x++) {
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        row.push('#');
      } else {
        row.push('.');
      }
    }
    tiles.push(row);
  }

  const spawn = { x: 2, y: 2 };
  const exit = { x: width - 3, y: height - 3 };
  tiles[exit.y][exit.x] = '>';

  const entities: CustomMapEntity[] = [
    {
      id: uid('cent'),
      kind: 'enemy',
      subType: 'scrap_rat',
      x: 6,
      y: 4,
    },
    {
      id: uid('cent'),
      kind: 'trap',
      subType: 'spike',
      x: 8,
      y: 6,
    },
    {
      id: uid('cent'),
      kind: 'loot',
      subType: 'gold',
      x: 10,
      y: 3,
      goldAmount: 35,
    },
    {
      id: uid('cent'),
      kind: 'loot',
      subType: 'med_vial',
      x: 4,
      y: 8,
    },
  ];

  return {
    version: 1,
    id: uid('cmap'),
    name,
    author,
    description: 'A custom dungeon floor designed in Zenexis.',
    width,
    height,
    tiles,
    spawn,
    exit,
    entities,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Applies an architectural layout preset to an existing map.
 */
export function applyMapTemplate(
  map: CustomMapData,
  templateId: 'empty' | 'arena' | 'pillars' | 'corridors'
): CustomMapData {
  const { width, height } = map;
  const tiles: ('#' | '.' | '>')[][] = [];

  for (let y = 0; y < height; y++) {
    const row: ('#' | '.' | '>')[] = [];
    for (let x = 0; x < width; x++) {
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        row.push('#');
      } else if (templateId === 'pillars') {
        if (x % 3 === 0 && y % 3 === 0) {
          row.push('#');
        } else {
          row.push('.');
        }
      } else if (templateId === 'corridors') {
        // Alternating corridor barriers
        if ((y % 4 === 2 && x > 2 && x < width - 2) || (x % 4 === 2 && y > 2 && y < height - 2 && y !== 6)) {
          row.push('#');
        } else {
          row.push('.');
        }
      } else {
        row.push('.');
      }
    }
    tiles.push(row);
  }

  const spawn = { x: 2, y: 2 };
  const exit = { x: width - 3, y: height - 3 };
  tiles[spawn.y][spawn.x] = '.';
  tiles[exit.y][exit.x] = '>';

  // Filter out entities placed inside generated walls
  const validEntities = map.entities.filter(
    (e) => tiles[e.y]?.[e.x] !== '#' && !(e.x === spawn.x && e.y === spawn.y)
  );

  return {
    ...map,
    tiles,
    spawn,
    exit,
    entities: validEntities,
    updatedAt: Date.now(),
  };
}

/**
 * Compiles a validated CustomMapData object into an active game DungeonFloor
 * ready for gameplay in the existing exploration & combat engine.
 */
export function customMapToDungeonFloor(
  map: CustomMapData,
  heroClassId: HeroClassId
): { floor: DungeonFloor; spawnPos: { x: number; y: number } } {
  const width = map.width;
  const height = map.height;

  // 1. Build tile matrix
  const tiles: TileType[][] = [];
  const explored: boolean[][] = [];
  const visible: boolean[][] = [];

  for (let y = 0; y < height; y++) {
    const tileRow: TileType[] = [];
    const expRow: boolean[] = [];
    const visRow: boolean[] = [];

    for (let x = 0; x < width; x++) {
      const char = map.tiles[y]?.[x] ?? '#';
      if (x === map.exit.x && y === map.exit.y) {
        tileRow.push('STAIRS');
      } else if (char === '#') {
        tileRow.push('WALL');
      } else {
        tileRow.push('FLOOR');
      }
      expRow.push(false);
      visRow.push(false);
    }
    tiles.push(tileRow);
    explored.push(expRow);
    visible.push(visRow);
  }

  // 2. Instantiate Enemies
  const enemies: Enemy[] = [];
  for (const entity of map.entities) {
    if (entity.kind !== 'enemy') continue;
    const archId = entity.subType as EnemyArchetypeId;
    if (!ENEMY_ARCHETYPES[archId]) continue;

    const isBoss = archId === 'floor_warden';
    const enemy = createEnemy(archId, isBoss ? 3 : 1, entity.x, entity.y, isBoss);
    enemies.push(enemy);
  }

  // 3. Instantiate Traps
  const traps: Trap[] = [];
  for (const entity of map.entities) {
    if (entity.kind !== 'trap') continue;
    const trapType = entity.subType as TrapType;
    const damage = trapType === 'spike' ? 6 : trapType === 'biomine' ? 9 : 8;
    const name =
      trapType === 'spike'
        ? 'Spike Trap'
        : trapType === 'biomine'
        ? 'Biomine Pod'
        : 'Arc Snare';

    traps.push({
      id: uid('trap'),
      type: trapType,
      name,
      x: entity.x,
      y: entity.y,
      damage,
      triggered: false,
      revealed: false,
    });
  }

  // 4. Instantiate Loot
  const loot: LootDrop[] = [];
  for (const entity of map.entities) {
    if (entity.kind !== 'loot') continue;
    const lootType = entity.subType as LootType;

    if (lootType === 'gold') {
      const amount = entity.goldAmount && entity.goldAmount > 0 ? entity.goldAmount : 25;
      loot.push({
        id: uid('loot'),
        type: 'gold',
        name: `${amount} Gold`,
        x: entity.x,
        y: entity.y,
        amount,
        rarity: 'legendary',
      });
    } else {
      const meta = ITEM_CATALOG[lootType as keyof typeof ITEM_CATALOG];
      if (meta) {
        loot.push({
          id: uid('loot'),
          type: lootType,
          name: meta.name,
          x: entity.x,
          y: entity.y,
          amount: 1,
          rarity: meta.rarity,
        });
      }
    }
  }

  // Define synthetic bounding rooms for ambient audio / AI calculations
  const floor: DungeonFloor = {
    floorNumber: 1,
    width,
    height,
    tiles,
    explored,
    visible,
    rooms: [
      {
        x: 1,
        y: 1,
        w: width - 2,
        h: height - 2,
        cx: Math.floor(width / 2),
        cy: Math.floor(height / 2),
      },
    ],
    enemies,
    traps,
    loot,
    stairsPos: { x: map.exit.x, y: map.exit.y },
  };

  const visionRadius = HERO_CLASSES[heroClassId]?.visionRadius ?? 4;
  const updatedFloor = computeFogOfWar(floor, map.spawn.x, map.spawn.y, visionRadius);

  return {
    floor: updatedFloor,
    spawnPos: { x: map.spawn.x, y: map.spawn.y },
  };
}
