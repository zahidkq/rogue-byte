import React from 'react';
import { Trophy } from 'lucide-react';
import { CareerRecords } from '../types/game';

interface LeaderboardPanelProps {
  career: CareerRecords;
  highlightEntryId?: string;
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
  career,
  highlightEntryId,
}) => {
  if (career.leaderboard.length === 0) {
    return (
      <div className="rounded-[4px] bg-[#060e20] border border-[#222a3d] p-5 text-center text-xs font-mono text-[#a08e7a]">
        No runs recorded yet. Complete or finish a run to register your score.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs font-mono text-[#a08e7a] tabular-nums">
        <span className="inline-flex items-center gap-1.5 text-[#ffc174]">
          <Trophy className="w-3.5 h-3.5" />
          <span>Top {career.leaderboard.length} Recorded Runs</span>
        </span>
        <span>
          Victories: <strong className="text-[#6ee7b7]">{career.totalVictories ?? 0}</strong> · Total Runs:{' '}
          <strong className="text-[#dae2fd]">{career.totalRuns}</strong>
        </span>
      </div>

      <div className="rounded-[4px] bg-[#060e20] border border-[#222a3d] overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
          <thead>
            <tr className="border-b border-white/10 text-[#a08e7a]">
              <th className="py-2.5 px-3 font-medium">#</th>
              <th className="py-2.5 px-3 font-medium">Player</th>
              <th className="py-2.5 px-3 font-medium text-right">Score</th>
              <th className="py-2.5 px-3 font-medium text-right">Floor</th>
              <th className="py-2.5 px-3 font-medium text-right">Slain</th>
              <th className="py-2.5 px-3 font-medium text-right">Gold</th>
              <th className="py-2.5 px-3 font-medium text-right">Result</th>
            </tr>
          </thead>
          <tbody>
            {career.leaderboard.map((entry, index) => {
              const isCurrent = highlightEntryId === entry.id;
              const displayName = entry.playerName || entry.className;
              return (
                <tr
                  key={entry.id}
                  className={`border-b border-white/5 last:border-b-0 ${
                    isCurrent ? 'bg-[#f59e0b]/12' : 'hover:bg-[#131b2e]/70'
                  }`}
                >
                  <td className="py-2.5 px-3 text-[#a08e7a] align-top">#{index + 1}</td>
                  <td className="py-2.5 px-3 text-[#dae2fd] max-w-[180px]">
                    <div className="truncate">
                      <span className="font-semibold">{displayName}</span>
                      <span className="text-[#a08e7a] ml-1.5 hidden sm:inline">
                        ({entry.className.split(' ')[0]})
                      </span>
                    </div>
                    {entry.legendaryWeapon && (
                      <div className="text-[10px] text-[#ffc174] truncate mt-0.5">
                        Relic: {entry.legendaryWeapon.name} (+{entry.legendaryWeapon.bonusAtk} ATK)
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#ffc174] align-top">
                    {entry.score.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#4cd7f6] align-top">
                    F{entry.floor}
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#dae2fd] align-top">
                    {entry.enemiesDefeated}
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#fbbf24] align-top">
                    {entry.gold}
                  </td>
                  <td className="py-2.5 px-3 text-right align-top">
                    <span className={entry.victory ? 'text-[#6ee7b7]' : 'text-[#ffb4ab]'}>
                      {entry.victory ? 'Victory' : 'Fallen'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
