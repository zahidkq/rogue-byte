import { LegendaryWeapon } from '../types/game';

export interface BossRoastPayload {
  playerName: string;
  className: string;
  hp: number;
  maxHp: number;
  shield: number;
  weaponName: string;
  weaponLevel: number;
  atk: number;
  armorName: string;
  armorLevel: number;
  def: number;
  bossHp: number;
  bossMaxHp: number;
  turnNumber: number;
  potionsUsed: number;
  event: string;
  damageDealt?: number;
}

export interface BossWeaponPayload {
  playerName: string;
  className: string;
  weaponName: string;
  armorName: string;
  turnsTaken: number;
  potionsUsed: number;
  hpRemaining: number;
  maxHp: number;
  score: number;
  gold: number;
}

export function getLocalFallbackRoast(payload: BossRoastPayload): string {
  const hpRatio = payload.hp / Math.max(1, payload.maxHp);
  if (payload.event === 'player_potion' || payload.potionsUsed >= 2) {
    return `Guarding yourself with vial #${Math.max(1, payload.potionsUsed)}? Desperation looks terrible on you.`;
  }
  if (hpRatio <= 0.35) {
    return `Barely clinging to ${payload.hp} HP with ${payload.weaponName}? One more arc strike ends this.`;
  }
  if (payload.event === 'player_crit') {
    return `Lucky hit. Let's see if that ${payload.weaponName} survives a real exchange.`;
  }
  if (payload.weaponLevel <= 1) {
    return `Is that the best gear you could find? My plating dulls blades twice as sharp as ${payload.weaponName}.`;
  }
  if (payload.turnNumber >= 5) {
    return `Turn ${payload.turnNumber} and you're still swinging? You're running out of breath, ${payload.playerName}.`;
  }
  return `Is that the best gear you could find? Step forward and test your ${payload.armorName} against the sanctum core.`;
}

export function getLocalFallbackWeapon(payload: BossWeaponPayload): LegendaryWeapon {
  return {
    name: payload.turnsTaken <= 6 ? "Overlord's Execution Edge" : 'Zenexis Null-Breaker',
    description: `Claimed from the shattered sanctum core by ${payload.playerName} after enduring ${payload.turnsTaken} turns against the Overlord.`,
    bonusAtk: 5,
    loreTag: 'Boss Relic · Floor 3',
    source: 'fallback',
  };
}

export async function fetchBossRoast(
  payload: BossRoastPayload,
  signal?: AbortSignal
): Promise<{ line: string; source: 'gemini' | 'fallback' }> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 4500);

  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const res = await fetch('/api/boss/roast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    window.clearTimeout(timeout);
    if (!res.ok) {
      return { line: getLocalFallbackRoast(payload), source: 'fallback' };
    }
    const data = (await res.json()) as { line?: string; source?: 'gemini' | 'fallback' };
    if (!data.line) {
      return { line: getLocalFallbackRoast(payload), source: 'fallback' };
    }
    return { line: data.line, source: data.source ?? 'gemini' };
  } catch {
    window.clearTimeout(timeout);
    return { line: getLocalFallbackRoast(payload), source: 'fallback' };
  }
}

export async function fetchBossLegendaryWeapon(
  payload: BossWeaponPayload
): Promise<LegendaryWeapon> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 4800);

  try {
    const res = await fetch('/api/boss/weapon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    window.clearTimeout(timeout);
    if (!res.ok) {
      return getLocalFallbackWeapon(payload);
    }
    const data = (await res.json()) as LegendaryWeapon;
    if (!data || !data.name || !data.description) {
      return getLocalFallbackWeapon(payload);
    }
    return data;
  } catch {
    window.clearTimeout(timeout);
    return getLocalFallbackWeapon(payload);
  }
}
