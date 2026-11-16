import React from 'react';
import { DungeonFloor, FloatingPopup, HeroState } from '../types/game';
import { EnemySprite, HeroSprite, LootSprite, StairsSprite, TrapSprite } from './Sprites';

interface DungeonCanvasProps {
  floor: DungeonFloor;
  hero: HeroState;
  popups: FloatingPopup[];
  lastStep?: { dx: number; dy: number; seq: number; isBump?: boolean };
  onTileClick: (x: number, y: number) => void;
}

export const DungeonCanvas: React.FC<DungeonCanvasProps> = ({
  floor,
  hero,
  popups,
  lastStep,
  onTileClick,
}) => {
  const heroFlipped =
    (hero.horizontalFacing ?? (hero.facing === 'left' ? 'left' : 'right')) === 'left';

  let stepAnimClass = '';
  if (lastStep && lastStep.seq > 0) {
    if (lastStep.isBump) {
      if (lastStep.dx < 0) stepAnimClass = 'animate-bump-left';
      else if (lastStep.dx > 0) stepAnimClass = 'animate-bump-right';
      else if (lastStep.dy < 0) stepAnimClass = 'animate-bump-up';
      else if (lastStep.dy > 0) stepAnimClass = 'animate-bump-down';
    } else {
      if (lastStep.dx < 0) stepAnimClass = 'animate-step-left';
      else if (lastStep.dx > 0) stepAnimClass = 'animate-step-right';
      else if (lastStep.dy < 0) stepAnimClass = 'animate-step-up';
      else if (lastStep.dy > 0) stepAnimClass = 'animate-step-down';
    }
  }

  return (
    <div className="relative w-full flex items-center justify-center select-none">
      <div
        className="relative w-full max-w-[780px] rounded-lg bg-[#060e20] border border-[#f59e0b]/20 p-2 sm:p-3 shadow-[0_12px_36px_rgba(0,0,0,0.75)]"
      >
        <div
          className="grid gap-[2px] w-full"
          style={{
            gridTemplateColumns: `repeat(${floor.width}, minmax(0, 1fr))`,
          }}
        >
          {floor.tiles.map((row, y) =>
            row.map((tile, x) => {
              const isVisible = floor.visible[y]?.[x] ?? false;
              const isExplored = floor.explored[y]?.[x] ?? false;
              const isHero = hero.x === x && hero.y === y;

              const enemy = isVisible
                ? floor.enemies.find((e) => e.x === x && e.y === y)
                : undefined;
              const loot = isVisible
                ? floor.loot.find((l) => l.x === x && l.y === y)
                : undefined;
              const trap = floor.traps.find(
                (t) => t.x === x && t.y === y && (t.revealed || t.triggered) && (isVisible || isExplored)
              );

              const distToHero = Math.abs(x - hero.x) + Math.abs(y - hero.y);
              const isAdjacentMoveable = distToHero === 1 && tile !== 'WALL';

              const tilePopups = popups.filter((p) => p.x === x && p.y === y);

              // Visual styling based on fog-of-war state
              let bgClass = 'bg-[#060e20]'; // Unexplored void
              let borderClass = 'border-transparent';

              if (isVisible) {
                if (tile === 'WALL') {
                  bgClass = 'bg-[#1e293b]';
                  borderClass = 'border-[#334155]/70';
                } else if (tile === 'STAIRS') {
                  bgClass = 'bg-[#1e1b4b]/90';
                  borderClass = 'border-[#f59e0b]/60';
                } else {
                  bgClass = 'bg-[#11192d]';
                  borderClass = isAdjacentMoveable
                    ? 'border-[#f59e0b]/30 hover:border-[#f59e0b]/75 hover:bg-[#192440]'
                    : 'border-[#1e293b]/70';
                }
              } else if (isExplored) {
                if (tile === 'WALL') {
                  bgClass = 'bg-[#0f172a]';
                  borderClass = 'border-[#1e293b]/50';
                } else if (tile === 'STAIRS') {
                  bgClass = 'bg-[#17153b]/60';
                  borderClass = 'border-[#f59e0b]/30';
                } else {
                  bgClass = 'bg-[#0b1326]';
                  borderClass = 'border-[#171f33]/60';
                }
              }

              return (
                <button
                  key={`${x}-${y}`}
                  type="button"
                  onClick={() => onTileClick(x, y)}
                  disabled={!isExplored && !isVisible}
                  aria-label={`Tile ${x},${y} ${tile.toLowerCase()}${enemy ? ` with ${enemy.name}` : ''}`}
                  className={`relative aspect-square w-full rounded-[3px] border flex items-center justify-center transition-colors duration-150 ${bgClass} ${borderClass} ${
                    isAdjacentMoveable ? 'cursor-pointer' : isExplored && tile !== 'WALL' ? 'cursor-pointer' : 'cursor-default'
                  } focus:outline-none focus-visible:ring-1 focus-visible:ring-[#f59e0b]`}
                >
                  {/* Subtle wall bevel texture */}
                  {isExplored && tile === 'WALL' && (
                    <div
                      className={`w-[55%] h-[55%] rounded-[2px] ${
                        isVisible ? 'bg-[#31394d]/55' : 'bg-[#171f33]/45'
                      }`}
                    />
                  )}

                  {/* Stairs */}
                  {isExplored && tile === 'STAIRS' && !isHero && !enemy && (
                    <div className={isVisible ? 'opacity-100' : 'opacity-50'}>
                      <StairsSprite className="w-[74%] h-[74%] mx-auto" />
                    </div>
                  )}

                  {/* Revealed/Sprung Trap */}
                  {trap && !isHero && !enemy && (
                    <div className={isVisible ? 'opacity-95' : 'opacity-45'}>
                      <TrapSprite
                        type={trap.type}
                        triggered={trap.triggered}
                        className="w-[68%] h-[68%] mx-auto"
                      />
                    </div>
                  )}

                  {/* Loot */}
                  {loot && !isHero && !enemy && (
                    <LootSprite type={loot.type} className="w-[68%] h-[68%]" />
                  )}

                  {/* Enemy */}
                  {enemy && (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <EnemySprite
                        archetypeId={enemy.archetypeId}
                        className="w-[82%] h-[82%] drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]"
                      />
                      {/* Mini HP bar under enemy if damaged */}
                      {enemy.hp < enemy.maxHp && (
                        <div className="absolute bottom-[2px] left-[12%] right-[12%] h-[3px] bg-[#060e20] rounded-xs overflow-hidden">
                          <div
                            className="h-full bg-[#ef4444]"
                            style={{ width: `${Math.max(8, (enemy.hp / enemy.maxHp) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hero with idle breathing, step hop, and directional facing */}
                  {isHero && (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div className="absolute inset-0 rounded-[3px] bg-[#f59e0b]/15 ring-1 ring-[#f59e0b]/60" />
                      <div
                        key={`step-${lastStep?.seq ?? 0}`}
                        className={`relative z-10 w-[84%] h-[84%] flex items-center justify-center ${stepAnimClass}`}
                      >
                        <div className="w-full h-full animate-hero-idle flex items-center justify-center">
                          <HeroSprite
                            classId={hero.classId}
                            flipX={heroFlipped}
                            className="w-full h-full drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Adjacent move affordance dot */}
                  {isAdjacentMoveable && !enemy && !loot && tile !== 'STAIRS' && !trap && (
                    <span className="w-1.5 h-1.5 rounded-xs bg-[#f59e0b]/35 pointer-events-none" />
                  )}

                  {/* Floating combat/loot popups */}
                  {tilePopups.map((popup) => (
                    <span
                      key={popup.id}
                      className="animate-float-up pointer-events-none absolute -top-2 left-1/2 z-30 text-[11px] font-mono font-bold whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
                      style={{ color: popup.color }}
                    >
                      {popup.text}
                    </span>
                  ))}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
