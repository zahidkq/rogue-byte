import React from 'react';

interface SegmentedBarProps {
  current: number;
  max: number;
  segments?: number;
  color: 'crimson' | 'cyan' | 'amber' | 'emerald' | 'violet';
  label?: string;
  showText?: boolean;
  className?: string;
}

const COLOR_MAP = {
  crimson: {
    active: 'bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.45)]',
    text: 'text-[#ffb4ab]',
  },
  cyan: {
    active: 'bg-[#06b6d4] shadow-[0_0_8px_rgba(6,182,212,0.45)]',
    text: 'text-[#4cd7f6]',
  },
  amber: {
    active: 'bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.45)]',
    text: 'text-[#ffc174]',
  },
  emerald: {
    active: 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.45)]',
    text: 'text-[#6ee7b7]',
  },
  violet: {
    active: 'bg-[#8b5cf6] shadow-[0_0_8px_rgba(139,92,246,0.45)]',
    text: 'text-[#d5c3ff]',
  },
};

export const SegmentedBar: React.FC<SegmentedBarProps> = ({
  current,
  max,
  segments = 10,
  color,
  label,
  showText = true,
  className = '',
}) => {
  const safeMax = Math.max(1, max);
  const clamped = Math.max(0, Math.min(safeMax, current));
  const ratio = clamped / safeMax;
  const filledSegments = clamped === 0 ? 0 : Math.max(1, Math.round(ratio * segments));
  const styles = COLOR_MAP[color];

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {(label || showText) && (
        <div className="flex items-center justify-between gap-2 text-xs font-mono tabular-nums">
          {label ? <span className="text-[#a08e7a] tracking-wide">{label}</span> : <span />}
          {showText && (
            <span className={`font-semibold ${styles.text}`}>
              {clamped}/{safeMax}
            </span>
          )}
        </div>
      )}
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${segments}, minmax(0, 1fr))` }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
      >
        {Array.from({ length: segments }).map((_, idx) => {
          const isFilled = idx < filledSegments;
          return (
            <div
              key={idx}
              className={`h-2 rounded-[2px] transition-all duration-150 ${
                isFilled ? styles.active : 'bg-[#060e20] border border-[#222a3d]'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
