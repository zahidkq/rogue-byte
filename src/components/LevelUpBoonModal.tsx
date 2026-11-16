import React, { useEffect } from 'react';
import {
  Flame,
  HeartPulse,
  Lock,
  Shield,
  Sparkles,
  Sword,
  Zap,
} from 'lucide-react';
import { canSelectFortifiedGuard } from '../engine/dungeon';
import { HeroState } from '../types/game';
import { SegmentedBar } from './SegmentedBar';
import { StairsSprite } from './Sprites';

interface LevelUpBoonModalProps {
  currentFloor: number;
  hero: HeroState;
  healAmount: number;
  percentRestored: 25 | 15;
  newHp: number;
  onSelectBoon: (boon: 'aggressive_stance' | 'fortified_guard') => void;
}

export const LevelUpBoonModal: React.FC<LevelUpBoonModalProps> = ({
  currentFloor,
  hero,
  healAmount,
  percentRestored,
  newHp,
  onSelectBoon,
}) => {
  const bonusAtk = Math.max(1, Math.round(hero.atk * 0.15));
  const bonusDef = Math.max(1, Math.round(hero.def * 0.5));
  const isFortifiedGuardEligible = canSelectFortifiedGuard(hero.def);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '1' || e.key.toLowerCase() === 'a') {
        e.preventDefault();
        onSelectBoon('aggressive_stance');
      } else if (
        (e.key === '2' || e.key.toLowerCase() === 'b') &&
        isFortifiedGuardEligible
      ) {
        e.preventDefault();
        onSelectBoon('fortified_guard');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFortifiedGuardEligible, onSelectBoon]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#060e20]/90 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={`Floor ${currentFloor} Clear Rewards and Stat Boon Selection`}
    >
      <div className="w-full max-w-2xl rounded-lg bg-[#0f172a] border border-[#f59e0b]/55 shadow-[0_0_32px_rgba(245,158,11,0.22),0_18px_45px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-[#131b2e] via-[#1a233b] to-[#131b2e] border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[4px] bg-[#060e20] border border-[#f59e0b]/45 flex items-center justify-center shrink-0">
              <StairsSprite className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#ffc174] font-semibold">
                  Floor {currentFloor} Cleared
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#10b981]/20 border border-[#10b981]/40 text-[11px] font-mono text-[#6ee7b7]">
                  Tactical Rest
                </span>
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#dae2fd]">
                Floor Clear Healing &amp; Stat Boon
              </h2>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-[#f59e0b] hidden sm:block" />
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 bg-[#0b1326] overflow-y-auto flex-1 flex flex-col gap-5">
          {/* 1. Dynamic HP Recovery Card */}
          <div className="rounded-lg bg-[#131b2e] border border-[#10b981]/40 p-4 sm:p-5 flex flex-col gap-3 shadow-[0_0_18px_rgba(16,185,129,0.1)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[4px] bg-[#10b981]/15 border border-[#10b981]/50 flex items-center justify-center shrink-0">
                  <HeartPulse className="w-5 h-5 text-[#6ee7b7]" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-[#6ee7b7]">
                    Dynamic HP Recovery Applied
                  </h3>
                  <p className="text-xs text-[#a08e7a]">
                    {hero.hp < hero.maxHp * 0.7
                      ? `Critical Condition (<70% HP): Restored +${percentRestored}% of Max HP`
                      : `Standard Regroup (>=70% HP): Restored +${percentRestored}% of Max HP`}
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-[#060e20] border border-[#10b981]/40 font-mono text-xs font-bold text-[#6ee7b7] tabular-nums self-start sm:self-auto">
                <span>+{healAmount} HP</span>
                <span className="text-[#a08e7a]">
                  ({hero.hp} → {newHp}/{hero.maxHp})
                </span>
              </div>
            </div>

            <SegmentedBar
              current={newHp}
              max={hero.maxHp}
              color="emerald"
              label="Operative Vitals"
            />
          </div>

          {/* 2. Level-Up Boon Choices */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm sm:text-base font-bold text-[#dae2fd]">
                Select 1 Permanent Stat Boon
              </h3>
              <span className="text-xs font-mono text-[#a08e7a]">
                Choose an upgrade before entering the Armory
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Option A: Aggressive Stance */}
              <button
                type="button"
                onClick={() => onSelectBoon('aggressive_stance')}
                className="group relative rounded-lg bg-[#131b2e] border border-[#f59e0b]/40 hover:border-[#f59e0b] p-4 text-left flex flex-col justify-between gap-3 transition-all hover:bg-[#1a233b] hover:shadow-[0_0_20px_rgba(245,158,11,0.22)] cursor-pointer"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-[4px] bg-[#f59e0b]/15 border border-[#f59e0b]/50 flex items-center justify-center shrink-0">
                        <Sword className="w-4 h-4 text-[#ffc174]" />
                      </div>
                      <div>
                        <span className="text-[11px] font-mono text-[#ffc174] font-semibold">
                          Option A · Shortcut [1]
                        </span>
                        <div className="font-display text-base font-bold text-[#dae2fd] group-hover:text-[#ffc174] transition-colors">
                          Aggressive Stance
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#d8c3ad] leading-relaxed">
                    Overclock kinetic dampeners to channel auxiliary power directly into blade strikes.
                  </p>

                  <div className="mt-1 p-2 rounded-[4px] bg-[#060e20] border border-white/10 flex items-center justify-between font-mono text-xs tabular-nums">
                    <span className="text-[#a08e7a]">Attack Damage:</span>
                    <span className="text-[#ffc174] font-bold">
                      {hero.atk} → {hero.atk + bonusAtk} (+15%)
                    </span>
                  </div>
                </div>

                <div className="mt-2 w-full py-2 rounded-[4px] bg-[#f59e0b]/20 border border-[#f59e0b] text-[#ffc174] font-display text-xs font-bold uppercase tracking-wide text-center group-hover:bg-[#f59e0b] group-hover:text-[#090d16] transition-all">
                  Claim Aggressive Stance
                </div>
              </button>

              {/* Option B: Fortified Guard */}
              <button
                type="button"
                disabled={!isFortifiedGuardEligible}
                onClick={() => isFortifiedGuardEligible && onSelectBoon('fortified_guard')}
                className={`relative rounded-lg p-4 text-left flex flex-col justify-between gap-3 transition-all ${
                  isFortifiedGuardEligible
                    ? 'group bg-[#131b2e] border border-[#06b6d4]/40 hover:border-[#06b6d4] hover:bg-[#1a233b] hover:shadow-[0_0_20px_rgba(6,182,212,0.22)] cursor-pointer'
                    : 'bg-[#0f172a]/60 border border-white/5 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-[4px] bg-[#06b6d4]/15 border border-[#06b6d4]/50 flex items-center justify-center shrink-0">
                        {isFortifiedGuardEligible ? (
                          <Shield className="w-4 h-4 text-[#4cd7f6]" />
                        ) : (
                          <Lock className="w-4 h-4 text-[#a08e7a]" />
                        )}
                      </div>
                      <div>
                        <span className="text-[11px] font-mono text-[#4cd7f6] font-semibold">
                          Option B · Shortcut [2]
                        </span>
                        <div className="font-display text-base font-bold text-[#dae2fd] group-hover:text-[#4cd7f6] transition-colors">
                          Fortified Guard
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#d8c3ad] leading-relaxed">
                    Weave reinforced carbon-weave mesh through hull armor to permanently enhance damage reduction.
                  </p>

                  <div className="mt-1 p-2 rounded-[4px] bg-[#060e20] border border-white/10 flex items-center justify-between font-mono text-xs tabular-nums">
                    <span className="text-[#a08e7a]">Defense Armor:</span>
                    <span
                      className={`font-bold ${
                        isFortifiedGuardEligible ? 'text-[#4cd7f6]' : 'text-[#a08e7a]'
                      }`}
                    >
                      {hero.def} → {hero.def + bonusDef} (+50%)
                    </span>
                  </div>

                  {!isFortifiedGuardEligible && (
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#ffb4ab]">
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>Locked: Requires Defense &lt; 5 (Current: {hero.def})</span>
                    </div>
                  )}
                </div>

                <div
                  className={`mt-2 w-full py-2 rounded-[4px] font-display text-xs font-bold uppercase tracking-wide text-center transition-all ${
                    isFortifiedGuardEligible
                      ? 'bg-[#06b6d4]/20 border border-[#06b6d4] text-[#4cd7f6] group-hover:bg-[#06b6d4] group-hover:text-[#090d16]'
                      : 'bg-[#060e20] border border-white/10 text-[#a08e7a]'
                  }`}
                >
                  {isFortifiedGuardEligible ? 'Claim Fortified Guard' : 'Requires Defense < 5'}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 sm:px-6 py-3.5 bg-[#131b2e] border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#a08e7a]">
          <span>Press [1] or [2] to choose your boon</span>
          <span>Continues directly to Inter-Floor Shop</span>
        </div>
      </div>
    </div>
  );
};
