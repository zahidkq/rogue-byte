import React from 'react';
import { StatusEffect } from '../types/game';

interface StatusBadgesProps {
  statusEffects?: StatusEffect[];
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadges: React.FC<StatusBadgesProps> = ({
  statusEffects,
  className = '',
  size = 'md',
}) => {
  if (!statusEffects || statusEffects.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {statusEffects.map((eff) => {
        const isPoison = eff.type === 'poison';
        const colorClass = isPoison
          ? 'bg-[#10b981]/20 border-[#10b981]/60 text-[#6ee7b7] shadow-[0_0_10px_rgba(16,185,129,0.3)]'
          : 'bg-[#06b6d4]/20 border-[#06b6d4]/60 text-[#4cd7f6] shadow-[0_0_10px_rgba(6,182,212,0.3)]';

        return (
          <span
            key={eff.id || eff.type}
            className={`inline-flex items-center gap-1 rounded-[3px] border font-mono font-semibold tracking-wide transition-all ${
              size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
            } ${colorClass}`}
            title={
              isPoison
                ? `Poison: Burns for -${eff.potency} HP/turn in combat, or 1 dmg every 3 exploration steps.`
                : 'Slow: Enemies move 2x speed in exploration, and combat flee chance is reduced.'
            }
          >
            <span>{eff.icon}</span>
            <span>{eff.name}</span>
            <span className="opacity-75">({eff.duration})</span>
          </span>
        );
      })}
    </div>
  );
};
