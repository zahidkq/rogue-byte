import { HeroState, StatusEffect } from '../types/game';

export const POISON_COMBAT_POTENCY = 3; // 3-5 HP per turn
export const POISON_COMBAT_DURATION = 3; // 3 turns
export const POISON_EXPLORATION_INTERVAL = 3; // 1 damage every 3 steps

export const SLOW_COMBAT_DURATION = 3; // 3 turns
export const SLOW_EXPLORATION_DURATION = 6; // 6 steps

/**
 * Creates a new status effect instance
 */
export function createStatusEffect(
  type: 'poison' | 'slow',
  durationOverride?: number,
  potencyOverride?: number
): StatusEffect {
  if (type === 'poison') {
    return {
      id: `poison_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'poison',
      name: 'Poison',
      duration: durationOverride ?? POISON_COMBAT_DURATION,
      potency: potencyOverride ?? POISON_COMBAT_POTENCY,
      icon: '🧪',
    };
  }

  return {
    id: `slow_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: 'slow',
    name: 'Slow',
    duration: durationOverride ?? SLOW_COMBAT_DURATION,
    potency: potencyOverride ?? 1,
    icon: '❄️',
  };
}

/**
 * Checks if a hero has a specific status effect
 */
export function hasStatusEffect(hero: HeroState, type: 'poison' | 'slow'): boolean {
  return Boolean(hero.statusEffects?.some((e) => e.type === type && e.duration > 0));
}

/**
 * Applies or refreshes a status effect on the hero
 */
export function applyStatusEffect(hero: HeroState, effect: StatusEffect): HeroState {
  const current = hero.statusEffects ? [...hero.statusEffects] : [];
  const existingIdx = current.findIndex((e) => e.type === effect.type);

  if (existingIdx >= 0) {
    // Refresh with the higher duration & potency
    current[existingIdx] = {
      ...current[existingIdx],
      duration: Math.max(current[existingIdx].duration, effect.duration),
      potency: Math.max(current[existingIdx].potency, effect.potency),
    };
  } else {
    current.push(effect);
  }

  return {
    ...hero,
    statusEffects: current,
  };
}

/**
 * Cleanses all active status effects (used on potion drink or floor clear)
 */
export function cleanseStatusEffects(hero: HeroState): HeroState {
  if (!hero.statusEffects || hero.statusEffects.length === 0) return hero;
  return {
    ...hero,
    statusEffects: [],
  };
}

/**
 * Ticks status effects at the start of the player's turn in combat:
 * - Poison: deals tick damage equal to potency and decrements duration.
 * - Slow: decrements duration.
 */
export function tickCombatStatusEffects(hero: HeroState): {
  nextHero: HeroState;
  poisonDamage: number;
  expiredEffects: StatusEffect[];
  logMessages: string[];
} {
  if (!hero.statusEffects || hero.statusEffects.length === 0) {
    return { nextHero: hero, poisonDamage: 0, expiredEffects: [], logMessages: [] };
  }

  let poisonDamage = 0;
  const updatedEffects: StatusEffect[] = [];
  const expiredEffects: StatusEffect[] = [];
  const logMessages: string[] = [];

  for (const eff of hero.statusEffects) {
    if (eff.type === 'poison') {
      poisonDamage += eff.potency;
      const nextDuration = eff.duration - 1;
      logMessages.push(`Poison burns for -${eff.potency} HP! (${Math.max(0, nextDuration)} turns left)`);
      if (nextDuration > 0) {
        updatedEffects.push({ ...eff, duration: nextDuration });
      } else {
        expiredEffects.push(eff);
        logMessages.push('The poison in your veins has subsided.');
      }
    } else if (eff.type === 'slow') {
      const nextDuration = eff.duration - 1;
      if (nextDuration > 0) {
        updatedEffects.push({ ...eff, duration: nextDuration });
      } else {
        expiredEffects.push(eff);
        logMessages.push('Movement circuits restored to nominal speed.');
      }
    }
  }

  const nextHp = Math.max(0, hero.hp - poisonDamage);

  return {
    nextHero: {
      ...hero,
      hp: nextHp,
      statusEffects: updatedEffects,
    },
    poisonDamage,
    expiredEffects,
    logMessages,
  };
}

/**
 * Ticks status effects on each exploration step on the dungeon grid:
 * - Poison: deals 1 damage every 3 steps moved.
 * - Slow: decrements duration by 1 step.
 */
export function tickExplorationStep(
  hero: HeroState,
  currentPoisonStepCounter: number
): {
  nextHero: HeroState;
  nextPoisonStepCounter: number;
  poisonDamage: number;
  isPoisonTick: boolean;
  slowActive: boolean;
  logMessages: string[];
} {
  const current = hero.statusEffects ? [...hero.statusEffects] : [];
  if (current.length === 0) {
    return {
      nextHero: hero,
      nextPoisonStepCounter: 0,
      poisonDamage: 0,
      isPoisonTick: false,
      slowActive: false,
      logMessages: [],
    };
  }

  let poisonDamage = 0;
  let isPoisonTick = false;
  let nextCounter = currentPoisonStepCounter;
  const logMessages: string[] = [];
  const remainingEffects: StatusEffect[] = [];
  let slowActive = false;

  for (const eff of current) {
    if (eff.type === 'poison') {
      nextCounter += 1;
      if (nextCounter >= POISON_EXPLORATION_INTERVAL) {
        nextCounter = 0;
        poisonDamage += 1;
        isPoisonTick = true;
        const nextDuration = eff.duration - 1;
        logMessages.push(`Poison seeped in! Took -1 HP (${Math.max(0, nextDuration)} ticks left).`);
        if (nextDuration > 0) {
          remainingEffects.push({ ...eff, duration: nextDuration });
        } else {
          logMessages.push('Poison cleansed naturally.');
        }
      } else {
        remainingEffects.push(eff);
      }
    } else if (eff.type === 'slow') {
      slowActive = true;
      const nextDuration = eff.duration - 1;
      if (nextDuration > 0) {
        remainingEffects.push({ ...eff, duration: nextDuration });
      } else {
        logMessages.push('Full mobility regained.');
      }
    }
  }

  const nextHp = Math.max(0, hero.hp - poisonDamage);

  return {
    nextHero: {
      ...hero,
      hp: nextHp,
      statusEffects: remainingEffects,
    },
    nextPoisonStepCounter: nextCounter,
    poisonDamage,
    isPoisonTick,
    slowActive,
    logMessages,
  };
}

/**
 * Determines which debuffs are rolled on an enemy attack:
 * - Lower-floor beasts/spiders (scrap_rat, null_goblin, blight_drone): 25% chance of Poison
 * - Mid-floor golems/slimes (rust_sentinel, arcane_wraith, void_stalker): 20% chance of Slow
 * - Final Boss (floor_warden / isBoss): ultimate ability inflicting both Poison & Slow!
 */
export function rollEnemyAttackStatusEffects(
  archetypeId: string,
  isBoss: boolean,
  forcedRandomRoll?: number
): StatusEffect[] {
  const roll = forcedRandomRoll !== undefined ? forcedRandomRoll : Math.random();
  const effects: StatusEffect[] = [];

  if (isBoss || archetypeId === 'floor_warden') {
    // Boss has a 30% chance on strike to unleash ultimate twin debuffs
    if (roll < 0.35) {
      effects.push(createStatusEffect('poison', 3, 4));
      effects.push(createStatusEffect('slow', 3, 1));
    }
    return effects;
  }

  const lowerFloorBeasts = ['scrap_rat', 'null_goblin', 'blight_drone'];
  const midFloorGolems = ['rust_sentinel', 'arcane_wraith', 'void_stalker'];

  if (lowerFloorBeasts.includes(archetypeId)) {
    if (roll < 0.25) {
      effects.push(createStatusEffect('poison', 3, 3));
    }
  } else if (midFloorGolems.includes(archetypeId)) {
    if (roll < 0.20) {
      effects.push(createStatusEffect('slow', 3, 1));
    }
  }

  return effects;
}

/**
 * Computes flee probability adjusted by status effects
 */
export function calculateFleeProbability(hero: HeroState): number {
  if (hasStatusEffect(hero, 'slow')) {
    return 0.35; // Decreased escape chance under Slow
  }
  return 0.65; // Standard 65% escape chance
}
