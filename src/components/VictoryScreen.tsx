import React, { useState } from 'react';
import { Award, Home, RotateCcw, Sword, Trophy } from 'lucide-react';
import { CareerRecords, HighScoreEntry } from '../types/game';
import { LeaderboardPanel } from './LeaderboardPanel';
import { HeroSprite } from './Sprites';

interface VictoryScreenProps {
  runSummary: HighScoreEntry;
  isNewBest: boolean;
  career: CareerRecords;
  onPlayAgain: () => void;
  onReturnTitle: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  runSummary,
  isNewBest,
  career,
  onPlayAgain,
  onReturnTitle,
}) => {
  const [view, setView] = useState<'summary' | 'leaderboard'>('summary');
  const relic = runSummary.legendaryWeapon;

  return (
    <div className="min-h-screen bg-[#090D16] text-[#dae2fd] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl rounded-lg bg-[#0f172a] border border-[#f59e0b]/55 shadow-[0_0_36px_rgba(245,158,11,0.22),0_16px_44px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* Top Banner */}
        <div className="px-6 py-5 bg-[#131b2e] border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-[4px] bg-[#060e20] border border-[#f59e0b]/50 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-[#ffc174]" />
            </div>
            <div>
              <p className="text-xs font-mono text-[#6ee7b7]">
                Floor 3 Overlord Defeated · Dungeon Cleared
              </p>
              <h1 className="font-display text-2xl font-bold text-[#ffc174]">
                Expedition Victory
              </h1>
            </div>
          </div>

          <div className="w-11 h-11 rounded-[4px] bg-[#060e20] border border-[#f59e0b]/40 flex items-center justify-center">
            <HeroSprite classId={runSummary.classId} className="w-8 h-8" />
          </div>
        </div>

        {/* View Switcher */}
        <div className="px-6 py-2.5 bg-[#060e20] border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView('summary')}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-mono font-semibold transition-colors cursor-pointer ${
                view === 'summary'
                  ? 'bg-[#f59e0b]/20 border border-[#f59e0b] text-[#ffc174]'
                  : 'bg-[#131b2e] border border-white/10 text-[#a08e7a] hover:text-[#dae2fd]'
              }`}
            >
              Run Summary
            </button>
            <button
              type="button"
              onClick={() => setView('leaderboard')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-mono font-semibold transition-colors cursor-pointer ${
                view === 'leaderboard'
                  ? 'bg-[#06b6d4]/20 border border-[#06b6d4] text-[#4cd7f6]'
                  : 'bg-[#131b2e] border border-white/10 text-[#a08e7a] hover:text-[#dae2fd]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>High-Score Board</span>
            </button>
          </div>
          <span className="text-xs font-mono text-[#a08e7a] hidden sm:inline">
            {runSummary.playerName || runSummary.className}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 bg-[#0b1326] flex flex-col gap-5">
          {view === 'summary' ? (
            <>
              <div className="rounded-[4px] bg-[#060e20] border border-[#10b981]/35 p-4 flex flex-col gap-1">
                <span className="text-xs font-mono text-[#a08e7a]">Mission Result</span>
                <span className="text-sm font-medium text-[#6ee7b7]">
                  {runSummary.causeOfDeath}
                </span>
              </div>

              {/* AI-Generated Legendary Weapon Drop Showcase */}
              {relic && (
                <div className="rounded-lg bg-gradient-to-br from-[#171f33] to-[#1e1b4b]/60 border border-[#f59e0b]/70 p-4 flex items-start gap-4 shadow-[0_0_22px_rgba(245,158,11,0.16)]">
                  <div className="w-12 h-12 rounded-[4px] bg-[#060e20] border border-[#f59e0b]/60 flex items-center justify-center shrink-0">
                    <Sword className="w-6 h-6 text-[#ffc174]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-mono text-[#ffc174]">
                        Legendary Weapon Awarded · {relic.loreTag || 'Boss Relic'}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#4cd7f6]">
                        +{relic.bonusAtk} Attack
                      </span>
                    </div>
                    <h2 className="font-display text-lg font-bold text-[#dae2fd] mt-0.5">
                      {relic.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#d8c3ad] mt-1 leading-relaxed">
                      {relic.description}
                    </p>
                  </div>
                </div>
              )}

              {isNewBest && (
                <div className="rounded-[4px] bg-[#f59e0b]/15 border border-[#f59e0b]/50 px-4 py-2.5 flex items-center gap-2.5 text-xs font-mono text-[#ffc174]">
                  <Trophy className="w-4 h-4 shrink-0" />
                  <span>New Personal Best Score Recorded</span>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono tabular-nums">
                <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3">
                  <div className="text-[11px] text-[#a08e7a]">Final Score</div>
                  <div className="text-lg font-bold text-[#ffc174] mt-0.5">
                    {runSummary.score.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3">
                  <div className="text-[11px] text-[#a08e7a]">Floor Cleared</div>
                  <div className="text-lg font-bold text-[#4cd7f6] mt-0.5">
                    Floor {runSummary.floor}
                  </div>
                </div>
                <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3">
                  <div className="text-[11px] text-[#a08e7a]">Hostiles Slain</div>
                  <div className="text-lg font-bold text-[#dae2fd] mt-0.5">
                    {runSummary.enemiesDefeated}
                  </div>
                </div>
                <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3">
                  <div className="text-[11px] text-[#a08e7a]">Gold Looted</div>
                  <div className="text-lg font-bold text-[#6ee7b7] mt-0.5">
                    {runSummary.gold}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <LeaderboardPanel career={career} highlightEntryId={runSummary.id} />
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={onPlayAgain}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[4px] bg-gradient-to-b from-[#f59e0b] to-[#d97706] text-[#090d16] font-display text-sm font-bold uppercase tracking-wide border-t border-[#fde68a]/60 shadow-[0_0_16px_rgba(245,158,11,0.35)] hover:brightness-110 transition-all whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
            <button
              type="button"
              onClick={() => setView(view === 'summary' ? 'leaderboard' : 'summary')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[4px] bg-[#06b6d4]/15 border border-[#06b6d4] text-[#4cd7f6] font-display text-sm font-semibold hover:bg-[#06b6d4]/25 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>{view === 'summary' ? 'View Leaderboard' : 'View Summary'}</span>
            </button>
            <button
              type="button"
              onClick={onReturnTitle}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[4px] bg-[#131b2e] border border-white/15 text-[#dae2fd] font-display text-sm font-semibold hover:border-white/30 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Main Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
