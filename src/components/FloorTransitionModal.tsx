import React, { useEffect, useState } from 'react';
import {
  ArrowDownRight,
  Check,
  Coins,
  FlaskConical,
  Shield,
  ShoppingBag,
  Sword,
} from 'lucide-react';
import { MERCHANT_CATALOG } from '../engine/dungeon';
import { HeroState, InventoryItem, MerchantItem } from '../types/game';
import { ItemIcon, StairsSprite } from './Sprites';

interface FloorTransitionModalProps {
  currentFloor: number;
  hero: HeroState;
  inventory: InventoryItem[];
  purchasedShopIds: string[];
  scoreBonus: number;
  onBuyMerchantItem: (item: MerchantItem) => void;
  onContinueNextFloor: () => void;
  onStay: () => void;
}

export const FloorTransitionModal: React.FC<FloorTransitionModalProps> = ({
  currentFloor,
  hero,
  inventory,
  purchasedShopIds,
  scoreBonus,
  onBuyMerchantItem,
  onContinueNextFloor,
  onStay,
}) => {
  const [category, setCategory] = useState<'all' | 'weapon' | 'armor' | 'potion'>('all');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onStay();
      } else if (
        (e.key === 'Enter' || e.key === ' ') &&
        !(document.activeElement instanceof HTMLButtonElement)
      ) {
        e.preventDefault();
        onContinueNextFloor();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onContinueNextFloor, onStay]);

  const medVials = inventory.find((i) => i.id === 'med_vial')?.quantity ?? 0;
  const shieldCells = inventory.find((i) => i.id === 'aegis_cell')?.quantity ?? 0;
  const shockBombs = inventory.find((i) => i.id === 'shock_bomb')?.quantity ?? 0;

  const visibleItems = MERCHANT_CATALOG.filter((item) => {
    if (item.minFloor && currentFloor < item.minFloor) return false;
    if (category === 'all') return true;
    return item.category === category;
  });

  const renderCategoryIcon = (cat: MerchantItem['category']) => {
    if (cat === 'weapon') return <Sword className="w-5 h-5 text-[#ffc174]" />;
    if (cat === 'armor') return <Shield className="w-5 h-5 text-[#4cd7f6]" />;
    return <FlaskConical className="w-5 h-5 text-[#6ee7b7]" />;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#060e20]/90 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={`Inter-floor gear shop after Floor ${currentFloor}`}
    >
      <div className="w-full max-w-3xl rounded-lg bg-[#0f172a] border border-[#f59e0b]/50 shadow-[0_0_24px_rgba(245,158,11,0.18),0_16px_40px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-[#131b2e] border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[4px] bg-[#060e20] border border-[#f59e0b]/40 flex items-center justify-center shrink-0">
              <StairsSprite className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-mono text-[#ffc174]">
                Floor {currentFloor} Cleared · +{scoreBonus} Descent Bonus
              </p>
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#dae2fd]">
                Inter-Floor Merchant & Armory
              </h2>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[4px] bg-[#060e20] border border-[#f59e0b]/40 text-sm font-mono font-bold text-[#ffc174] tabular-nums shrink-0">
            <Coins className="w-4 h-4" />
            <span>{hero.gold} Gold</span>
          </div>
        </div>

        {/* Live Hero Stats & Inventory Telemetry */}
        <div className="px-5 sm:px-6 py-3 bg-[#060e20] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono tabular-nums">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[#ffb4ab]">
              HP {hero.hp}/{hero.maxHp}
            </span>
            <span aria-hidden="true" className="text-[#534434]">·</span>
            <span className="text-[#4cd7f6]">Shield {hero.shield}</span>
            <span aria-hidden="true" className="text-[#534434]">·</span>
            <span className="text-[#ffc174]">ATK {hero.atk}</span>
            <span aria-hidden="true" className="text-[#534434]">·</span>
            <span className="text-[#dae2fd]">DEF {hero.def}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[#a08e7a]">
            <span>Med Vials: <strong className="text-[#6ee7b7]">{medVials}</strong></span>
            <span>Shield Cells: <strong className="text-[#4cd7f6]">{shieldCells}</strong></span>
            <span>Bombs: <strong className="text-[#d5c3ff]">{shockBombs}</strong></span>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="px-5 sm:px-6 py-2.5 bg-[#0b1326] border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {(
              [
                { id: 'all', label: 'All Stock' },
                { id: 'weapon', label: 'Weapons' },
                { id: 'armor', label: 'Shields & Armor' },
                { id: 'potion', label: 'Potions' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setCategory(t.id)}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-mono font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  category === t.id
                    ? 'bg-[#f59e0b]/20 border border-[#f59e0b] text-[#ffc174]'
                    : 'bg-[#131b2e] border border-white/10 text-[#a08e7a] hover:text-[#dae2fd]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-[#a08e7a] hidden sm:inline">
            Gear: {hero.weaponName} · {hero.armorName}
          </span>
        </div>

        {/* Merchant Inventory Grid */}
        <div className="p-5 sm:p-6 bg-[#0b1326] overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {visibleItems.map((item) => {
              const isOwned = Boolean(item.unique && purchasedShopIds.includes(item.id));
              const isFullHpElixir = Boolean(item.instantHeal && hero.hp >= hero.maxHp);
              const canAfford = hero.gold >= item.cost;
              const disabled = isOwned || !canAfford || isFullHpElixir;

              return (
                <div
                  key={item.id}
                  className={`rounded-lg border p-3.5 flex items-center justify-between gap-3 ${
                    isOwned
                      ? 'bg-[#131b2e]/50 border-white/5 opacity-70'
                      : 'bg-[#131b2e] border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-[4px] bg-[#060e20] border border-[#222a3d] flex items-center justify-center shrink-0">
                      {item.inventoryItemId ? (
                        <ItemIcon id={item.inventoryItemId} className="w-6 h-6" />
                      ) : (
                        renderCategoryIcon(item.category)
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-sm font-bold text-[#dae2fd] truncate">
                        {item.name}
                      </div>
                      <p className="text-xs text-[#a08e7a] mt-0.5 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onBuyMerchantItem(item)}
                    className={`px-3 py-2 rounded-[4px] font-mono text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                      isOwned
                        ? 'bg-[#10b981]/15 border border-[#10b981]/40 text-[#6ee7b7] cursor-default'
                        : isFullHpElixir
                        ? 'bg-[#060e20] border border-white/10 text-[#a08e7a] cursor-not-allowed'
                        : canAfford
                        ? 'bg-[#f59e0b]/20 border border-[#f59e0b] text-[#ffc174] hover:bg-[#f59e0b]/30 cursor-pointer'
                        : 'bg-[#060e20] border border-white/10 text-[#a08e7a] opacity-45 cursor-not-allowed'
                    }`}
                  >
                    {isOwned ? (
                      <span className="inline-flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Owned</span>
                      </span>
                    ) : isFullHpElixir ? (
                      <span>Full HP</span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{item.cost} G</span>
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-4 bg-[#131b2e] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onStay}
            className="w-full sm:w-auto px-4 py-2.5 rounded-[4px] bg-[#0f172a] border border-white/15 text-xs font-mono text-[#a08e7a] hover:text-[#dae2fd] hover:border-white/30 transition-colors whitespace-nowrap cursor-pointer"
          >
            Stay on Floor {currentFloor}
          </button>

          <button
            type="button"
            onClick={onContinueNextFloor}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-[4px] bg-gradient-to-b from-[#f59e0b] to-[#d97706] text-[#090d16] font-display text-sm font-bold uppercase tracking-wide border-t border-[#fde68a]/60 shadow-[0_0_16px_rgba(245,158,11,0.35)] hover:brightness-110 transition-all whitespace-nowrap cursor-pointer"
          >
            <span>
              Continue to Floor {currentFloor + 1}
              {currentFloor + 1 === 3 ? ' (Final)' : ''}
            </span>
            <ArrowDownRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
