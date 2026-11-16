export type GameScreen = 'TITLE' | 'PLAYING' | 'GAME_OVER' | 'VICTORY' | 'BUILDER';

export type HeroClassId = 'cipher' | 'volt' | 'aegis';

export interface HeroClassConfig {
  id: HeroClassId;
  name: string;
  role: string;
  description: string;
  maxHp: number;
  baseAtk: number;
  baseDef: number;
  critChance: number; // 0..1
  visionRadius: number;
  startingPotions: number;
  startingBombs: number;
  accentColor: string;
}

export type TileType = 'WALL' | 'FLOOR' | 'STAIRS';

export type TrapType = 'spike' | 'biomine' | 'arcsnare';

export interface Trap {
  id: string;
  type: TrapType;
  name: string;
  x: number;
  y: number;
  damage: number;
  triggered: boolean;
  revealed: boolean;
}

export type LootType = 'gold' | 'med_vial' | 'aegis_cell' | 'overdrive_core' | 'shock_bomb';

export type ItemRarity = 'common' | 'rare' | 'legendary' | 'cursed';

export interface LootDrop {
  id: string;
  type: LootType;
  name: string;
  x: number;
  y: number;
  amount: number;
  rarity: ItemRarity;
}

export type InventoryItemId = 'med_vial' | 'aegis_cell' | 'overdrive_core' | 'shock_bomb';

export interface InventoryItem {
  id: InventoryItemId;
  name: string;
  shortName: string;
  description: string;
  quantity: number;
  rarity: ItemRarity;
  usableInExploration: boolean;
  usableInCombat: boolean;
}

export type EnemyTier = 'standard' | 'elite' | 'warden';

export type EnemyArchetypeId =
  | 'scrap_rat'
  | 'null_goblin'
  | 'rust_sentinel'
  | 'blight_drone'
  | 'void_stalker'
  | 'arcane_wraith'
  | 'floor_warden';

export interface Enemy {
  id: string;
  archetypeId: EnemyArchetypeId;
  name: string;
  tier: EnemyTier;
  isBoss?: boolean;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  goldReward: number;
  scoreReward: number;
  alerted: boolean;
  description: string;
}

export interface RoomRect {
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
}

export interface DungeonFloor {
  floorNumber: number;
  width: number;
  height: number;
  tiles: TileType[][];
  explored: boolean[][];
  visible: boolean[][];
  rooms: RoomRect[];
  enemies: Enemy[];
  traps: Trap[];
  loot: LootDrop[];
  stairsPos: { x: number; y: number };
}

export interface HeroState {
  classId: HeroClassId;
  playerName?: string;
  name: string;
  x: number;
  y: number;
  facing: 'up' | 'down' | 'left' | 'right';
  horizontalFacing?: 'left' | 'right';
  hp: number;
  maxHp: number;
  shield: number;
  atk: number;
  def: number;
  critChance: number;
  visionRadius: number;
  gold: number;
  score: number;
  weaponLevel: number;
  armorLevel: number;
  weaponName: string;
  armorName: string;
  legendaryWeapon?: LegendaryWeapon;
}

export interface LegendaryWeapon {
  name: string;
  description: string;
  bonusAtk: number;
  loreTag?: string;
  source?: 'gemini' | 'fallback';
}

export interface LogEntry {
  id: string;
  turn: number;
  text: string;
  tone: 'neutral' | 'amber' | 'cyan' | 'emerald' | 'crimson' | 'violet';
}

export interface CombatLogEntry {
  id: string;
  text: string;
  tone: 'hero' | 'enemy' | 'system' | 'heal' | 'crit';
}

export interface CombatState {
  enemy: Enemy;
  turnNumber: number;
  heroDefending: boolean;
  heroBonusAtk: number;
  enemyStunned: boolean;
  phase: 'PLAYER_TURN' | 'ANIMATING' | 'VICTORY' | 'DEFEAT';
  logs: CombatLogEntry[];
  lastHeroHit: boolean;
  lastEnemyHit: boolean;
  heroAction?: 'attack' | 'defend' | 'item' | 'flinch' | null;
  actionTick?: number;
  rewardGold: number;
  rewardScore: number;
  droppedItemName: string | null;
  potionsUsed: number;
  bossRoast: string | null;
  bossRoastLoading: boolean;
  legendaryDrop: LegendaryWeapon | null;
  legendaryDropLoading: boolean;
}

export interface MerchantItem {
  id: string;
  category: 'weapon' | 'armor' | 'potion';
  name: string;
  description: string;
  cost: number;
  unique?: boolean;
  minFloor?: number;
  atkBonus?: number;
  defBonus?: number;
  shieldBonus?: number;
  maxHpBonus?: number;
  instantHeal?: number;
  inventoryItemId?: InventoryItemId;
}

export interface FloatingPopup {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
}

export interface ActiveRunState {
  hero: HeroState;
  floor: DungeonFloor;
  inventory: InventoryItem[];
  logs: LogEntry[];
  turn: number;
  enemiesDefeated: number;
  trapsTriggered: number;
  roomsDiscovered: number;
  encounteredArchetypes: EnemyArchetypeId[];
  purchasedShopIds?: string[];
  potionsUsedTotal?: number;
  isCustomMap?: boolean;
  customMapId?: string;
  customMapName?: string;
  startedAt: number;
}

export interface HighScoreEntry {
  id: string;
  playerName?: string;
  classId: HeroClassId;
  className: string;
  score: number;
  floor: number;
  gold: number;
  enemiesDefeated: number;
  victory?: boolean;
  causeOfDeath: string;
  legendaryWeapon?: LegendaryWeapon;
  timestamp: number;
}

export interface CareerRecords {
  bestScore: number;
  deepestFloor: number;
  totalRuns: number;
  totalVictories?: number;
  totalKills: number;
  totalGold: number;
  leaderboard: HighScoreEntry[];
}

export interface CustomMapEntity {
  id: string;
  kind: 'enemy' | 'trap' | 'loot';
  subType: EnemyArchetypeId | TrapType | LootType;
  x: number;
  y: number;
  goldAmount?: number;
}

export interface CustomMapData {
  version: 1;
  id: string;
  name: string;
  author: string;
  description?: string;
  width: number;
  height: number;
  tiles: ('#' | '.' | '>')[][]; // # = wall, . = floor, > = exit stairs
  spawn: { x: number; y: number };
  exit: { x: number; y: number };
  entities: CustomMapEntity[];
  createdAt: number;
  updatedAt?: number;
}

export interface MapValidationResult {
  valid: boolean;
  reachable: boolean;
  pathLength: number | null;
  pathCoords: { x: number; y: number }[];
  errors: string[];
  warnings: string[];
}

