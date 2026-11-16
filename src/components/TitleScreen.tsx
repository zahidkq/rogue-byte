import React from 'react';
import { Shield, Sword, Trophy, Volume2, VolumeX, Play, RotateCcw, Eye, HelpCircle, LayoutGrid } from 'lucide-react';
import { HERO_CLASSES } from '../engine/dungeon';
import { ActiveRunState, CareerRecords, HeroClassId } from '../types/game';
import { HeroSprite } from './Sprites';

interface TitleScreenProps {
  playerName: string;
  onChangePlayerName: (name: string) => void;
  selectedClass: HeroClassId;
  onSelectClass: (id: HeroClassId) => void;
  onStartNewRun: (classId: HeroClassId) => void;
  savedRun: ActiveRunState | null;
  onContinueRun: () => void;
  career: CareerRecords;
  onClearRecords: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHelp: () => void;
  onOpenBuilder: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  playerName,
  onChangePlayerName,
  selectedClass,
  onSelectClass,
  onStartNewRun,
  savedRun,
  onContinueRun,
  career,
  onClearRecords,
  soundEnabled,
  onToggleSound,
  onOpenHelp,
  onOpenBuilder,
}) => {
  const classes = Object.values(HERO_CLASSES);

  return (
    <div className="min-h-screen bg-[#090D16] text-[#dae2fd] flex flex-col">
      {/* Top Bar */}
      <header className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-8 border-b border-[#222a3d]">
        <div className="font-display text-xl font-bold tracking-tight text-[#ffc174] whitespace-nowrap shrink-0">
          Rogue Byte
        </div>
        <div className="hidden md:flex items-center gap-6 text-xs font-mono text-[#a08e7a]">
          <span>Procedural Crypts</span>
          <span aria-hidden="true">·</span>
          <span>Turn-Based Combat</span>
          <span aria-hidden="true">·</span>
          <span>Local Persistence</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenBuilder}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-[4px] bg-[#f59e0b]/15 border border-[#f59e0b]/60 text-xs font-mono font-semibold text-[#ffc174] hover:bg-[#f59e0b]/25 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Level Builder</span>
          </button>
          <button
            type="button"
            onClick={onOpenHelp}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-[4px] bg-[#06b6d4]/15 border border-[#06b6d4]/60 text-xs font-mono font-semibold text-[#4cd7f6] hover:bg-[#06b6d4]/25 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>How to Play</span>
          </button>
          <button
            type="button"
            onClick={onToggleSound}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-[4px] bg-[#0f172a] border border-white/10 text-xs font-mono text-[#dae2fd] hover:border-[#f59e0b]/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#f59e0b]" /> : <VolumeX className="w-4 h-4 text-[#a08e7a]" />}
            <span>{soundEnabled ? 'Audio On' : 'Muted'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8 lg:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Title, Resume Banner, Class Selection */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-mono text-[#4cd7f6] tracking-wider uppercase">
              Tactical Dungeon Crawler
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#dae2fd] text-balance">
              Descend the procedural crypts. Outthink every ambush.
            </h1>
            <p className="text-sm sm:text-base text-[#a08e7a] max-w-2xl leading-relaxed">
              Navigate fog-shrouded rooms, evade concealed traps, gather gold and combat vials, and battle escalating floor guardians in turn-based tactical encounters.
            </p>
          </div>

          {/* Saved Run Resume Card */}
          {savedRun && (
            <div className="rounded-lg bg-[#131b2e]/90 border border-[#06b6d4]/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_24px_rgba(6,182,212,0.12)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[4px] bg-[#060e20] border border-[#06b6d4]/30 flex items-center justify-center shrink-0">
                  <HeroSprite classId={savedRun.hero.classId} className="w-9 h-9" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-display font-semibold text-[#dae2fd]">
                    Active Run Saved — {savedRun.hero.name}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#a08e7a] tabular-nums">
                    <span className="text-[#ffc174]">Floor {savedRun.floor.floorNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#ffb4ab]">
                      HP {savedRun.hero.hp}/{savedRun.hero.maxHp}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{savedRun.hero.gold} Gold</span>
                    <span aria-hidden="true">·</span>
                    <span>Score {savedRun.hero.score}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onContinueRun}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[4px] bg-[#06b6d4]/15 border border-[#06b6d4] text-[#4cd7f6] font-display text-sm font-semibold hover:bg-[#06b6d4]/25 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>Resume Run</span>
              </button>
            </div>
          )}

          {/* Operative / Class Selection */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-[#dae2fd]">
                Select Operative Loadout
              </h2>
              <span className="text-xs font-mono text-[#a08e7a]">
                3 Classes Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {classes.map((cls) => {
                const isSelected = selectedClass === cls.id;
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => onSelectClass(cls.id)}
                    className={`text-left rounded-lg p-4 transition-all cursor-pointer flex flex-col justify-between gap-4 border ${
                      isSelected
                        ? 'bg-[#171f33] border-[#f59e0b] shadow-[0_0_20px_rgba(245,158,11,0.16)]'
                        : 'bg-[#0f172a]/85 border-white/10 hover:border-white/25 hover:bg-[#131b2e]'
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="w-11 h-11 rounded-[4px] bg-[#060e20] border border-[#222a3d] flex items-center justify-center shrink-0">
                          <HeroSprite classId={cls.id} className="w-8 h-8" />
                        </div>
                        <span
                          className="text-xs font-mono font-semibold"
                          style={{ color: cls.accentColor }}
                        >
                          {cls.role}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-display text-base font-bold text-[#dae2fd]">
                          {cls.name}
                        </h3>
                        <p className="text-xs text-[#a08e7a] mt-1 leading-relaxed">
                          {cls.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs font-mono tabular-nums">
                      <span className="text-[#a08e7a]">
                        HP <strong className="text-[#ffb4ab]">{cls.maxHp}</strong>
                      </span>
                      <span className="text-[#a08e7a]">
                        ATK <strong className="text-[#ffc174]">{cls.baseAtk}</strong>
                      </span>
                      <span className="text-[#a08e7a]">
                        DEF <strong className="text-[#4cd7f6]">{cls.baseDef}</strong>
                      </span>
                      <span className="text-[#a08e7a]">
                        CRIT <strong className="text-[#d5c3ff]">{Math.round(cls.critChance * 100)}%</strong>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Operative Callsign + Primary Launch Action */}
          <div className="flex flex-col gap-3 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-[4px] bg-[#060e20] border border-white/15 focus-within:border-[#f59e0b] transition-colors sm:w-60">
                <span className="font-mono text-xs text-[#f59e0b]">&gt;</span>
                <input
                  type="text"
                  maxLength={18}
                  value={playerName}
                  onChange={(e) => onChangePlayerName(e.target.value)}
                  placeholder="Operative Callsign"
                  aria-label="Player name"
                  className="w-full bg-transparent text-sm font-mono text-[#dae2fd] placeholder:text-[#a08e7a]/60 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => onStartNewRun(selectedClass)}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-[4px] bg-gradient-to-b from-[#f59e0b] to-[#d97706] text-[#090d16] font-display text-base font-bold uppercase tracking-wide border-t border-[#fde68a]/60 shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:brightness-110 active:translate-y-px transition-all whitespace-nowrap cursor-pointer"
              >
                <Sword className="w-5 h-5" />
                <span>{savedRun ? 'Start New Descent' : 'Enter Dungeon'}</span>
              </button>

              <button
                type="button"
                onClick={onOpenBuilder}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-[4px] bg-[#f59e0b]/15 border border-[#f59e0b]/60 text-[#ffc174] hover:bg-[#f59e0b]/25 font-display text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Level Builder</span>
              </button>

              <button
                type="button"
                onClick={onOpenHelp}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-[4px] bg-[#0f172a] border border-white/15 text-[#dae2fd] hover:border-[#06b6d4]/60 hover:text-[#4cd7f6] font-display text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>How to Play</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-[#a08e7a]">
              <span>Move: WASD / Arrows / Tap</span>
              <span aria-hidden="true">·</span>
              <span>Wait: Space</span>
              <span aria-hidden="true">·</span>
              <span>Confirm: Enter</span>
              <span aria-hidden="true">·</span>
              <span>Inventory: I</span>
            </div>
          </div>
        </section>

        {/* Right Column: Persistent Records & Tactical Rules */}
        <aside className="lg:col-span-4 flex flex-col gap-5">
          {/* Career Telemetry */}
          <div className="rounded-lg bg-[#0f172a]/85 border border-white/10 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#f59e0b]" />
                <h2 className="font-display text-base font-semibold text-[#dae2fd]">
                  Local Hall of Records
                </h2>
              </div>
              {career.totalRuns > 0 && (
                <button
                  type="button"
                  onClick={onClearRecords}
                  className="inline-flex items-center gap-1 text-xs font-mono text-[#a08e7a] hover:text-[#ffb4ab] transition-colors cursor-pointer"
                  title="Clear local high scores"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono tabular-nums">
              <div className="rounded-[4px] bg-[#060e20] border border-[#222a3d] p-3">
                <div className="text-[#a08e7a]">Best Score</div>
                <div className="text-lg font-bold text-[#ffc174] mt-0.5">
                  {career.bestScore.toLocaleString()}
                </div>
              </div>
              <div className="rounded-[4px] bg-[#060e20] border border-[#222a3d] p-3">
                <div className="text-[#a08e7a]">Deepest Floor</div>
                <div className="text-lg font-bold text-[#4cd7f6] mt-0.5">
                  {career.deepestFloor > 0 ? `Floor ${career.deepestFloor}` : '—'}
                </div>
              </div>
              <div className="rounded-[4px] bg-[#060e20] border border-[#222a3d] p-3">
                <div className="text-[#a08e7a]">Total Kills</div>
                <div className="text-base font-semibold text-[#dae2fd] mt-0.5">
                  {career.totalKills}
                </div>
              </div>
              <div className="rounded-[4px] bg-[#060e20] border border-[#222a3d] p-3">
                <div className="text-[#a08e7a]">Runs Logged</div>
                <div className="text-base font-semibold text-[#dae2fd] mt-0.5">
                  {career.totalRuns}
                </div>
              </div>
            </div>

            {career.leaderboard.length > 0 ? (
              <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                <span className="text-xs font-mono text-[#a08e7a]">Recent Top Runs</span>
                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {career.leaderboard.slice(0, 5).map((entry, idx) => (
                    <div
                      key={entry.id}
                      className="flex flex-col gap-0.5 px-2.5 py-2 rounded-[4px] bg-[#060e20] border border-[#222a3d] text-xs font-mono tabular-nums"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[#a08e7a]">#{idx + 1}</span>
                          <span className="text-[#dae2fd] truncate">
                            {entry.playerName || entry.className}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={entry.victory ? 'text-[#6ee7b7]' : 'text-[#4cd7f6]'}>
                            {entry.victory ? 'Win' : `F${entry.floor}`}
                          </span>
                          <span aria-hidden="true" className="text-[#534434]">·</span>
                          <span className="text-[#ffc174] font-semibold">
                            {entry.score.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {entry.legendaryWeapon && (
                        <div className="text-[10px] text-[#ffc174] truncate pl-5">
                          Relic: {entry.legendaryWeapon.name} (+{entry.legendaryWeapon.bonusAtk} ATK)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#a08e7a] pt-2 border-t border-white/10">
                No completed runs recorded yet. Your scores and floor records are saved locally in this browser.
              </p>
            )}
          </div>

          {/* Field Briefing */}
          <div className="rounded-lg bg-[#0f172a]/85 border border-white/10 p-5 flex flex-col gap-3">
            <h2 className="font-display text-base font-semibold text-[#dae2fd]">
              Tactical Rules
            </h2>
            <ul className="flex flex-col gap-2.5 text-xs text-[#a08e7a] leading-relaxed">
              <li className="flex items-start gap-2.5">
                <Eye className="w-4 h-4 text-[#4cd7f6] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#dae2fd]">Fog of War:</strong> Walls block line-of-sight. Explore corridors to uncover hidden rooms and the stairs down.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Sword className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#dae2fd]">Step-Based AI:</strong> Alerted enemies move one tile toward you after each step. Bump into an enemy to trigger turn-based combat.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#dae2fd]">Hazards & Loot:</strong> Watch for concealed floor traps, collect gold caches, and save consumables for elite guardians.
                </span>
              </li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
};
