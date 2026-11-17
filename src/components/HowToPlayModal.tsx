import React, { useEffect } from 'react';
import {
  BookOpen,
  CloudFog,
  Compass,
  FlaskConical,
  HeartPulse,
  Keyboard,
  MessageSquare,
  Shield,
  ShoppingBag,
  Sparkles,
  Sword,
  X,
  Zap,
} from 'lucide-react';
import {
  EnemySprite,
  HeroSprite,
  LootSprite,
  StairsSprite,
  TrapSprite,
} from './Sprites';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#060e20]/88 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="How to Play Rogue Byte"
    >
      <div className="w-full max-w-3xl rounded-lg bg-[#0f172a] border border-[#06b6d4]/45 shadow-[0_0_28px_rgba(6,182,212,0.18),0_18px_46px_rgba(0,0,0,0.88)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-[#131b2e] border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-[#060e20] border border-[#06b6d4]/40 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-[#4cd7f6]" />
            </div>
            <div>
              <p className="text-xs font-mono text-[#4cd7f6]">Field Manual</p>
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#dae2fd]">
                How to Play Rogue Byte
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-[4px] bg-[#060e20] border border-white/10 text-[#a08e7a] hover:text-[#dae2fd] hover:border-white/25 transition-colors cursor-pointer"
            aria-label="Close guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Guide Content */}
        <div className="p-5 sm:p-6 bg-[#0b1326] overflow-y-auto flex-1 flex flex-col gap-6">
          {/* 1. Mission Objective */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-display font-bold text-[#ffc174]">
              <Compass className="w-4 h-4 shrink-0" />
              <h3>Mission Objectives</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#d8c3ad] leading-relaxed">
              Navigate 3 procedurally generated dungeon floors shrouded in line-of-sight fog of war. Gather gold and combat supplies, survive concealed traps, and locate the descent stairs on Floors 1 and 2. On Floor 3, confront and defeat the{' '}
              <strong className="text-[#d5c3ff]">Zenexis Overlord</strong> to claim a procedurally forged Legendary Weapon and escape with a high score.
            </p>
          </section>

          {/* 2. Control Scheme */}
          <section className="flex flex-col gap-3 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm font-display font-bold text-[#4cd7f6]">
              <Keyboard className="w-4 h-4 shrink-0" />
              <h3>Control Scheme (Keyboard &amp; On-Screen)</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3.5 flex flex-col gap-2">
                <div className="font-display font-semibold text-[#dae2fd]">Exploration Controls</div>
                <ul className="flex flex-col gap-1.5 text-[#a08e7a] font-mono">
                  <li className="flex items-center justify-between gap-2">
                    <span>Move / Bump Attack</span>
                    <span className="text-[#ffc174]">WASD / Arrows</span>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span>Click / Tap Grid</span>
                    <span className="text-[#ffc174]">Step or Path</span>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span>Hold Position (1 Turn)</span>
                    <span className="text-[#ffc174]">Space / .</span>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span>Confirm / Open Stairs</span>
                    <span className="text-[#ffc174]">Enter</span>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span>Field Pack &amp; Forge</span>
                    <span className="text-[#ffc174]">I</span>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span>On-Screen D-Pad</span>
                    <span className="text-[#4cd7f6]">Right Deck</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3.5 flex flex-col gap-2">
                <div className="font-display font-semibold text-[#dae2fd]">Combat &amp; Dialog Shortcuts</div>
                <ul className="flex flex-col gap-1.5 text-[#a08e7a] font-mono">
                  <li className="flex items-center justify-between gap-2">
                    <span>Attack Strike</span>
                    <span className="text-[#ffc174]">1 / Space</span>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span>Kinetic Guard (Defend)</span>
                    <span className="text-[#4cd7f6]">2 / D</span>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span>Toggle Item Drawer</span>
                    <span className="text-[#6ee7b7]">3 / I</span>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span>Attempt Flee (65%)</span>
                    <span className="text-[#dae2fd]">4 / F</span>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span>Advance / Confirm Modal</span>
                    <span className="text-[#ffc174]">Space / Enter</span>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span>Close Overlay / Menu</span>
                    <span className="text-[#dae2fd]">Esc</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. Tile & Entity Legend */}
          <section className="flex flex-col gap-3 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm font-display font-bold text-[#dae2fd]">
              <Shield className="w-4 h-4 text-[#f59e0b] shrink-0" />
              <h3>Tile &amp; Dungeon Legend</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-[4px] bg-[#060e20] border border-[#f59e0b]/40 flex items-center justify-center shrink-0">
                  <HeroSprite classId="cipher" className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-display font-semibold text-[#dae2fd]">Operative</div>
                  <div className="text-[#a08e7a]">Reveals rooms &amp; blocks fog</div>
                </div>
              </div>

              <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-[4px] bg-[#060e20] border border-[#f59e0b]/40 flex items-center justify-center shrink-0">
                  <LootSprite type="gold" className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-display font-semibold text-[#ffc174]">Gold Cache</div>
                  <div className="text-[#a08e7a]">Funds shop gear &amp; score</div>
                </div>
              </div>

              <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-[4px] bg-[#060e20] border border-[#10b981]/40 flex items-center justify-center shrink-0">
                  <LootSprite type="med_vial" className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-display font-semibold text-[#6ee7b7]">Vials &amp; Supplies</div>
                  <div className="text-[#a08e7a]">Heal HP, add Shield, or stun</div>
                </div>
              </div>

              <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-[4px] bg-[#060e20] border border-[#ef4444]/40 flex items-center justify-center shrink-0">
                  <TrapSprite type="spike" triggered={false} className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-display font-semibold text-[#ffb4ab]">Dungeon Traps</div>
                  <div className="text-[#a08e7a]">Revealed adjacent; hurt on step</div>
                </div>
              </div>

              <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-[4px] bg-[#060e20] border border-[#f59e0b]/40 flex items-center justify-center shrink-0">
                  <StairsSprite className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-display font-semibold text-[#ffc174]">Descent Stairs</div>
                  <div className="text-[#a08e7a]">Opens Merchant &amp; next floor</div>
                </div>
              </div>

              <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-[4px] bg-[#060e20] border border-[#8b5cf6]/50 flex items-center justify-center shrink-0">
                  <EnemySprite archetypeId="floor_warden" className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-display font-semibold text-[#d5c3ff]">Hostiles &amp; Boss</div>
                  <div className="text-[#a08e7a]">Step 1 tile/turn; bump to fight</div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Combat & Inter-Floor Gear Shop */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-sm font-display font-bold text-[#ffb4ab]">
                <Sword className="w-4 h-4 shrink-0" />
                <h3>Combat Mechanics</h3>
              </div>
              <p className="text-xs text-[#a08e7a] leading-relaxed">
                Alerted monsters advance one tile after each move. Bumping an enemy starts turn-based combat: <strong className="text-[#dae2fd]">Attack</strong> deals weapon damage with Critical Hit potential, <strong className="text-[#4cd7f6]">Defend</strong> activates a 99% damage mitigation parry with 10% counter-damage recoil, <strong className="text-[#6ee7b7]">Items</strong> heal or stun, and <strong className="text-[#dae2fd]">Flee</strong> allows repositioning or emergency smoke evasion.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-sm font-display font-bold text-[#ffc174]">
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <h3>Inter-Floor Gear Shop</h3>
              </div>
              <p className="text-xs text-[#a08e7a] leading-relaxed">
                Reaching the stairs between floors opens the <strong className="text-[#dae2fd]">Inter-Floor Merchant &amp; Armory</strong>. Spend collected Gold to buy higher-tier Weapons (+ATK), Shields &amp; Armor (+DEF / +Shield / +Max HP), and healing potions before descending deeper—or open your Field Pack (<strong className="text-[#dae2fd]">I</strong>) anytime for quick field upgrades.
              </p>
            </div>
          </section>

          {/* 5. Advanced Combat & Floor Clear Systems */}
          <section className="flex flex-col gap-3 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm font-display font-bold text-[#fbbf24]">
              <Sparkles className="w-4 h-4 shrink-0" />
              <h3>Advanced Combat &amp; Tactical Systems</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Floor Clear Rewards */}
              <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3.5 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-display font-bold text-[#6ee7b7]">
                  <HeartPulse className="w-4 h-4 shrink-0" />
                  <span>Floor Clear Rewards &amp; Stat Boons</span>
                </div>
                <p className="text-[#d8c3ad] leading-relaxed">
                  Reaching descent stairs triggers immediate HP recovery and a level-up boon before entering the shop:
                </p>
                <ul className="flex flex-col gap-1 text-[#a08e7a] font-mono list-disc list-inside">
                  <li>
                    <strong className="text-[#dae2fd]">HP &lt; 70%:</strong> Restores <span className="text-[#6ee7b7]">+25% Max HP</span>
                  </li>
                  <li>
                    <strong className="text-[#dae2fd]">HP &gt;= 70%:</strong> Restores <span className="text-[#6ee7b7]">+15% Max HP</span> (capped at Max HP)
                  </li>
                  <li>
                    <strong className="text-[#ffc174]">Aggressive Stance:</strong> Permanently increases Attack by <span className="text-[#ffc174]">+15%</span>
                  </li>
                  <li>
                    <strong className="text-[#4cd7f6]">Fortified Guard:</strong> Permanently increases Defense by <span className="text-[#4cd7f6]">+50%</span> (selectable only if DEF &lt; 5)
                  </li>
                </ul>
              </div>

              {/* Clutch Healing Barrier */}
              <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3.5 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-display font-bold text-[#fbbf24]">
                  <Zap className="w-4 h-4 shrink-0" />
                  <span>Clutch Healing Barrier (&lt; 10% HP)</span>
                </div>
                <p className="text-[#d8c3ad] leading-relaxed">
                  When in dire straits (<strong className="text-[#ffb4ab]">HP below 10%</strong> of Max HP), consuming a healing vial activates a 1-turn golden invulnerability shield:
                </p>
                <div className="p-2 rounded-[4px] bg-[#060e20] border border-[#f59e0b]/30 text-[#ffc174] font-mono text-[11px]">
                  The monster's retaliatory counter-attack deals <strong>exactly 0 damage</strong>!
                  <div className="text-[#a08e7a] mt-0.5">
                    Log: <em>"CRITICAL RECOVERY! Monster attack nullified!"</em>
                  </div>
                </div>
              </div>

              {/* Shield Counter-Attack */}
              <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3.5 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-display font-bold text-[#4cd7f6]">
                  <Shield className="w-4 h-4 shrink-0" />
                  <span>Shield Counter-Attack (Parry &amp; Reflect)</span>
                </div>
                <p className="text-[#d8c3ad] leading-relaxed">
                  Choosing <strong className="text-[#4cd7f6]">Defend / Shield</strong> in combat deflects almost all incoming force and punishes the assailant:
                </p>
                <ul className="flex flex-col gap-1 text-[#a08e7a] font-mono list-disc list-inside">
                  <li>
                    Reduces incoming monster damage to <span className="text-[#4cd7f6]">1% (99% damage reduction)</span>.
                  </li>
                  <li>
                    Immediately reflects <span className="text-[#ffc174]">10% counter-damage</span> back to the monster.
                  </li>
                  <li>
                    Combat Log: <em>"PARRY &amp; COUNTER! Blocked 99% damage and countered!"</em>
                  </li>
                </ul>
              </div>

              {/* Emergency Smoke Screen Escape */}
              <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3.5 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-display font-bold text-[#cbd5e1]">
                  <CloudFog className="w-4 h-4 shrink-0" />
                  <span>Emergency Smoke Screen (&lt; 10% HP)</span>
                </div>
                <p className="text-[#d8c3ad] leading-relaxed">
                  Choosing <strong className="text-[#cbd5e1]">Flee</strong> when health drops below 10% triggers an emergency evacuation:
                </p>
                <ul className="flex flex-col gap-1 text-[#a08e7a] font-mono list-disc list-inside">
                  <li>
                    <strong className="text-[#6ee7b7]">100% Guaranteed escape</strong> with 0 retaliatory damage.
                  </li>
                  <li>
                    Discharges a <strong className="text-[#cbd5e1]">gray smoke screen</strong> puff animation on the grid.
                  </li>
                  <li>
                    Knocks the hostile monster <strong className="text-[#ffc174]">1 tile backward</strong> away from you.
                  </li>
                  <li>
                    If HP &gt;= 10%, standard 65% escape chance applies.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 5. Modular Status Effects & Cleansing */}
          <section className="flex flex-col gap-3 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm font-display font-bold text-[#10b981]">
              <FlaskConical className="w-4 h-4 shrink-0" />
              <h3>Modular Status Effects &amp; Cleansing</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Poison Debuff */}
              <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3.5 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-display font-bold text-[#6ee7b7]">
                  <span>🧪 Poison Debuff</span>
                </div>
                <p className="text-[#d8c3ad] leading-relaxed">
                  Inflicted by venomous beasts (25% chance on strike) and the Sanctum Overlord:
                </p>
                <ul className="flex flex-col gap-1 text-[#a08e7a] font-mono list-disc list-inside">
                  <li>
                    <strong className="text-[#dae2fd]">In Combat:</strong> Burns for <span className="text-[#ef4444]">3–5 HP</span> tick damage at the start of your turn.
                  </li>
                  <li>
                    <strong className="text-[#dae2fd]">In Exploration:</strong> Deals <span className="text-[#ef4444]">1 damage every 3 steps</span> moved on the grid.
                  </li>
                  <li>
                    Displays green floating damage text and flash on the hero sprite.
                  </li>
                </ul>
              </div>

              {/* Slow Debuff */}
              <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3.5 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-display font-bold text-[#4cd7f6]">
                  <span>❄️ Slow Debuff</span>
                </div>
                <p className="text-[#d8c3ad] leading-relaxed">
                  Inflicted by cryogenic golems (20% chance on strike) and the Sanctum Overlord:
                </p>
                <ul className="flex flex-col gap-1 text-[#a08e7a] font-mono list-disc list-inside">
                  <li>
                    <strong className="text-[#dae2fd]">In Exploration:</strong> Enemies move <span className="text-[#ffc174]">2 steps</span> for every 1 step you take!
                  </li>
                  <li>
                    <strong className="text-[#dae2fd]">In Combat:</strong> Decreases normal escape/flee probability to 35%.
                  </li>
                </ul>
              </div>

              {/* Cleansing */}
              <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3.5 flex flex-col gap-2 sm:col-span-2">
                <div className="flex items-center gap-2 font-display font-bold text-[#fbbf24]">
                  <Sparkles className="w-4 h-4 shrink-0 text-[#fbbf24]" />
                  <span>Cleansing &amp; In-App Feedback Channel</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#d8c3ad]">
                  <div>
                    <strong className="text-[#6ee7b7]">Debuff Cleansing:</strong>
                    <p className="text-[#a08e7a] mt-0.5">
                      Consuming a Nano-Med Vial immediately cleanses all active debuffs (Poison &amp; Slow) while restoring HP. Descending to the next floor also naturally purges all status effects.
                    </p>
                  </div>
                  <div>
                    <strong className="text-[#4cd7f6] flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      In-App Developer Feedback:
                    </strong>
                    <p className="text-[#a08e7a] mt-0.5">
                      Encountered a bug or have a suggestion? Click the discreet "💬 Feedback" button in the HUD, Title screen, or victory screens to transmit feedback directly to the developers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 bg-[#131b2e] border-t border-white/10 flex items-center justify-between gap-3">
          <span className="text-xs font-mono text-[#a08e7a]">
            Press Enter, Space, or Esc to continue
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-[4px] bg-gradient-to-b from-[#f59e0b] to-[#d97706] text-[#090d16] font-display text-xs sm:text-sm font-bold uppercase tracking-wide border-t border-[#fde68a]/60 shadow-[0_0_14px_rgba(245,158,11,0.3)] hover:brightness-110 transition-all whitespace-nowrap cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
