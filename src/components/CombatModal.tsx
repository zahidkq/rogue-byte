import React, { useEffect, useState } from 'react';
import {
  Backpack,
  CheckCircle2,
  CloudFog,
  CornerUpLeft,
  Crown,
  Loader2,
  MessageSquare,
  MessageSquareWarning,
  Shield,
  Sparkles,
  Sword,
  Trophy,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CombatState, HeroState, InventoryItem, InventoryItemId } from '../types/game';
import { SegmentedBar } from './SegmentedBar';
import { EnemySprite, HeroSprite, ItemIcon } from './Sprites';
import { StatusBadges } from './StatusBadges';

export interface RunPerformanceStats {
  monstersSlain: number;
  totalDamageDealt: number;
  goldCollected: number;
  stepsTaken: number;
  potionsUsed: number;
  parriesLanded: number;
}

interface CombatModalProps {
  combat: CombatState;
  hero: HeroState;
  inventory: InventoryItem[];
  runStats?: RunPerformanceStats;
  onAttack: () => void;
  onDefend: () => void;
  onUseItem: (itemId: InventoryItemId) => void;
  onFlee: () => void;
  onVictoryContinue: () => void;
  onOpenFeedback?: () => void;
}

export const CombatModal: React.FC<CombatModalProps> = ({
  combat,
  hero,
  inventory,
  runStats,
  onAttack,
  onDefend,
  onUseItem,
  onFlee,
  onVictoryContinue,
  onOpenFeedback,
}) => {
  const [itemMenuOpen, setItemMenuOpen] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

  const usableItems = inventory.filter((i) => i.usableInCombat && i.quantity > 0);
  const isPlayerTurn = combat.phase === 'PLAYER_TURN';
  const isVictory = combat.phase === 'VICTORY';
  const isBoss = Boolean(combat.enemy.isBoss || combat.enemy.archetypeId === 'floor_warden');

  const stats: RunPerformanceStats = runStats || {
    monstersSlain: 1,
    totalDamageDealt: combat.damageDealtInFight || 45,
    goldCollected: hero.gold,
    stepsTaken: 36,
    potionsUsed: combat.potionsUsed,
    parriesLanded: combat.parriesLandedInFight || 0,
  };

  const getPerformanceTitle = (s: RunPerformanceStats) => {
    if (s.monstersSlain >= 8 && s.totalDamageDealt >= 160 && s.parriesLanded >= 2) {
      return 'S-Rank Dungeon Master';
    }
    if (s.totalDamageDealt >= 100 || s.monstersSlain >= 5) {
      return 'A-Rank Sanctum Cleanser';
    }
    if (s.monstersSlain >= 3) {
      return 'B-Rank Sector Vanguard';
    }
    return 'C-Rank Grid Operative';
  };

  const performanceTitle = getPerformanceTitle(stats);

  const handleCopyReport = async () => {
    const relicText = combat.legendaryDrop
      ? `\n🗡️ Relic: ${combat.legendaryDrop.name} (+${combat.legendaryDrop.bonusAtk} ATK)`
      : '';
    const text = [
      `⚔️ ZENEXIS RUN REPORT ⚔️`,
      `Operative: ${hero.playerName || hero.name} (${hero.classId.toUpperCase()})`,
      `Rank: ${performanceTitle}`,
      `🏆 Status: SANCTUM OVERLORD DEFEATED`,
      relicText,
      `👾 Monsters Slain: ${stats.monstersSlain}`,
      `💥 Total Damage: ${stats.totalDamageDealt}`,
      `💰 Final Gold: ${stats.goldCollected}`,
      `👣 Floor Steps: ${stats.stepsTaken}`,
      `🧪 Potions Consumed: ${stats.potionsUsed}`,
      `🛡️ Parries & Counters: ${stats.parriesLanded}`,
      `⚡ Zenexis Rogue-Byte ⚡`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedReport(true);
        setTimeout(() => setCopiedReport(false), 2500);
      }
    } catch {
      // Fallback
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    }
  };

  useEffect(() => {
    if (!isPlayerTurn) {
      setItemMenuOpen(false);
    }
  }, [isPlayerTurn]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isVictory) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
          e.preventDefault();
          onVictoryContinue();
        }
        return;
      }
      if (e.key === 'Escape' && itemMenuOpen) {
        e.preventDefault();
        setItemMenuOpen(false);
        return;
      }
      if (!isPlayerTurn) return;
      if (e.key === '1' || e.key === ' ') {
        e.preventDefault();
        onAttack();
      } else if (e.key === 'Enter' && !(document.activeElement instanceof HTMLButtonElement)) {
        e.preventDefault();
        onAttack();
      } else if (e.key === '2' || e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onDefend();
      } else if (e.key === '3' || e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setItemMenuOpen((prev) => !prev);
      } else if (e.key === '4' || e.key.toLowerCase() === 'f') {
        e.preventDefault();
        onFlee();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPlayerTurn, isVictory, itemMenuOpen, onAttack, onDefend, onFlee, onVictoryContinue]);

  const tierLabel = isBoss
    ? 'Final Sanctum Boss'
    : combat.enemy.tier === 'warden'
    ? 'Floor Warden'
    : combat.enemy.tier === 'elite'
    ? 'Elite Hostile'
    : 'Hostile Unit';

  const tierColor = isBoss
    ? 'text-[#d5c3ff]'
    : combat.enemy.tier === 'warden'
    ? 'text-[#ffc174]'
    : combat.enemy.tier === 'elite'
    ? 'text-[#d5c3ff]'
    : 'text-[#ffb4ab]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#060e20]/88 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={`Combat encounter with ${combat.enemy.name}`}
    >
      <div
        className={`w-full max-w-2xl rounded-lg bg-[#0f172a] overflow-hidden flex flex-col border max-h-[94vh] sm:max-h-[90vh] shadow-2xl ${
          isBoss
            ? 'border-[#8b5cf6]/75 shadow-[0_0_36px_rgba(139,92,246,0.28),0_18px_46px_rgba(0,0,0,0.9)]'
            : 'border-[#f59e0b]/45 shadow-[0_0_24px_rgba(245,158,11,0.18),0_16px_40px_rgba(0,0,0,0.85)]'
        }`}
      >
        {/* Top Encounter Header - Fixed (shrink-0) */}
        <div
          className={`shrink-0 px-4 sm:px-6 py-3 border-b border-white/10 flex items-center justify-between gap-4 ${
            isVictory
              ? 'bg-gradient-to-r from-[#064e3b] via-[#131b2e] to-[#064e3b]'
              : isBoss
              ? 'bg-gradient-to-r from-[#1e1b4b] via-[#171f33] to-[#2e1065]/70'
              : 'bg-[#131b2e]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isVictory ? (
              <Trophy className="w-4 h-4 text-[#fbbf24]" />
            ) : isBoss ? (
              <Crown className="w-4 h-4 text-[#fbbf24]" />
            ) : (
              <Sword className="w-4 h-4 text-[#f59e0b]" />
            )}
            <h2 className="font-display text-base sm:text-lg font-bold text-[#dae2fd]">
              {isVictory
                ? isBoss
                  ? 'Sanctum Overlord Defeated!'
                  : `Target Neutralized · ${combat.enemy.name}`
                : isBoss
                ? `Boss Encounter · ${combat.enemy.name}`
                : 'Tactical Encounter'}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#a08e7a] tabular-nums">
            {isVictory ? (
              <span className="px-2 py-0.5 rounded-[3px] bg-[#10b981]/20 border border-[#10b981]/40 text-[#6ee7b7] font-bold">
                VICTORY
              </span>
            ) : (
              <>
                <span>Turn {combat.turnNumber}</span>
                <span aria-hidden="true">·</span>
                <span className={tierColor}>{tierLabel}</span>
              </>
            )}
          </div>
        </div>

        {/* Scrollable Center Pane */}
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col bg-[#0b1326] space-y-4 p-4 sm:p-6">
          {/* Dynamic Boss Trash-Talk Speech Bubble (During Combat) */}
          {isBoss && !isVictory && (
            <AnimatePresence mode="wait">
              <motion.div
                key={combat.bossRoast || 'initial-boss-taunt'}
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative rounded-lg bg-[#1e1b4b]/75 border border-[#8b5cf6]/55 px-4 py-3 flex items-start gap-3 shadow-[0_0_18px_rgba(139,92,246,0.14)]"
              >
                <MessageSquareWarning className="w-4 h-4 text-[#d5c3ff] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-[#d5c3ff]">
                    <span>{combat.enemy.name}</span>
                    {combat.bossRoastLoading && (
                      <span className="text-[#a08e7a]">Responding...</span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#dae2fd] mt-0.5 leading-relaxed">
                    “{combat.bossRoast || 'Is that the best gear you could scavenge before stepping into my sanctum?'}”
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* VICTORY SHOWCASE FOR FINAL BOSS */}
          {isVictory && isBoss && (
            <div className="flex flex-col gap-4">
              {/* 1. Boss Parting Words */}
              <div className="relative rounded-lg bg-[#2e1065]/50 border border-[#8b5cf6]/50 p-4 flex flex-col gap-1.5 shadow-[0_0_20px_rgba(139,92,246,0.18)]">
                <div className="flex items-center justify-between text-xs font-mono text-[#d5c3ff]">
                  <span className="font-semibold flex items-center gap-1.5">
                    <MessageSquareWarning className="w-3.5 h-3.5 text-[#fbbf24]" />
                    {combat.enemy.name} · Terminal Signal
                  </span>
                  <span className="text-[10px] text-[#a08e7a] font-mono">Core Offline</span>
                </div>
                <p className="text-xs sm:text-sm italic text-[#e9d5ff] leading-relaxed">
                  “{combat.bossPartingWords ||
                    'Impossible... a mere biological operative dismantling my core matrix... The sanctum... is yours...'}”
                </p>
              </div>

              {/* 2. Holographic Legendary Weapon Card */}
              <div className="relative rounded-lg bg-gradient-to-br from-[#1c1917] via-[#0f172a] to-[#1e1b4b] border-2 border-[#f59e0b] p-4 flex flex-col gap-2.5 shadow-[0_0_28px_rgba(245,158,11,0.35)]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-[3px] bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#090d16] font-display text-[10px] font-black tracking-widest uppercase shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                      LEGENDARY
                    </span>
                    <span className="text-xs font-mono text-[#ffc174] font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
                      Sanctum Relic
                    </span>
                  </div>
                  {combat.legendaryDrop && (
                    <div className="flex items-center gap-2 text-xs font-mono font-bold">
                      <span className="text-[#4cd7f6]">+{combat.legendaryDrop.bonusAtk} ATK</span>
                      <span className="text-[#a78bfa]">+2 DEF</span>
                    </div>
                  )}
                </div>

                {combat.legendaryDropLoading && !combat.legendaryDrop ? (
                  <div className="py-2 text-xs font-mono text-[#a08e7a] flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#fbbf24]" />
                    <span>Extracting weapon lore from Overlord core...</span>
                  </div>
                ) : combat.legendaryDrop ? (
                  <>
                    <div className="font-display text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#fde68a] via-[#fbbf24] to-[#f59e0b]">
                      {combat.legendaryDrop.name}
                    </div>
                    <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
                      {combat.legendaryDrop.description}
                    </p>
                  </>
                ) : null}
              </div>

              {/* 3. Run Performance Infographic */}
              <div className="rounded-lg bg-[#131b2e] border border-white/10 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#fbbf24]" />
                    <span className="font-display text-sm font-bold text-[#dae2fd]">
                      Run Performance Infographic
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-[3px] bg-[#fbbf24]/20 border border-[#fbbf24]/50 text-[#fbbf24] font-display text-xs font-bold uppercase tracking-wider">
                    {performanceTitle}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                  <div className="p-2 rounded-[4px] bg-[#060e20] border border-white/5 flex flex-col gap-0.5">
                    <span className="text-[#a08e7a] text-[10px]">Monsters Slain</span>
                    <span className="text-[#f59e0b] font-bold text-sm">{stats.monstersSlain}</span>
                  </div>
                  <div className="p-2 rounded-[4px] bg-[#060e20] border border-white/5 flex flex-col gap-0.5">
                    <span className="text-[#a08e7a] text-[10px]">Damage Dealt</span>
                    <span className="text-[#4cd7f6] font-bold text-sm">{stats.totalDamageDealt}</span>
                  </div>
                  <div className="p-2 rounded-[4px] bg-[#060e20] border border-white/5 flex flex-col gap-0.5">
                    <span className="text-[#a08e7a] text-[10px]">Final Gold</span>
                    <span className="text-[#ffc174] font-bold text-sm">{stats.goldCollected}</span>
                  </div>
                  <div className="p-2 rounded-[4px] bg-[#060e20] border border-white/5 flex flex-col gap-0.5">
                    <span className="text-[#a08e7a] text-[10px]">Floor Steps</span>
                    <span className="text-[#94a3b8] font-bold text-sm">{stats.stepsTaken}</span>
                  </div>
                  <div className="p-2 rounded-[4px] bg-[#060e20] border border-white/5 flex flex-col gap-0.5">
                    <span className="text-[#a08e7a] text-[10px]">Potions Consumed</span>
                    <span className="text-[#6ee7b7] font-bold text-sm">{stats.potionsUsed}</span>
                  </div>
                  <div className="p-2 rounded-[4px] bg-[#060e20] border border-white/5 flex flex-col gap-0.5">
                    <span className="text-[#a08e7a] text-[10px]">Counters Landed</span>
                    <span className="text-[#d5c3ff] font-bold text-sm">{stats.parriesLanded}</span>
                  </div>
                </div>

                {/* Copy Run Report button */}
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-[4px] bg-[#06b6d4]/15 border border-[#06b6d4]/50 hover:bg-[#06b6d4]/25 text-[#4cd7f6] text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  {copiedReport ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#6ee7b7]" />
                      <span className="text-[#6ee7b7]">Copied Run Report to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <span>📋</span>
                      <span>Copy Run Report (Discord / Twitter)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Combatants Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hero Card */}
            <div
              className={`rounded-lg bg-[#131b2e] border p-4 flex flex-col gap-3 transition-colors ${
                combat.clutchBarrierActive
                  ? 'border-[#f59e0b] shadow-[0_0_24px_rgba(245,158,11,0.45)]'
                  : combat.lastHeroHit
                  ? 'animate-hit-shake border-[#ef4444]'
                  : combat.heroDefending
                  ? 'border-[#06b6d4]'
                  : 'border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  key={`hero-avatar-${combat.actionTick ?? 0}-${combat.lastHeroHit ? 'hit' : 'ok'}`}
                  className={`relative w-14 h-14 rounded-[4px] bg-[#060e20] border flex items-center justify-center shrink-0 overflow-visible transition-colors ${
                    combat.clutchBarrierActive
                      ? 'border-[#f59e0b] animate-gold-barrier'
                      : combat.lastHeroHit
                      ? 'border-[#ef4444] animate-hero-flinch shadow-[0_0_14px_rgba(239,68,68,0.45)]'
                      : combat.heroAction === 'attack'
                      ? 'border-[#f59e0b] animate-hero-lunge shadow-[0_0_16px_rgba(245,158,11,0.45)]'
                      : combat.heroDefending
                      ? 'border-[#06b6d4] shadow-[0_0_14px_rgba(6,182,212,0.35)]'
                      : 'border-[#f59e0b]/30'
                  }`}
                >
                  <div className="w-11 h-11 animate-hero-idle flex items-center justify-center">
                    <HeroSprite classId={hero.classId} className="w-full h-full" />
                  </div>
                  {combat.lastHeroHit && (
                    <div
                      className="pointer-events-none absolute inset-0 rounded-[4px] bg-[#ef4444]/65 animate-hit-flash"
                      aria-hidden="true"
                    />
                  )}
                  {combat.parryActive && (
                    <div
                      className="pointer-events-none absolute inset-0 rounded-[4px] bg-[#06b6d4]/60 animate-parry-flash"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-base font-bold text-[#dae2fd] truncate">
                    {hero.playerName ? `${hero.playerName} · ${hero.name}` : hero.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#a08e7a] tabular-nums mt-0.5">
                    <span>ATK {hero.atk + combat.heroBonusAtk}</span>
                    <span aria-hidden="true">·</span>
                    <span>DEF {hero.def}</span>
                    {isBoss && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>Vials {combat.potionsUsed}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Gold Clutch Barrier Alert */}
              {combat.clutchBarrierActive && (
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] bg-[#f59e0b]/20 border border-[#f59e0b] text-xs font-mono text-[#ffc174] font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                  <Sparkles className="w-3.5 h-3.5 text-[#fbbf24] animate-spin" />
                  <span>GOLD BARRIER ACTIVE: 0 Damage Next Hit!</span>
                </div>
              )}

              <SegmentedBar
                current={hero.hp}
                max={hero.maxHp}
                color="crimson"
                label="HP"
              />

              {/* Status Badges */}
              <StatusBadges statusEffects={hero.statusEffects} />

              {hero.shield > 0 && (
                <SegmentedBar
                  current={hero.shield}
                  max={Math.max(10, hero.shield)}
                  segments={8}
                  color="cyan"
                  label="Kinetic Shield"
                />
              )}

              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#a08e7a]">
                <span>{hero.weaponName} +{hero.weaponLevel}</span>
                <span aria-hidden="true">·</span>
                <span>{hero.armorName} +{hero.armorLevel}</span>
              </div>

              {(combat.heroDefending || combat.heroBonusAtk > 0) && (
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono pt-0.5">
                  {combat.heroDefending && (
                    <span className="text-[#4cd7f6] font-semibold">
                      Parry &amp; Counter Active (99% Block + 10% Reflect)
                    </span>
                  )}
                  {combat.heroBonusAtk > 0 && (
                    <span className="text-[#ffc174]">
                      Overdrive +{combat.heroBonusAtk} ATK
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Enemy Card */}
            <div
              className={`rounded-lg bg-[#131b2e] border p-4 flex flex-col gap-3 transition-colors ${
                combat.lastEnemyHit
                  ? 'animate-hit-shake border-[#f59e0b]'
                  : combat.enemyStunned
                  ? 'border-[#8b5cf6]'
                  : isBoss
                  ? 'border-[#8b5cf6]/50'
                  : 'border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  key={`enemy-avatar-${combat.actionTick ?? 0}-${combat.lastEnemyHit ? 'hit' : 'ok'}`}
                  className={`relative rounded-[4px] bg-[#060e20] flex items-center justify-center shrink-0 border ${
                    isBoss
                      ? 'w-16 h-16 border-[#8b5cf6]/60 shadow-[0_0_14px_rgba(139,92,246,0.3)]'
                      : 'w-14 h-14 border-[#ef4444]/35'
                  } ${combat.lastEnemyHit ? 'animate-hit-shake' : ''}`}
                >
                  <EnemySprite
                    archetypeId={combat.enemy.archetypeId}
                    className={`${isBoss ? 'w-13 h-13' : 'w-11 h-11'} ${
                      isVictory ? 'opacity-30 grayscale' : ''
                    }`}
                  />
                  {combat.lastEnemyHit && (
                    <div
                      className="pointer-events-none absolute inset-0 rounded-[4px] bg-[#ef4444]/60 animate-hit-flash"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-base font-bold text-[#dae2fd] truncate">
                    {combat.enemy.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#a08e7a] tabular-nums mt-0.5">
                    <span>ATK {combat.enemy.atk}</span>
                    <span aria-hidden="true">·</span>
                    <span>DEF {combat.enemy.def}</span>
                  </div>
                </div>
              </div>

              <SegmentedBar
                current={combat.enemy.hp}
                max={combat.enemy.maxHp}
                color={isBoss ? 'violet' : 'amber'}
                label={isBoss ? 'Boss Integrity' : 'Hostile HP'}
              />

              <p className="text-xs text-[#a08e7a] leading-snug">
                {combat.enemyStunned
                  ? 'Stunned — skips next attack!'
                  : combat.enemy.description}
              </p>
            </div>
          </div>

          {/* Combat Log */}
          <div className="rounded-lg bg-[#060e20] border border-white/10 p-3">
            <div className="flex flex-col gap-1 max-h-24 overflow-y-auto text-xs font-mono">
              {combat.logs.map((entry) => {
                const toneClass =
                  entry.tone === 'crit'
                    ? 'text-[#ffc174] font-semibold'
                    : entry.tone === 'hero'
                    ? 'text-[#4cd7f6]'
                    : entry.tone === 'enemy'
                    ? 'text-[#ffb4ab]'
                    : entry.tone === 'heal'
                    ? 'text-[#6ee7b7]'
                    : 'text-[#a08e7a]';
                return (
                  <div key={entry.id} className={toneClass}>
                    <span className="text-[#534434] mr-2">&gt;</span>
                    {entry.text}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pinned Action Deck or Victory Banner (shrink-0) - ALWAYS VISIBLE */}
        <div className="shrink-0 p-3.5 sm:p-5 bg-[#131b2e] border-t border-white/10 flex flex-col gap-3">
          {isVictory ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6ee7b7]" />
                  <span className="font-display text-base font-bold text-[#6ee7b7]">
                    {isBoss ? 'Final Sanctum Boss Slain!' : 'Target Neutralized'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#a08e7a] tabular-nums">
                  <span className="text-[#ffc174]">+{combat.rewardGold} Gold</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#4cd7f6]">+{combat.rewardScore} Score</span>
                  {isBoss && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#d5c3ff]">+500 Sanctum Bonus</span>
                    </>
                  )}
                  {combat.droppedItemName && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#d5c3ff]">Found {combat.droppedItemName}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                {onOpenFeedback && (
                  <button
                    type="button"
                    onClick={onOpenFeedback}
                    className="inline-flex items-center gap-1.5 px-3 py-3 rounded-[4px] bg-[#06b6d4]/15 border border-[#06b6d4]/50 hover:bg-[#06b6d4]/25 text-[#4cd7f6] text-xs font-mono font-semibold transition-colors cursor-pointer"
                    title="Send feedback directly to development team"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Feedback</span>
                  </button>
                )}
                <button
                  type="button"
                  autoFocus
                  onClick={onVictoryContinue}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[4px] bg-gradient-to-r from-[#f59e0b] via-[#fbbf24] to-[#f59e0b] text-[#090d16] font-display text-sm font-bold uppercase tracking-wider border-t border-[#fde68a] shadow-[0_0_22px_rgba(245,158,11,0.55)] hover:brightness-110 active:translate-y-px transition-all cursor-pointer animate-pulse"
                >
                  <Trophy className="w-4 h-4 text-[#090d16]" />
                  <span>{isBoss ? 'Claim Victory & Complete Run' : 'Continue Exploring'}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Inline Item Drawer if Item button toggled */}
              {itemMenuOpen && (
                <div className="rounded-[4px] bg-[#060e20] border border-[#222a3d] p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-mono text-[#a08e7a]">
                    <span>Select Combat Consumable</span>
                    <button
                      type="button"
                      onClick={() => setItemMenuOpen(false)}
                      className="text-[#dae2fd] hover:text-[#ffc174] cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  {usableItems.length === 0 ? (
                    <p className="text-xs text-[#a08e7a]">
                      No usable consumables remaining in pack.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {usableItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          disabled={!isPlayerTurn}
                          onClick={() => {
                            setItemMenuOpen(false);
                            onUseItem(item.id);
                          }}
                          className="flex items-center gap-3 p-2.5 rounded-[4px] bg-[#131b2e] border border-white/10 hover:border-[#10b981]/60 text-left transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <div className="w-9 h-9 rounded-[4px] bg-[#060e20] border border-[#222a3d] flex items-center justify-center shrink-0">
                            <ItemIcon id={item.id} className="w-6 h-6" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#dae2fd]">
                              <span className="truncate">{item.name}</span>
                              <span className="font-mono text-[#ffc174]">x{item.quantity}</span>
                            </div>
                            <div className="text-[11px] text-[#a08e7a] truncate">
                              {item.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  disabled={!isPlayerTurn}
                  onClick={onAttack}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-[4px] bg-gradient-to-b from-[#f59e0b] to-[#d97706] text-[#090d16] font-display text-sm font-bold uppercase tracking-wide border-t border-[#fde68a]/60 shadow-[0_0_14px_rgba(245,158,11,0.3)] hover:brightness-110 active:translate-y-px transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
                >
                  <Sword className="w-4 h-4" />
                  <span>Attack</span>
                </button>

                <button
                  type="button"
                  disabled={!isPlayerTurn}
                  onClick={onDefend}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-[4px] bg-[#06b6d4]/15 border border-[#06b6d4] text-[#4cd7f6] font-display text-sm font-semibold hover:bg-[#06b6d4]/25 active:translate-y-px transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
                  title="Parry & Counter: 99% damage mitigation and reflects 10% counter-damage back!"
                >
                  <Shield className="w-4 h-4" />
                  <span>Defend / Parry</span>
                </button>

                <button
                  type="button"
                  disabled={!isPlayerTurn}
                  onClick={() => setItemMenuOpen((prev) => !prev)}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-[4px] border font-display text-sm font-semibold transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer ${
                    itemMenuOpen
                      ? 'bg-[#10b981]/25 border-[#10b981] text-[#6ee7b7]'
                      : 'bg-[#10b981]/10 border-[#10b981]/50 text-[#6ee7b7] hover:bg-[#10b981]/20'
                  }`}
                >
                  <Backpack className="w-4 h-4" />
                  <span>Item ({usableItems.reduce((acc, i) => acc + i.quantity, 0)})</span>
                </button>

                {hero.hp / hero.maxHp < 0.1 ? (
                  <button
                    type="button"
                    disabled={!isPlayerTurn}
                    onClick={onFlee}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-3 rounded-[4px] bg-gradient-to-b from-[#475569] to-[#334155] border border-gray-300 text-white font-display text-xs sm:text-sm font-bold shadow-[0_0_14px_rgba(148,163,184,0.5)] hover:brightness-110 transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
                    title="Emergency Smoke Screen (<10% HP): 100% guaranteed safe escape with 0 damage, pushes monster back 1 tile!"
                  >
                    <CloudFog className="w-4 h-4 text-[#e2e8f0]" />
                    <span>Smoke Screen (100%)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!isPlayerTurn}
                    onClick={onFlee}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-[4px] bg-[#0f172a] border border-white/15 text-[#a08e7a] hover:text-[#dae2fd] hover:border-white/30 font-display text-sm font-semibold transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
                  >
                    <CornerUpLeft className="w-4 h-4" />
                    <span>Flee</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-[#a08e7a] gap-1">
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>Shortcuts: 1 Attack · 2 Defend/Parry · 3 Item · 4 Flee</span>
                </span>
                <span className="text-[#64748b]">
                  {hero.hp / hero.maxHp < 0.1
                    ? 'Emergency Smoke Screen Active (<10% HP: 100% Safe)'
                    : `Crit ${Math.round(hero.critChance * 100)}%`}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
