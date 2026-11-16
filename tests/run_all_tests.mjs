import test from 'node:test';
import assert from 'node:assert';

// ============================================================================
// 1. REPRODUCED PURE LOGIC ENGINES (FOR DIRECT NODE RUNTIME TESTING)
// ============================================================================

const ENEMY_ARCHETYPES = {
  scrap_rat: { id: 'scrap_rat', name: 'Scrap Rat', baseHp: 15, baseAtk: 5, baseDef: 1, goldReward: 20 },
  null_goblin: { id: 'null_goblin', name: 'Null Raider', baseHp: 15, baseAtk: 5, baseDef: 1, goldReward: 20 },
  rust_sentinel: { id: 'rust_sentinel', name: 'Rust Sentinel', baseHp: 23, baseAtk: 7, baseDef: 3, goldReward: 30 },
  blight_drone: { id: 'blight_drone', name: 'Blight Drone', baseHp: 19, baseAtk: 8, baseDef: 2, goldReward: 28 },
  void_stalker: { id: 'void_stalker', name: 'Void Stalker', baseHp: 27, baseAtk: 9, baseDef: 2, goldReward: 44 },
  arcane_wraith: { id: 'arcane_wraith', name: 'Arcane Wraith', baseHp: 32, baseAtk: 10, baseDef: 3, goldReward: 56 },
  floor_warden: { id: 'floor_warden', name: 'Zenexis Overlord', baseHp: 56, baseAtk: 11, baseDef: 4, goldReward: 180 },
};

function validateCustomMap(map) {
  const errors = [];
  const warnings = [];
  const { width, height, tiles, spawn, exit } = map;

  if (!width || !height || width < 5 || height < 5) {
    errors.push(`Map dimensions must be at least 5x5 (currently ${width}x${height}).`);
  }
  if (!tiles || tiles.length !== height) {
    errors.push(`Tile row count does not match height.`);
  }

  if (spawn.x < 0 || spawn.x >= width || spawn.y < 0 || spawn.y >= height) {
    errors.push(`Hero spawn position (${spawn.x}, ${spawn.y}) is outside map boundaries.`);
  } else if (tiles[spawn.y]?.[spawn.x] === '#') {
    errors.push(`Hero spawn at (${spawn.x}, ${spawn.y}) is blocked by a wall.`);
  }

  if (exit.x < 0 || exit.x >= width || exit.y < 0 || exit.y >= height) {
    errors.push(`Exit stairs position (${exit.x}, ${exit.y}) is outside map boundaries.`);
  } else if (tiles[exit.y]?.[exit.x] === '#') {
    errors.push(`Exit stairs at (${exit.x}, ${exit.y}) are blocked by a wall.`);
  }

  if (spawn.x === exit.x && spawn.y === exit.y) {
    errors.push('Hero spawn and exit stairs cannot occupy the exact same tile.');
  }

  let bossCount = 0;
  for (const entity of (map.entities || [])) {
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
    return { valid: false, reachable: false, pathLength: null, pathCoords: [], errors, warnings };
  }

  // BFS
  const queue = [{ x: spawn.x, y: spawn.y, path: [{ x: spawn.x, y: spawn.y }] }];
  const visited = new Set([`${spawn.x},${spawn.y}`]);
  let foundPath = null;
  const directions = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ];

  while (queue.length > 0) {
    const current = queue.shift();
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
      if (tiles[ny][nx] === '#') continue;

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
    return { valid: false, reachable: false, pathLength: null, pathCoords: [], errors, warnings };
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

function encodeCustomMap(map) {
  const minified = {
    v: 1,
    n: map.name,
    a: map.author,
    d: map.description || '',
    w: map.width,
    h: map.height,
    t: map.tiles.map((row) => (Array.isArray(row) ? row.join('') : row)),
    s: [map.spawn.x, map.spawn.y],
    e: [map.exit.x, map.exit.y],
    ent: (map.entities || []).map((en) => [
      en.kind === 'enemy' ? 0 : en.kind === 'trap' ? 1 : 2,
      en.subType,
      en.x,
      en.y,
      en.goldAmount || 0,
    ]),
  };

  const json = JSON.stringify(minified);
  return Buffer.from(json, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function decodeCustomMap(code) {
  if (!code || typeof code !== 'string') return null;
  try {
    let base64 = code.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) base64 += '=';
    const json = Buffer.from(base64, 'base64').toString('utf8');
    const min = JSON.parse(json);
    if (!min || min.v !== 1 || !min.w || !min.h || !Array.isArray(min.t)) return null;

    const width = Number(min.w);
    const height = Number(min.h);
    const tiles = min.t.map((rowStr) => rowStr.split('').slice(0, width));

    const spawn = Array.isArray(min.s) && min.s.length >= 2 ? { x: Number(min.s[0]), y: Number(min.s[1]) } : { x: 1, y: 1 };
    const exit = Array.isArray(min.e) && min.e.length >= 2 ? { x: Number(min.e[0]), y: Number(min.e[1]) } : { x: width - 2, y: height - 2 };

    const entities = [];
    if (Array.isArray(min.ent)) {
      for (let i = 0; i < min.ent.length; i++) {
        const item = min.ent[i];
        if (!Array.isArray(item) || item.length < 4) continue;
        const kind = item[0] === 0 ? 'enemy' : item[0] === 1 ? 'trap' : 'loot';
        entities.push({
          id: `imp_${i}`,
          kind,
          subType: item[1],
          x: Number(item[2]),
          y: Number(item[3]),
          goldAmount: item[4] ? Number(item[4]) : undefined,
        });
      }
    }

    return {
      version: 1,
      id: 'cmap_test',
      name: String(min.n || 'Imported Crypt'),
      author: String(min.a || 'Anonymous'),
      description: min.d ? String(min.d) : undefined,
      width,
      height,
      tiles,
      spawn,
      exit,
      entities,
      createdAt: Date.now(),
    };
  } catch {
    return null;
  }
}

function applyDamageToHero(hero, rawDmg) {
  const shieldAbsorbed = Math.min(hero.shield, rawDmg);
  const hpLost = Math.max(0, rawDmg - shieldAbsorbed);
  return {
    nextHero: {
      ...hero,
      shield: hero.shield - shieldAbsorbed,
      hp: Math.max(0, hero.hp - hpLost),
    },
    shieldAbsorbed,
    hpLost,
  };
}

function findNextStepBFS(floor, startX, startY, goalX, goalY, blockedCoords) {
  if (startX === goalX && startY === goalY) return null;
  const queue = [{ x: startX, y: startY, firstStep: null }];
  const visited = new Set([`${startX},${startY}`]);
  const dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];

  while (queue.length > 0) {
    const curr = queue.shift();
    for (const { dx, dy } of dirs) {
      const nx = curr.x + dx;
      const ny = curr.y + dy;
      const key = `${nx},${ny}`;
      if (nx < 0 || nx >= floor.width || ny < 0 || ny >= floor.height) continue;
      if (visited.has(key)) continue;
      if (floor.tiles[ny][nx] === 'WALL') continue;

      const isGoal = nx === goalX && ny === goalY;
      if (!isGoal && blockedCoords.has(key)) continue;

      const firstStep = curr.firstStep || { x: nx, y: ny };
      if (isGoal) return firstStep;

      visited.add(key);
      queue.push({ x: nx, y: ny, firstStep });
    }
  }
  return null;
}

// ============================================================================
// 2. TEST SUITES
// ============================================================================

test('FEATURE: Custom Level Builder - BFS Reachability Validation', async (t) => {
  await t.test('detects reachable exit in a clear room', () => {
    const map = {
      version: 1,
      id: 'test_1',
      name: 'Open Hall',
      author: 'Tester',
      width: 7,
      height: 7,
      tiles: [
        ['#', '#', '#', '#', '#', '#', '#'],
        ['#', '.', '.', '.', '.', '.', '#'],
        ['#', '.', '.', '.', '.', '.', '#'],
        ['#', '.', '.', '.', '.', '.', '#'],
        ['#', '.', '.', '.', '.', '.', '#'],
        ['#', '.', '.', '.', '.', '>', '#'],
        ['#', '#', '#', '#', '#', '#', '#'],
      ],
      spawn: { x: 1, y: 1 },
      exit: { x: 5, y: 5 },
      entities: [],
      createdAt: Date.now(),
    };

    const res = validateCustomMap(map);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.reachable, true);
    assert.strictEqual(res.pathLength, 8); // Manhattan distance: |5-1| + |5-1| = 8
    assert.strictEqual(res.errors.length, 0);
    assert.deepStrictEqual(res.pathCoords[0], { x: 1, y: 1 });
    assert.deepStrictEqual(res.pathCoords[res.pathCoords.length - 1], { x: 5, y: 5 });
  });

  await t.test('detects unreachable exit when blocked by a solid wall', () => {
    const map = {
      version: 1,
      id: 'test_2',
      name: 'Walled Room',
      author: 'Tester',
      width: 7,
      height: 7,
      tiles: [
        ['#', '#', '#', '#', '#', '#', '#'],
        ['#', '.', '.', '#', '.', '.', '#'],
        ['#', '.', '.', '#', '.', '.', '#'],
        ['#', '.', '.', '#', '.', '.', '#'],
        ['#', '.', '.', '#', '.', '.', '#'],
        ['#', '.', '.', '#', '.', '>', '#'],
        ['#', '#', '#', '#', '#', '#', '#'],
      ],
      spawn: { x: 1, y: 1 },
      exit: { x: 5, y: 5 },
      entities: [],
      createdAt: Date.now(),
    };

    const res = validateCustomMap(map);
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.reachable, false);
    assert.strictEqual(res.pathLength, null);
    assert.ok(res.errors.some((e) => e.includes('unreachable')));
  });

  await t.test('successfully finds winding solution in a complex maze', () => {
    const map = {
      version: 1,
      id: 'test_maze',
      name: 'S-Maze',
      author: 'Tester',
      width: 7,
      height: 7,
      tiles: [
        ['#', '#', '#', '#', '#', '#', '#'],
        ['#', '.', '.', '.', '.', '.', '#'],
        ['#', '#', '#', '#', '#', '.', '#'],
        ['#', '.', '.', '.', '.', '.', '#'],
        ['#', '.', '#', '#', '#', '#', '#'],
        ['#', '.', '.', '.', '.', '>', '#'],
        ['#', '#', '#', '#', '#', '#', '#'],
      ],
      spawn: { x: 1, y: 1 },
      exit: { x: 5, y: 5 },
      entities: [],
      createdAt: Date.now(),
    };

    const res = validateCustomMap(map);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.reachable, true);
    assert.ok(res.pathLength > 12);
  });

  await t.test('rejects spawn placed directly on a wall tile', () => {
    const map = {
      version: 1,
      id: 'test_spawn_wall',
      name: 'Bad Spawn',
      author: 'Tester',
      width: 6,
      height: 6,
      tiles: [
        ['#', '#', '#', '#', '#', '#'],
        ['#', '#', '.', '.', '.', '#'],
        ['#', '.', '.', '.', '.', '#'],
        ['#', '.', '.', '.', '.', '#'],
        ['#', '.', '.', '.', '>', '#'],
        ['#', '#', '#', '#', '#', '#'],
      ],
      spawn: { x: 1, y: 1 }, // On wall!
      exit: { x: 4, y: 4 },
      entities: [],
      createdAt: Date.now(),
    };

    const res = validateCustomMap(map);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes('Hero spawn') && e.includes('wall')));
  });

  await t.test('rejects exit stairs placed directly on a wall tile', () => {
    const map = {
      version: 1,
      id: 'test_exit_wall',
      name: 'Bad Exit',
      author: 'Tester',
      width: 6,
      height: 6,
      tiles: [
        ['#', '#', '#', '#', '#', '#'],
        ['#', '.', '.', '.', '.', '#'],
        ['#', '.', '.', '.', '.', '#'],
        ['#', '.', '.', '.', '.', '#'],
        ['#', '.', '.', '.', '#', '#'],
        ['#', '#', '#', '#', '#', '#'],
      ],
      spawn: { x: 1, y: 1 },
      exit: { x: 4, y: 4 }, // On wall!
      entities: [],
      createdAt: Date.now(),
    };

    const res = validateCustomMap(map);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes('Exit stairs') && e.includes('wall')));
  });

  await t.test('rejects enemy spawned directly on top of hero spawn position', () => {
    const map = {
      version: 1,
      id: 'test_enemy_spawn',
      name: 'Enemy Ambush',
      author: 'Tester',
      width: 6,
      height: 6,
      tiles: [
        ['#', '#', '#', '#', '#', '#'],
        ['#', '.', '.', '.', '.', '#'],
        ['#', '.', '.', '.', '.', '#'],
        ['#', '.', '.', '.', '.', '#'],
        ['#', '.', '.', '.', '>', '#'],
        ['#', '#', '#', '#', '#', '#'],
      ],
      spawn: { x: 1, y: 1 },
      exit: { x: 4, y: 4 },
      entities: [{ id: 'e1', kind: 'enemy', subType: 'scrap_rat', x: 1, y: 1 }],
      createdAt: Date.now(),
    };

    const res = validateCustomMap(map);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes('cannot spawn directly on top of the hero')));
  });

  await t.test('warns when map has more than 2 Zenexis Overlords', () => {
    const map = {
      version: 1,
      id: 'test_boss_swarm',
      name: 'Overlord Army',
      author: 'Tester',
      width: 7,
      height: 7,
      tiles: [
        ['#', '#', '#', '#', '#', '#', '#'],
        ['#', '.', '.', '.', '.', '.', '#'],
        ['#', '.', '.', '.', '.', '.', '#'],
        ['#', '.', '.', '.', '.', '.', '#'],
        ['#', '.', '.', '.', '.', '.', '#'],
        ['#', '.', '.', '.', '.', '>', '#'],
        ['#', '#', '#', '#', '#', '#', '#'],
      ],
      spawn: { x: 1, y: 1 },
      exit: { x: 5, y: 5 },
      entities: [
        { id: 'b1', kind: 'enemy', subType: 'floor_warden', x: 2, y: 2 },
        { id: 'b2', kind: 'enemy', subType: 'floor_warden', x: 3, y: 3 },
        { id: 'b3', kind: 'enemy', subType: 'floor_warden', x: 4, y: 4 },
      ],
      createdAt: Date.now(),
    };

    const res = validateCustomMap(map);
    assert.strictEqual(res.valid, true);
    assert.ok(res.warnings.some((w) => w.includes('Zenexis Overlords') && w.includes('extreme challenge')));
  });
});

test('FEATURE: Custom Level Builder - Map Serialization & Sharing', async (t) => {
  await t.test('encodes and decodes custom map with 100% roundtrip fidelity', () => {
    const original = {
      version: 1,
      id: 'cmap_vault',
      name: 'Ancient Vault',
      author: 'Cipher-01',
      description: 'Loot guarded by sentinels.',
      width: 8,
      height: 6,
      tiles: [
        ['#', '#', '#', '#', '#', '#', '#', '#'],
        ['#', '.', '.', '.', '#', '.', '.', '#'],
        ['#', '.', '#', '.', '.', '.', '.', '#'],
        ['#', '.', '#', '#', '#', '.', '.', '#'],
        ['#', '.', '.', '.', '.', '.', '>', '#'],
        ['#', '#', '#', '#', '#', '#', '#', '#'],
      ],
      spawn: { x: 1, y: 1 },
      exit: { x: 6, y: 4 },
      entities: [
        { id: 'e1', kind: 'enemy', subType: 'rust_sentinel', x: 3, y: 1 },
        { id: 't1', kind: 'trap', subType: 'biomine', x: 2, y: 2 },
        { id: 'l1', kind: 'loot', subType: 'gold', x: 5, y: 3, goldAmount: 75 },
      ],
      createdAt: 1731484800000,
    };

    const code = encodeCustomMap(original);
    assert.ok(typeof code === 'string');
    assert.ok(code.length > 20);
    // URL-safe checks
    assert.ok(!code.includes('+'));
    assert.ok(!code.includes('/'));
    assert.ok(!code.includes('='));

    const decoded = decodeCustomMap(code);
    assert.ok(decoded);
    assert.strictEqual(decoded.version, 1);
    assert.strictEqual(decoded.name, 'Ancient Vault');
    assert.strictEqual(decoded.author, 'Cipher-01');
    assert.strictEqual(decoded.width, 8);
    assert.strictEqual(decoded.height, 6);
    assert.strictEqual(decoded.spawn.x, 1);
    assert.strictEqual(decoded.spawn.y, 1);
    assert.strictEqual(decoded.exit.x, 6);
    assert.strictEqual(decoded.exit.y, 4);
    assert.strictEqual(decoded.entities.length, 3);
    assert.strictEqual(decoded.entities[0].kind, 'enemy');
    assert.strictEqual(decoded.entities[0].subType, 'rust_sentinel');
    assert.strictEqual(decoded.entities[2].goldAmount, 75);
  });

  await t.test('gracefully rejects corrupted or garbage strings without throwing', () => {
    assert.strictEqual(decodeCustomMap(''), null);
    assert.strictEqual(decodeCustomMap('???invalid-base64???'), null);
    assert.strictEqual(decodeCustomMap('e30='), null); // Empty object "{}"
    assert.strictEqual(decodeCustomMap('eyJ2IjoyfQ=='), null); // version 2 unsupported
  });
});

test('CORE MECHANICS: Game Engine Regression Suite', async (t) => {
  await t.test('Combat damage absorbs through shield before depleting health', () => {
    const hero = {
      hp: 30,
      maxHp: 30,
      shield: 10,
    };

    // Attack of 6: fully absorbed by 10 shield
    const r1 = applyDamageToHero(hero, 6);
    assert.strictEqual(r1.shieldAbsorbed, 6);
    assert.strictEqual(r1.hpLost, 0);
    assert.strictEqual(r1.nextHero.shield, 4);
    assert.strictEqual(r1.nextHero.hp, 30);

    // Follow-up attack of 12: 4 absorbed by shield, 8 penetrates HP
    const r2 = applyDamageToHero(r1.nextHero, 12);
    assert.strictEqual(r2.shieldAbsorbed, 4);
    assert.strictEqual(r2.hpLost, 8);
    assert.strictEqual(r2.nextHero.shield, 0);
    assert.strictEqual(r2.nextHero.hp, 22);
  });

  await t.test('BFS enemy AI paths around walls toward hero', () => {
    const floor = {
      width: 5,
      height: 5,
      tiles: [
        ['WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
        ['WALL', 'FLOOR', 'WALL', 'FLOOR', 'WALL'],
        ['WALL', 'FLOOR', 'WALL', 'FLOOR', 'WALL'],
        ['WALL', 'FLOOR', 'FLOOR', 'FLOOR', 'WALL'],
        ['WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
      ],
    };

    // Enemy at (1, 1), Hero at (3, 1). The wall at (2, 1) and (2, 2) forces path down through (1, 2)
    const nextStep = findNextStepBFS(floor, 1, 1, 3, 1, new Set());
    assert.ok(nextStep);
    assert.deepStrictEqual(nextStep, { x: 1, y: 2 });
  });

  await t.test('Enemy archetype catalog has correctly configured stats and rewards', () => {
    const warden = ENEMY_ARCHETYPES.floor_warden;
    assert.strictEqual(warden.name, 'Zenexis Overlord');
    assert.strictEqual(warden.baseHp, 56);
    assert.strictEqual(warden.baseAtk, 11);
    assert.strictEqual(warden.goldReward, 180);

    const rat = ENEMY_ARCHETYPES.scrap_rat;
    assert.strictEqual(rat.name, 'Scrap Rat');
    assert.strictEqual(rat.baseHp, 15);
  });
});

// ============================================================================
// 4. COMBAT ENHANCEMENTS, FLOOR CLEAR REWARDS & ESCAPE MECHANICS
// ============================================================================

function calculateFloorClearHealing(currentHp, maxHp) {
  const isBelow70 = currentHp < maxHp * 0.7;
  const percent = isBelow70 ? 25 : 15;
  const healAmount = Math.max(1, Math.round(maxHp * (percent / 100)));
  const newHp = Math.min(maxHp, currentHp + healAmount);
  return { healAmount, newHp, percent };
}

function canSelectFortifiedGuard(def) {
  return def < 5;
}

function applyLevelBoon(hero, boon) {
  if (boon === 'aggressive_stance') {
    const bonusAtk = Math.max(1, Math.round(hero.atk * 0.15));
    return {
      nextHero: { ...hero, atk: hero.atk + bonusAtk },
      statDeltaText: `+${bonusAtk} Attack (+15%)`,
    };
  } else {
    if (!canSelectFortifiedGuard(hero.def)) {
      throw new Error('Fortified Guard requires Defense < 5.');
    }
    const bonusDef = Math.max(1, Math.round(hero.def * 0.5));
    return {
      nextHero: { ...hero, def: hero.def + bonusDef },
      statDeltaText: `+${bonusDef} Defense (+50%)`,
    };
  }
}

function isClutchHealEligible(currentHp, maxHp) {
  return currentHp / maxHp < 0.1;
}

function calculateParryMitigationAndReflect(rawAttack) {
  const dmgTaken = Math.max(0, Math.round(rawAttack * 0.01));
  const counterDamage = Math.max(1, Math.round(rawAttack * 0.1));
  return { dmgTaken, counterDamage };
}

function isEmergencyFleeEligible(currentHp, maxHp) {
  return currentHp / maxHp < 0.1;
}

function calculateMonsterKnockback(floor, heroPos, enemyPos) {
  let dx = Math.sign(enemyPos.x - heroPos.x);
  let dy = Math.sign(enemyPos.y - heroPos.y);

  if (dx === 0 && dy === 0) {
    dx = 1;
  }

  const primary = { x: enemyPos.x + dx, y: enemyPos.y + dy };
  const isTileClear = (x, y) => {
    if (x < 0 || x >= floor.width || y < 0 || y >= floor.height) return false;
    if (floor.tiles[y][x] === 'WALL') return false;
    if (floor.enemies && floor.enemies.some((e) => e.x === x && e.y === y && !(e.x === enemyPos.x && e.y === enemyPos.y))) return false;
    if (x === heroPos.x && y === heroPos.y) return false;
    return true;
  };

  if (isTileClear(primary.x, primary.y)) {
    return primary;
  }

  const candidates = [
    { x: enemyPos.x + dx, y: enemyPos.y },
    { x: enemyPos.x, y: enemyPos.y + dy },
    { x: enemyPos.x - dy, y: enemyPos.y + dx },
    { x: enemyPos.x + dy, y: enemyPos.y - dx },
  ];

  for (const cand of candidates) {
    if (isTileClear(cand.x, cand.y)) {
      return cand;
    }
  }

  return { x: enemyPos.x, y: enemyPos.y };
}

test('FEATURE: Floor Clear Rewards, Clutch Barrier, Parry Counter & Smoke Screen', async (t) => {
  await t.test('Dynamic HP Recovery: restores +25% when HP < 70% and +15% when HP >= 70% capped at max HP', () => {
    // Case 1: HP < 70% of maxHp (20 / 40 = 50% < 70%)
    // Restores +25% of 40 = 10 HP -> 30 HP
    const r1 = calculateFloorClearHealing(20, 40);
    assert.strictEqual(r1.percent, 25);
    assert.strictEqual(r1.healAmount, 10);
    assert.strictEqual(r1.newHp, 30);

    // Case 2: HP >= 70% of maxHp (32 / 40 = 80% >= 70%)
    // Restores +15% of 40 = 6 HP -> 38 HP
    const r2 = calculateFloorClearHealing(32, 40);
    assert.strictEqual(r2.percent, 15);
    assert.strictEqual(r2.healAmount, 6);
    assert.strictEqual(r2.newHp, 38);

    // Case 3: Health cannot exceed Max HP (38 / 40 -> +6 would be 44, capped at 40)
    const r3 = calculateFloorClearHealing(38, 40);
    assert.strictEqual(r3.percent, 15);
    assert.strictEqual(r3.newHp, 40);
  });

  await t.test('Level-Up Boon: Aggressive Stance permanently increases Attack by +15%', () => {
    const hero = { atk: 10, def: 3 };
    const res = applyLevelBoon(hero, 'aggressive_stance');
    // 10 * 0.15 = 1.5 -> rounds to 2
    assert.strictEqual(res.nextHero.atk, 12);
    assert.ok(res.statDeltaText.includes('+2 Attack (+15%)'));
  });

  await t.test('Level-Up Boon: Fortified Guard permanently increases Defense by +50% only when DEF < 5', () => {
    // When hero DEF = 3 (< 5), selectable!
    const heroEligible = { atk: 8, def: 3 };
    assert.strictEqual(canSelectFortifiedGuard(heroEligible.def), true);
    const res = applyLevelBoon(heroEligible, 'fortified_guard');
    // 3 * 0.5 = 1.5 -> rounds to 2
    assert.strictEqual(res.nextHero.def, 5);

    // When hero DEF = 5, locked and throws if selected
    const heroMaxed = { atk: 8, def: 5 };
    assert.strictEqual(canSelectFortifiedGuard(heroMaxed.def), false);
    assert.throws(() => applyLevelBoon(heroMaxed, 'fortified_guard'), /Defense < 5/);
  });

  await t.test('Clutch Heal Invulnerability: detects < 10% HP threshold correctly', () => {
    // 2 / 30 = 6.67% < 10% -> eligible!
    assert.strictEqual(isClutchHealEligible(2, 30), true);
    // 1 / 40 = 2.5% < 10% -> eligible!
    assert.strictEqual(isClutchHealEligible(1, 40), true);
    // 3 / 30 = 10% -> not strictly below 10%
    assert.strictEqual(isClutchHealEligible(3, 30), false);
    // 15 / 30 = 50% -> not eligible
    assert.strictEqual(isClutchHealEligible(15, 30), false);
  });

  await t.test('Shield Counter-Attack: reduces incoming monster damage to 1% and reflects 10% counter', () => {
    // Raw incoming attack of 30:
    // 99% reduction -> 1% taken = 0.3 rounds to 0 dmg
    // 10% counter-damage = 3 dmg reflected
    const r1 = calculateParryMitigationAndReflect(30);
    assert.strictEqual(r1.dmgTaken, 0);
    assert.strictEqual(r1.counterDamage, 3);

    // Raw incoming attack of 100:
    // 99% reduction -> 1% taken = 1 dmg
    // 10% counter-damage = 10 dmg reflected
    const r2 = calculateParryMitigationAndReflect(100);
    assert.strictEqual(r2.dmgTaken, 1);
    assert.strictEqual(r2.counterDamage, 10);
  });

  await t.test('Emergency Smoke Screen Flee: detects < 10% HP and knocks monster 1 tile backward', () => {
    assert.strictEqual(isEmergencyFleeEligible(2, 30), true);
    assert.strictEqual(isEmergencyFleeEligible(10, 30), false);

    const floor = {
      width: 6,
      height: 6,
      tiles: [
        ['WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
        ['WALL', 'FLOOR', 'FLOOR', 'FLOOR', 'FLOOR', 'WALL'],
        ['WALL', 'FLOOR', 'FLOOR', 'FLOOR', 'FLOOR', 'WALL'],
        ['WALL', 'FLOOR', 'FLOOR', 'FLOOR', 'FLOOR', 'WALL'],
        ['WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
      ],
      enemies: [{ id: 'e1', x: 2, y: 2 }],
    };

    // Hero at (1, 2), Enemy at (2, 2). Knockback pushes enemy rightward to (3, 2)
    const pushed = calculateMonsterKnockback(floor, { x: 1, y: 2 }, { x: 2, y: 2 });
    assert.deepStrictEqual(pushed, { x: 3, y: 2 });
  });
});
