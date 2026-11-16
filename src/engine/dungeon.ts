import {
  DungeonFloor,
  Enemy,
  EnemyArchetypeId,
  HeroClassConfig,
  HeroClassId,
  InventoryItem,
  InventoryItemId,
  LootDrop,
  MerchantItem,
  RoomRect,
  TileType,
  Trap,
  TrapType,
} from '../types/game';

export const MAX_FLOOR = 3;
export const GRID_WIDTH = 17;
export const GRID_HEIGHT = 13;

export const HERO_CLASSES: Record<HeroClassId, HeroClassConfig> = {
  cipher: {
    id: 'cipher',
    name: 'Cipher Knight',
    role: 'Balanced Vanguard',
    description: 'Precision blade and reactive plating. Reliable across deep floors.',
    maxHp: 34,
    baseAtk: 7,
    baseDef: 3,
    critChance: 0.18,
    visionRadius: 4,
    startingPotions: 2,
    startingBombs: 1,
    accentColor: '#f59e0b',
  },
  volt: {
    id: 'volt',
    name: 'Volt Striker',
    role: 'High-Crit Assassin',
    description: 'Lethal critical strikes, wide optics, and shock explosives.',
    maxHp: 28,
    baseAtk: 9,
    baseDef: 2,
    critChance: 0.3,
    visionRadius: 5,
    startingPotions: 1,
    startingBombs: 2,
    accentColor: '#06b6d4',
  },
  aegis: {
    id: 'aegis',
    name: 'Aegis Warden',
    role: 'Armored Bastion',
    description: 'Reinforced hull, heavy armor mitigation, and extra med vials.',
    maxHp: 42,
    baseAtk: 6,
    baseDef: 5,
    critChance: 0.12,
    visionRadius: 4,
    startingPotions: 3,
    startingBombs: 0,
    accentColor: '#8b5cf6',
  },
};

export interface ArchetypeTemplate {
  id: EnemyArchetypeId;
  name: string;
  tier: 'standard' | 'elite' | 'warden';
  minFloor: number;
  baseHp: number;
  hpPerFloor: number;
  baseAtk: number;
  atkPerFloor: number;
  baseDef: number;
  defPerFloor: number;
  goldReward: number;
  scoreReward: number;
  description: string;
}

export const ENEMY_ARCHETYPES: Record<EnemyArchetypeId, ArchetypeTemplate> = {
  scrap_rat: {
    id: 'scrap_rat',
    name: 'Scrap Rat',
    tier: 'standard',
    minFloor: 1,
    baseHp: 11,
    hpPerFloor: 4,
    baseAtk: 4,
    atkPerFloor: 1.8,
    baseDef: 0,
    defPerFloor: 0.5,
    goldReward: 14,
    scoreReward: 55,
    description: 'Fast cybernetic scavenger lurking in unlit corridors.',
  },
  null_goblin: {
    id: 'null_goblin',
    name: 'Null Raider',
    tier: 'standard',
    minFloor: 1,
    baseHp: 15,
    hpPerFloor: 5,
    baseAtk: 5,
    atkPerFloor: 2.0,
    baseDef: 1,
    defPerFloor: 0.6,
    goldReward: 20,
    scoreReward: 80,
    description: 'Opportunistic crypt stalker armed with rusted plasma blades.',
  },
  rust_sentinel: {
    id: 'rust_sentinel',
    name: 'Rust Sentinel',
    tier: 'standard',
    minFloor: 2,
    baseHp: 23,
    hpPerFloor: 6,
    baseAtk: 7,
    atkPerFloor: 2.2,
    baseDef: 3,
    defPerFloor: 1.0,
    goldReward: 30,
    scoreReward: 130,
    description: 'Heavy iron automaton with thick reactive armor plates.',
  },
  blight_drone: {
    id: 'blight_drone',
    name: 'Blight Drone',
    tier: 'standard',
    minFloor: 2,
    baseHp: 19,
    hpPerFloor: 5,
    baseAtk: 8,
    atkPerFloor: 2.4,
    baseDef: 2,
    defPerFloor: 0.7,
    goldReward: 28,
    scoreReward: 125,
    description: 'Bio-hazard hovering unit leaking corrosive vapor.',
  },
  void_stalker: {
    id: 'void_stalker',
    name: 'Void Stalker',
    tier: 'elite',
    minFloor: 2,
    baseHp: 27,
    hpPerFloor: 7,
    baseAtk: 9,
    atkPerFloor: 2.5,
    baseDef: 2,
    defPerFloor: 0.8,
    goldReward: 44,
    scoreReward: 190,
    description: 'Shadow-cloaked predator capable of devastating ambush strikes.',
  },
  arcane_wraith: {
    id: 'arcane_wraith',
    name: 'Arcane Wraith',
    tier: 'elite',
    minFloor: 3,
    baseHp: 32,
    hpPerFloor: 7,
    baseAtk: 10,
    atkPerFloor: 2.5,
    baseDef: 3,
    defPerFloor: 1.0,
    goldReward: 56,
    scoreReward: 240,
    description: 'Spectral anomaly pulsing with destabilized violet energy.',
  },
  floor_warden: {
    id: 'floor_warden',
    name: 'Zenexis Overlord',
    tier: 'warden',
    minFloor: 3,
    baseHp: 56,
    hpPerFloor: 12,
    baseAtk: 11,
    atkPerFloor: 2.0,
    baseDef: 4,
    defPerFloor: 0.5,
    goldReward: 180,
    scoreReward: 750,
    description: 'AI-driven supreme guardian of the Floor 3 sanctum. Defeat it to claim a legendary relic.',
  },
};

export const ITEM_CATALOG: Record<InventoryItemId, Omit<InventoryItem, 'quantity'>> = {
  med_vial: {
    id: 'med_vial',
    name: 'Nano-Med Vial',
    shortName: 'Med Vial',
    description: 'Restores 14 HP immediately.',
    rarity: 'common',
    usableInExploration: true,
    usableInCombat: true,
  },
  aegis_cell: {
    id: 'aegis_cell',
    name: 'Aegis Shield Cell',
    shortName: 'Shield Cell',
    description: 'Grants +10 kinetic shield barrier that absorbs incoming damage.',
    rarity: 'rare',
    usableInExploration: true,
    usableInCombat: true,
  },
  overdrive_core: {
    id: 'overdrive_core',
    name: 'Overdrive Core',
    shortName: 'Overdrive',
    description: 'Grants +4 Attack for the current battle (or +1 permanent Attack outside combat).',
    rarity: 'legendary',
    usableInExploration: true,
    usableInCombat: true,
  },
  shock_bomb: {
    id: 'shock_bomb',
    name: 'Arc Shock Bomb',
    shortName: 'Shock Bomb',
    description: 'Deals 14 direct damage in combat and stuns the enemy for 1 turn.',
    rarity: 'cursed',
    usableInExploration: false,
    usableInCombat: true,
  },
};

export const MERCHANT_CATALOG: MerchantItem[] = [
  // Weapons
  {
    id: 'wpn_plasma_sabre',
    category: 'weapon',
    name: 'Plasma Sabre',
    description: 'Equip precision arc blade (+2 Attack permanently).',
    cost: 35,
    unique: true,
    atkBonus: 2,
  },
  {
    id: 'wpn_thermal_katana',
    category: 'weapon',
    name: 'Thermal Katana',
    description: 'Superheated monomolecular edge (+4 Attack permanently).',
    cost: 65,
    unique: true,
    atkBonus: 4,
  },
  {
    id: 'wpn_hyperion_cleaver',
    category: 'weapon',
    name: 'Hyperion Cleaver',
    description: 'Heavy boss-breaker blade (+6 Attack permanently).',
    cost: 95,
    unique: true,
    minFloor: 2,
    atkBonus: 6,
  },
  // Shields & Armor
  {
    id: 'arm_kinetic_buckler',
    category: 'armor',
    name: 'Kinetic Buckler',
    description: 'Reactive forearm shield (+1 Defense & +8 Kinetic Shield).',
    cost: 35,
    unique: true,
    defBonus: 1,
    shieldBonus: 8,
  },
  {
    id: 'arm_composite_vest',
    category: 'armor',
    name: 'Composite Carapace',
    description: 'Layered ballistic plating (+2 Defense & +12 Kinetic Shield).',
    cost: 65,
    unique: true,
    defBonus: 2,
    shieldBonus: 12,
  },
  {
    id: 'arm_titan_aegis',
    category: 'armor',
    name: 'Titan Aegis Rig',
    description: 'Heavy sanctum armor (+3 Defense & +10 Max HP).',
    cost: 95,
    unique: true,
    minFloor: 2,
    defBonus: 3,
    maxHpBonus: 10,
  },
  // Potions & Supplies
  {
    id: 'pot_med_vial',
    category: 'potion',
    name: 'Nano-Med Vial',
    description: 'Add 1 Nano-Med Vial to pack (Restores 14 HP).',
    cost: 20,
    inventoryItemId: 'med_vial',
  },
  {
    id: 'pot_field_elixir',
    category: 'potion',
    name: 'Field Recovery Elixir',
    description: 'Drink immediately on-site to restore +20 HP.',
    cost: 24,
    instantHeal: 20,
  },
  {
    id: 'pot_aegis_cell',
    category: 'potion',
    name: 'Aegis Shield Cell',
    description: 'Add 1 Aegis Shield Cell to pack (+10 Shield).',
    cost: 30,
    inventoryItemId: 'aegis_cell',
  },
  {
    id: 'pot_shock_bomb',
    category: 'potion',
    name: 'Arc Shock Bomb',
    description: 'Add 1 Shock Bomb to pack (14 dmg + 1-turn stun).',
    cost: 35,
    inventoryItemId: 'shock_bomb',
  },
];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createStartingInventory(classId: HeroClassId): InventoryItem[] {
  const cfg = HERO_CLASSES[classId];
  const items: InventoryItem[] = [
    { ...ITEM_CATALOG.med_vial, quantity: cfg.startingPotions },
    { ...ITEM_CATALOG.aegis_cell, quantity: 1 },
  ];
  if (cfg.startingBombs > 0) {
    items.push({ ...ITEM_CATALOG.shock_bomb, quantity: cfg.startingBombs });
  }
  return items;
}

export function addInventoryItem(
  inventory: InventoryItem[],
  itemId: InventoryItemId,
  qty: number = 1
): InventoryItem[] {
  const existing = inventory.find((i) => i.id === itemId);
  if (existing) {
    return inventory.map((i) =>
      i.id === itemId ? { ...i, quantity: i.quantity + qty } : i
    );
  }
  return [...inventory, { ...ITEM_CATALOG[itemId], quantity: qty }];
}

export function consumeInventoryItem(
  inventory: InventoryItem[],
  itemId: InventoryItemId
): InventoryItem[] {
  return inventory
    .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
    .filter((i) => i.quantity > 0);
}

export function createEnemy(
  archetypeId: EnemyArchetypeId,
  floorNum: number,
  x: number,
  y: number,
  isBoss: boolean = false
): Enemy {
  const tpl = ENEMY_ARCHETYPES[archetypeId];
  const scale = Math.max(0, floorNum - 1);
  const maxHp = Math.round(tpl.baseHp + scale * tpl.hpPerFloor);
  const atk = Math.round(tpl.baseAtk + scale * tpl.atkPerFloor);
  const def = Math.round(tpl.baseDef + scale * tpl.defPerFloor);
  return {
    id: uid('enemy'),
    archetypeId: tpl.id,
    name: tpl.name,
    tier: tpl.tier,
    isBoss,
    x,
    y,
    hp: maxHp,
    maxHp,
    atk,
    def,
    goldReward: Math.round(tpl.goldReward * (1 + scale * 0.25)),
    scoreReward: Math.round(tpl.scoreReward * (1 + scale * 0.3)),
    alerted: false,
    description: tpl.description,
  };
}

export function generateDungeonFloor(floorNumber: number): {
  floor: DungeonFloor;
  spawnPos: { x: number; y: number };
} {
  // Progressive grid complexity across Floors 1, 2, 3
  const width = floorNumber === 1 ? 15 : floorNumber === 2 ? 17 : 19;
  const height = floorNumber === 1 ? 11 : floorNumber === 2 ? 13 : 15;
  const targetRooms = floorNumber === 1 ? 5 : floorNumber === 2 ? 6 : 8;

  const tiles: TileType[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 'WALL' as TileType)
  );

  const rooms: RoomRect[] = [];

  for (let attempt = 0; attempt < 90 && rooms.length < targetRooms; attempt++) {
    const w = randInt(3, 5);
    const h = randInt(3, 4);
    const x = randInt(1, width - w - 2);
    const y = randInt(1, height - h - 2);

    const overlaps = rooms.some(
      (r) =>
        x <= r.x + r.w + 1 &&
        x + w + 1 >= r.x &&
        y <= r.y + r.h + 1 &&
        y + h + 1 >= r.y
    );

    if (!overlaps) {
      for (let ry = y; ry < y + h; ry++) {
        for (let rx = x; rx < x + w; rx++) {
          tiles[ry][rx] = 'FLOOR';
        }
      }
      rooms.push({
        x,
        y,
        w,
        h,
        cx: Math.floor(x + w / 2),
        cy: Math.floor(y + h / 2),
      });
    }
  }

  // Fallback guarantee: at least 2 rooms
  if (rooms.length < 2) {
    const r1: RoomRect = { x: 1, y: 1, w: 4, h: 4, cx: 3, cy: 3 };
    const r2: RoomRect = {
      x: width - 6,
      y: height - 6,
      w: 4,
      h: 4,
      cx: width - 4,
      cy: height - 4,
    };
    [r1, r2].forEach((r) => {
      for (let ry = r.y; ry < r.y + r.h; ry++) {
        for (let rx = r.x; rx < r.x + r.w; rx++) {
          tiles[ry][rx] = 'FLOOR';
        }
      }
      rooms.push(r);
    });
  }

  // Connect rooms via L-shaped corridors
  for (let i = 1; i < rooms.length; i++) {
    const prev = rooms[i - 1];
    const curr = rooms[i];
    let cx = prev.cx;
    let cy = prev.cy;

    const horizFirst = Math.random() < 0.5;
    if (horizFirst) {
      while (cx !== curr.cx) {
        tiles[cy][cx] = 'FLOOR';
        cx += curr.cx > cx ? 1 : -1;
      }
      while (cy !== curr.cy) {
        tiles[cy][cx] = 'FLOOR';
        cy += curr.cy > cy ? 1 : -1;
      }
    } else {
      while (cy !== curr.cy) {
        tiles[cy][cx] = 'FLOOR';
        cy += curr.cy > cy ? 1 : -1;
      }
      while (cx !== curr.cx) {
        tiles[cy][cx] = 'FLOOR';
        cx += curr.cx > cx ? 1 : -1;
      }
    }
    tiles[curr.cy][curr.cx] = 'FLOOR';
  }

  // Floor 3 gets an extra cross-corridor loop between rooms for tactical flanking
  if (floorNumber >= 3 && rooms.length >= 4) {
    const a = rooms[0];
    const b = rooms[Math.floor(rooms.length / 2)];
    let cx = a.cx;
    let cy = a.cy;
    while (cx !== b.cx) {
      tiles[cy][cx] = 'FLOOR';
      cx += b.cx > cx ? 1 : -1;
    }
    while (cy !== b.cy) {
      tiles[cy][cx] = 'FLOOR';
      cy += b.cy > cy ? 1 : -1;
    }
  }

  // Hero spawns in room 0
  const spawnRoom = rooms[0];
  const spawnPos = { x: spawnRoom.cx, y: spawnRoom.cy };

  // Farthest room houses stairs (Floors 1-2) or Boss Sanctum (Floor 3)
  let stairsRoom = rooms[rooms.length - 1];
  let maxDist = -1;
  for (let i = 1; i < rooms.length; i++) {
    const r = rooms[i];
    const dist = Math.abs(r.cx - spawnPos.x) + Math.abs(r.cy - spawnPos.y);
    if (dist > maxDist) {
      maxDist = dist;
      stairsRoom = r;
    }
  }
  const stairsPos = { x: stairsRoom.cx, y: stairsRoom.cy };
  if (floorNumber < MAX_FLOOR) {
    tiles[stairsPos.y][stairsPos.x] = 'STAIRS';
  }

  const occupied = new Set<string>([`${spawnPos.x},${spawnPos.y}`]);
  if (floorNumber < MAX_FLOOR) {
    occupied.add(`${stairsPos.x},${stairsPos.y}`);
  }

  const roomCells = (room: RoomRect) => {
    const list: { x: number; y: number }[] = [];
    for (let ry = room.y; ry < room.y + room.h; ry++) {
      for (let rx = room.x; rx < room.x + room.w; rx++) {
        const key = `${rx},${ry}`;
        if (!occupied.has(key) && tiles[ry][rx] === 'FLOOR') {
          list.push({ x: rx, y: ry });
        }
      }
    }
    return list;
  };

  // Spawn enemies scaled by floor
  const enemies: Enemy[] = [];
  const availableArchetypes = (Object.values(ENEMY_ARCHETYPES) as ArchetypeTemplate[]).filter(
    (a) => a.minFloor <= floorNumber && a.tier !== 'warden'
  );

  // On Floor 3, spawn the Final Boss (Zenexis Overlord) in the Sanctum Room
  if (floorNumber >= MAX_FLOOR) {
    occupied.add(`${stairsRoom.cx},${stairsRoom.cy}`);
    enemies.push(
      createEnemy('floor_warden', floorNumber, stairsRoom.cx, stairsRoom.cy, true)
    );
  }

  const desiredEnemies = floorNumber === 1 ? 4 : floorNumber === 2 ? 6 : 8;
  for (let i = 1; i < rooms.length && enemies.length < desiredEnemies; i++) {
    const r = rooms[i];
    const countInRoom =
      r === stairsRoom && floorNumber >= MAX_FLOOR
        ? 0
        : r === stairsRoom
        ? 1
        : randInt(1, floorNumber >= 2 ? 2 : 1);

    for (let k = 0; k < countInRoom && enemies.length < desiredEnemies; k++) {
      const candidates = roomCells(r);
      if (candidates.length === 0) break;
      const spot = candidates[randInt(0, candidates.length - 1)];
      occupied.add(`${spot.x},${spot.y}`);
      const arch = availableArchetypes[randInt(0, availableArchetypes.length - 1)];
      enemies.push(createEnemy(arch.id, floorNumber, spot.x, spot.y, false));
    }
  }

  // Spawn loot (gold + consumables)
  const loot: LootDrop[] = [];
  const goldCount = floorNumber === 1 ? 4 : floorNumber === 2 ? 5 : 6;
  for (let i = 0; i < goldCount; i++) {
    const r = rooms[randInt(1, rooms.length - 1)];
    const candidates = roomCells(r);
    if (candidates.length === 0) continue;
    const spot = candidates[randInt(0, candidates.length - 1)];
    occupied.add(`${spot.x},${spot.y}`);
    const amount = randInt(14, 26) + floorNumber * 8;
    loot.push({
      id: uid('loot'),
      type: 'gold',
      name: `${amount} Gold`,
      x: spot.x,
      y: spot.y,
      amount,
      rarity: 'legendary',
    });
  }

  const itemCount = floorNumber === 1 ? 2 : 3;
  const itemRollPool: { type: InventoryItemId; weight: number }[] = [
    { type: 'med_vial', weight: 45 },
    { type: 'aegis_cell', weight: 25 },
    { type: 'shock_bomb', weight: 18 },
    { type: 'overdrive_core', weight: 12 },
  ];

  for (let i = 0; i < itemCount; i++) {
    const r = rooms[randInt(1, rooms.length - 1)];
    const candidates = roomCells(r);
    if (candidates.length === 0) continue;
    const spot = candidates[randInt(0, candidates.length - 1)];
    occupied.add(`${spot.x},${spot.y}`);

    const roll = Math.random() * 100;
    let acc = 0;
    let chosen: InventoryItemId = 'med_vial';
    for (const entry of itemRollPool) {
      acc += entry.weight;
      if (roll <= acc) {
        chosen = entry.type;
        break;
      }
    }
    const meta = ITEM_CATALOG[chosen];
    loot.push({
      id: uid('loot'),
      type: chosen,
      name: meta.name,
      x: spot.x,
      y: spot.y,
      amount: 1,
      rarity: meta.rarity,
    });
  }

  // Higher trap density on deeper floors
  const traps: Trap[] = [];
  const allFloorTiles: { x: number; y: number }[] = [];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const distFromSpawn = Math.abs(x - spawnPos.x) + Math.abs(y - spawnPos.y);
      if (tiles[y][x] === 'FLOOR' && !occupied.has(`${x},${y}`) && distFromSpawn > 3) {
        allFloorTiles.push({ x, y });
      }
    }
  }

  const trapDefs: { type: TrapType; name: string; baseDmg: number }[] = [
    { type: 'spike', name: 'Spike Plate', baseDmg: 4 },
    { type: 'biomine', name: 'Bio-Hazard Mine', baseDmg: 5 },
    { type: 'arcsnare', name: 'Arc Snare', baseDmg: 6 },
  ];

  const trapCount = floorNumber === 1 ? 3 : floorNumber === 2 ? 5 : 8;
  for (let i = 0; i < trapCount && allFloorTiles.length > 0; i++) {
    const idx = randInt(0, allFloorTiles.length - 1);
    const spot = allFloorTiles.splice(idx, 1)[0];
    occupied.add(`${spot.x},${spot.y}`);
    const def = trapDefs[randInt(0, trapDefs.length - 1)];
    traps.push({
      id: uid('trap'),
      type: def.type,
      name: def.name,
      x: spot.x,
      y: spot.y,
      damage: def.baseDmg + (floorNumber - 1) * 2,
      triggered: false,
      revealed: false,
    });
  }

  const explored = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => false)
  );
  const visible = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => false)
  );

  const floor: DungeonFloor = {
    floorNumber,
    width,
    height,
    tiles,
    explored,
    visible,
    rooms,
    enemies,
    traps,
    loot,
    stairsPos,
  };

  const updatedFloor = computeFogOfWar(floor, spawnPos.x, spawnPos.y, 4);
  return { floor: updatedFloor, spawnPos };
}

function hasLineOfSight(
  tiles: TileType[][],
  x0: number,
  y0: number,
  x1: number,
  y1: number
): boolean {
  let cx = x0;
  let cy = y0;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    if (cx === x1 && cy === y1) return true;
    if ((cx !== x0 || cy !== y0) && tiles[cy]?.[cx] === 'WALL') {
      return false;
    }
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      cx += sx;
    }
    if (e2 < dx) {
      err += dx;
      cy += sy;
    }
  }
}

export function computeFogOfWar(
  floor: DungeonFloor,
  heroX: number,
  heroY: number,
  visionRadius: number
): DungeonFloor {
  const visible = floor.visible.map((row) => row.map(() => false));
  const explored = floor.explored.map((row) => [...row]);

  for (let y = 0; y < floor.height; y++) {
    for (let x = 0; x < floor.width; x++) {
      const dist = Math.hypot(x - heroX, y - heroY);
      if (dist <= visionRadius + 0.5) {
        if (hasLineOfSight(floor.tiles, heroX, heroY, x, y)) {
          visible[y][x] = true;
          explored[y][x] = true;
        }
      }
    }
  }

  return {
    ...floor,
    visible,
    explored,
  };
}

export function findNextStepBFS(
  floor: DungeonFloor,
  startX: number,
  startY: number,
  goalX: number,
  goalY: number,
  blockedCoords: Set<string>
): { x: number; y: number } | null {
  if (startX === goalX && startY === goalY) return null;

  const queue: { x: number; y: number; firstStep: { x: number; y: number } | null }[] = [
    { x: startX, y: startY, firstStep: null },
  ];
  const visited = new Set<string>([`${startX},${startY}`]);

  const dirs = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    for (const { dx, dy } of dirs) {
      const nx = curr.x + dx;
      const ny = curr.y + dy;
      const key = `${nx},${ny}`;
      if (nx < 0 || nx >= floor.width || ny < 0 || ny >= floor.height) continue;
      if (visited.has(key)) continue;
      if (floor.tiles[ny][nx] === 'WALL') continue;

      const isGoal = nx === goalX && ny === goalY;
      if (!isGoal && blockedCoords.has(key)) continue;

      const firstStep = curr.firstStep ?? { x: nx, y: ny };
      if (isGoal) return firstStep;

      visited.add(key);
      queue.push({ x: nx, y: ny, firstStep });
    }
  }

  return null;
}

export function stepEnemiesTowardHero(
  floor: DungeonFloor,
  heroX: number,
  heroY: number
): {
  updatedFloor: DungeonFloor;
  ambushingEnemy: Enemy | null;
} {
  let ambushingEnemy: Enemy | null = null;
  const updatedEnemies = floor.enemies.map((e) => ({ ...e }));

  for (let i = 0; i < updatedEnemies.length; i++) {
    const enemy = updatedEnemies[i];
    const isVisible = floor.visible[enemy.y]?.[enemy.x] ?? false;
    const manhattan = Math.abs(enemy.x - heroX) + Math.abs(enemy.y - heroY);

    if (isVisible || manhattan <= 5) {
      enemy.alerted = true;
    }

    if (!enemy.alerted) continue;

    if (manhattan === 1) {
      ambushingEnemy = enemy;
      break;
    }

    const blocked = new Set<string>();
    for (let j = 0; j < updatedEnemies.length; j++) {
      if (i !== j) {
        blocked.add(`${updatedEnemies[j].x},${updatedEnemies[j].y}`);
      }
    }
    for (const t of floor.traps) {
      if (t.revealed && !t.triggered) {
        blocked.add(`${t.x},${t.y}`);
      }
    }

    const next = findNextStepBFS(floor, enemy.x, enemy.y, heroX, heroY, blocked);
    if (next && !(next.x === heroX && next.y === heroY)) {
      enemy.x = next.x;
      enemy.y = next.y;
    } else if (next && next.x === heroX && next.y === heroY) {
      ambushingEnemy = enemy;
      break;
    }
  }

  return {
    updatedFloor: {
      ...floor,
      enemies: updatedEnemies,
    },
    ambushingEnemy,
  };
}
