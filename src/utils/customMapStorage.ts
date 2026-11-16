import { CustomMapData } from '../types/game';

const CUSTOM_MAPS_KEY = 'rogue_byte_custom_maps_v1';

/**
 * 3 Curated Built-in Showcase Maps for players to immediately explore or remix.
 */
export const SHOWCASE_MAPS: CustomMapData[] = [
  {
    version: 1,
    id: 'showcase_gauntlet',
    name: 'The Gauntlet',
    author: 'Zenexis Architect',
    description: 'A winding tactical maze guarded by sentinels and spike traps.',
    width: 17,
    height: 13,
    tiles: [
      ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
      ['#', '.', '.', '.', '#', '.', '.', '.', '.', '.', '#', '.', '.', '.', '.', '.', '#'],
      ['#', '.', '#', '.', '#', '.', '#', '#', '#', '.', '#', '.', '#', '#', '#', '.', '#'],
      ['#', '.', '#', '.', '.', '.', '.', '.', '#', '.', '.', '.', '.', '.', '#', '.', '#'],
      ['#', '.', '#', '#', '#', '#', '#', '.', '#', '#', '#', '#', '#', '.', '#', '.', '#'],
      ['#', '.', '.', '.', '.', '.', '#', '.', '.', '.', '.', '.', '#', '.', '.', '.', '#'],
      ['#', '#', '#', '#', '#', '.', '#', '#', '#', '#', '#', '.', '#', '#', '#', '.', '#'],
      ['#', '.', '.', '.', '#', '.', '.', '.', '.', '.', '#', '.', '.', '.', '#', '.', '#'],
      ['#', '.', '#', '.', '#', '#', '#', '#', '#', '.', '#', '#', '#', '.', '#', '.', '#'],
      ['#', '.', '#', '.', '.', '.', '.', '.', '#', '.', '.', '.', '#', '.', '.', '.', '#'],
      ['#', '.', '#', '#', '#', '#', '#', '.', '#', '#', '#', '.', '#', '#', '#', '.', '#'],
      ['#', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '>', '#'],
      ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
    ],
    spawn: { x: 1, y: 1 },
    exit: { x: 15, y: 11 },
    entities: [
      { id: 'sg1', kind: 'enemy', subType: 'scrap_rat', x: 3, y: 3 },
      { id: 'sg2', kind: 'enemy', subType: 'null_goblin', x: 7, y: 5 },
      { id: 'sg3', kind: 'enemy', subType: 'rust_sentinel', x: 13, y: 7 },
      { id: 'sg4', kind: 'enemy', subType: 'void_stalker', x: 13, y: 9 },
      { id: 'sg5', kind: 'trap', subType: 'spike', x: 5, y: 1 },
      { id: 'sg6', kind: 'trap', subType: 'arcsnare', x: 9, y: 9 },
      { id: 'sg7', kind: 'loot', subType: 'gold', x: 9, y: 3, goldAmount: 45 },
      { id: 'sg8', kind: 'loot', subType: 'med_vial', x: 1, y: 7 },
      { id: 'sg9', kind: 'loot', subType: 'aegis_cell', x: 7, y: 11 },
    ],
    createdAt: 1731484800000,
  },
  {
    version: 1,
    id: 'showcase_vault',
    name: 'Vault of Greed',
    author: 'Requisition Officer',
    description: 'High-density gold caches guarded by defensive automations and biomines.',
    width: 15,
    height: 11,
    tiles: [
      ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
      ['#', '.', '.', '.', '.', '#', '.', '.', '.', '#', '.', '.', '.', '.', '#'],
      ['#', '.', '#', '#', '.', '#', '.', '#', '.', '#', '.', '#', '#', '.', '#'],
      ['#', '.', '#', '.', '.', '.', '.', '#', '.', '.', '.', '.', '#', '.', '#'],
      ['#', '.', '.', '.', '#', '#', '.', '.', '.', '#', '#', '.', '.', '.', '#'],
      ['#', '#', '#', '.', '#', '.', '.', '.', '.', '.', '#', '.', '#', '#', '#'],
      ['#', '.', '.', '.', '#', '#', '.', '.', '.', '#', '#', '.', '.', '.', '#'],
      ['#', '.', '#', '.', '.', '.', '.', '#', '.', '.', '.', '.', '#', '.', '#'],
      ['#', '.', '#', '#', '.', '#', '.', '#', '.', '#', '.', '#', '#', '.', '#'],
      ['#', '.', '.', '.', '.', '#', '.', '.', '.', '#', '.', '.', '.', '>', '#'],
      ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
    ],
    spawn: { x: 1, y: 1 },
    exit: { x: 13, y: 9 },
    entities: [
      { id: 'sv1', kind: 'loot', subType: 'gold', x: 3, y: 1, goldAmount: 30 },
      { id: 'sv2', kind: 'loot', subType: 'gold', x: 11, y: 1, goldAmount: 30 },
      { id: 'sv3', kind: 'loot', subType: 'gold', x: 7, y: 4, goldAmount: 50 },
      { id: 'sv4', kind: 'loot', subType: 'overdrive_core', x: 7, y: 6 },
      { id: 'sv5', kind: 'loot', subType: 'shock_bomb', x: 1, y: 9 },
      { id: 'sv6', kind: 'enemy', subType: 'rust_sentinel', x: 7, y: 3 },
      { id: 'sv7', kind: 'enemy', subType: 'blight_drone', x: 7, y: 7 },
      { id: 'sv8', kind: 'trap', subType: 'biomine', x: 3, y: 7 },
      { id: 'sv9', kind: 'trap', subType: 'biomine', x: 11, y: 7 },
    ],
    createdAt: 1731484800000,
  },
  {
    version: 1,
    id: 'showcase_overlord',
    name: "Overlord's Sanctum",
    author: 'Zenexis Core',
    description: 'An expansive imperial throne room where the Zenexis Overlord awaits your challenge.',
    width: 19,
    height: 15,
    tiles: [
      ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
      ['#', '.', '.', '.', '.', '.', '.', '.', '#', '.', '#', '.', '.', '.', '.', '.', '.', '.', '#'],
      ['#', '.', '#', '#', '.', '#', '#', '.', '#', '.', '#', '.', '#', '#', '.', '#', '#', '.', '#'],
      ['#', '.', '#', '#', '.', '#', '#', '.', '.', '.', '.', '.', '#', '#', '.', '#', '#', '.', '#'],
      ['#', '.', '.', '.', '.', '.', '.', '.', '#', '#', '#', '.', '.', '.', '.', '.', '.', '.', '#'],
      ['#', '.', '#', '.', '#', '.', '#', '.', '.', '.', '.', '.', '#', '.', '#', '.', '#', '.', '#'],
      ['#', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '#'],
      ['#', '.', '#', '.', '#', '.', '#', '.', '#', '#', '#', '.', '#', '.', '#', '.', '#', '.', '#'],
      ['#', '.', '.', '.', '.', '.', '.', '.', '#', '.', '#', '.', '.', '.', '.', '.', '.', '.', '#'],
      ['#', '.', '#', '#', '.', '#', '#', '.', '#', '.', '#', '.', '#', '#', '.', '#', '#', '.', '#'],
      ['#', '.', '#', '#', '.', '#', '#', '.', '.', '.', '.', '.', '#', '#', '.', '#', '#', '.', '#'],
      ['#', '.', '.', '.', '.', '.', '.', '.', '#', '#', '#', '.', '.', '.', '.', '.', '.', '.', '#'],
      ['#', '.', '#', '.', '#', '.', '#', '.', '.', '.', '.', '.', '#', '.', '#', '.', '#', '.', '#'],
      ['#', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '>', '#'],
      ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
    ],
    spawn: { x: 1, y: 1 },
    exit: { x: 17, y: 13 },
    entities: [
      { id: 'so1', kind: 'enemy', subType: 'floor_warden', x: 9, y: 6 },
      { id: 'so2', kind: 'enemy', subType: 'arcane_wraith', x: 3, y: 6 },
      { id: 'so3', kind: 'enemy', subType: 'void_stalker', x: 15, y: 6 },
      { id: 'so4', kind: 'trap', subType: 'biomine', x: 7, y: 6 },
      { id: 'so5', kind: 'trap', subType: 'biomine', x: 11, y: 6 },
      { id: 'so6', kind: 'loot', subType: 'med_vial', x: 1, y: 13 },
      { id: 'so7', kind: 'loot', subType: 'aegis_cell', x: 9, y: 13 },
      { id: 'so8', kind: 'loot', subType: 'gold', x: 9, y: 2, goldAmount: 100 },
    ],
    createdAt: 1731484800000,
  },
];

/**
 * Loads custom maps from browser localStorage.
 */
export function loadSavedCustomMaps(): CustomMapData[] {
  try {
    const raw = localStorage.getItem(CUSTOM_MAPS_KEY);
    if (!raw) {
      return [...SHOWCASE_MAPS];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [...SHOWCASE_MAPS];
    }
    return parsed;
  } catch {
    return [...SHOWCASE_MAPS];
  }
}

/**
 * Persists a custom map to browser localStorage (upserts by id).
 */
export function saveCustomMap(map: CustomMapData): void {
  try {
    const list = loadSavedCustomMaps();
    const existingIdx = list.findIndex((m) => m.id === map.id);
    const updatedMap = { ...map, updatedAt: Date.now() };

    if (existingIdx >= 0) {
      list[existingIdx] = updatedMap;
    } else {
      list.unshift(updatedMap);
    }

    localStorage.setItem(CUSTOM_MAPS_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save custom map to localStorage:', err);
  }
}

/**
 * Removes a custom map by ID from localStorage.
 */
export function deleteCustomMap(id: string): void {
  try {
    const list = loadSavedCustomMaps().filter((m) => m.id !== id);
    localStorage.setItem(CUSTOM_MAPS_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to delete custom map from localStorage:', err);
  }
}

/**
 * Encodes a CustomMapData object into a compact, URL-safe base64 string.
 */
export function encodeCustomMap(map: CustomMapData): string {
  // Minify schema for compact transfer
  const minified = {
    v: 1,
    n: map.name,
    a: map.author,
    d: map.description || '',
    w: map.width,
    h: map.height,
    t: map.tiles.map((row) => row.join('')),
    s: [map.spawn.x, map.spawn.y],
    e: [map.exit.x, map.exit.y],
    ent: map.entities.map((en) => [
      en.kind === 'enemy' ? 0 : en.kind === 'trap' ? 1 : 2,
      en.subType,
      en.x,
      en.y,
      en.goldAmount ?? 0,
    ]),
  };

  const json = JSON.stringify(minified);
  // Universal browser + Node safe base64 encoding with UTF-8 support
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  // Node environment fallback for testing
  return Buffer.from(json, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decodes a compact base64 string back into a valid CustomMapData object.
 */
export function decodeCustomMap(code: string): CustomMapData | null {
  if (!code || typeof code !== 'string') return null;

  try {
    // Restore standard base64 from URL-safe format
    let base64 = code.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    let json = '';
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      const binary = window.atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      json = new TextDecoder().decode(bytes);
    } else {
      json = Buffer.from(base64, 'base64').toString('utf8');
    }

    const min = JSON.parse(json);
    if (!min || min.v !== 1 || !min.w || !min.h || !Array.isArray(min.t)) {
      return null;
    }

    const width = Number(min.w);
    const height = Number(min.h);
    const tiles: ('#' | '.' | '>')[][] = min.t.map((rowStr: string) =>
      rowStr.split('').slice(0, width) as ('#' | '.' | '>')[]
    );

    const spawn = Array.isArray(min.s) && min.s.length >= 2
      ? { x: Number(min.s[0]), y: Number(min.s[1]) }
      : { x: 1, y: 1 };

    const exit = Array.isArray(min.e) && min.e.length >= 2
      ? { x: Number(min.e[0]), y: Number(min.e[1]) }
      : { x: width - 2, y: height - 2 };

    const entities: CustomMapData['entities'] = [];
    if (Array.isArray(min.ent)) {
      for (let i = 0; i < min.ent.length; i++) {
        const item = min.ent[i];
        if (!Array.isArray(item) || item.length < 4) continue;
        const kindCode = item[0];
        const kind = kindCode === 0 ? 'enemy' : kindCode === 1 ? 'trap' : 'loot';
        const subType = item[1];
        const x = Number(item[2]);
        const y = Number(item[3]);
        const goldAmount = item[4] ? Number(item[4]) : undefined;

        entities.push({
          id: `imp_${i}_${Date.now()}`,
          kind,
          subType,
          x,
          y,
          goldAmount,
        });
      }
    }

    return {
      version: 1,
      id: `cmap_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
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
      updatedAt: Date.now(),
    };
  } catch (err) {
    console.error('Failed to decode custom map string:', err);
    return null;
  }
}

/**
 * Generates a full shareable URL containing the encoded custom map hash.
 */
export function getShareUrl(map: CustomMapData): string {
  const code = encodeCustomMap(map);
  if (typeof window !== 'undefined') {
    const origin = window.location.origin + window.location.pathname;
    return `${origin}#map=${code}`;
  }
  return `#map=${code}`;
}

/**
 * Checks the browser URL for any `#map=...` hash or `?map=...` query parameter
 * and decodes it if present.
 */
export function getMapFromUrl(): CustomMapData | null {
  if (typeof window === 'undefined') return null;

  try {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#map=')) {
      const code = hash.slice(5);
      return decodeCustomMap(code);
    }

    const searchParams = new URLSearchParams(window.location.search);
    const queryCode = searchParams.get('map');
    if (queryCode) {
      return decodeCustomMap(queryCode);
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Clears the map payload parameter from the URL bar without reloading the page.
 */
export function clearUrlMapParam(): void {
  if (typeof window === 'undefined') return;
  try {
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState(null, '', cleanUrl);
  } catch {
    // ignore
  }
}
