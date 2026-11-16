import React, { useEffect, useState } from 'react';
import { Backpack, BookOpen, Coins, Shield, ShoppingBag, Sword, X } from 'lucide-react';
import { ENEMY_ARCHETYPES, ITEM_CATALOG } from '../engine/dungeon';
import {
  EnemyArchetypeId,
  HeroState,
  InventoryItem,
  InventoryItemId,
  ItemRarity,
} from '../types/game';
import { EnemySprite, HeroSprite, ItemIcon } from './Sprites';

interface InventoryModalProps {
  hero: HeroState;
  inventory: InventoryItem[];
  encounteredArchetypes: EnemyArchetypeId[];
  onClose: () => void;
  onUseItem: (itemId: InventoryItemId) => void;
  onBuyItem: (itemId: InventoryItemId, cost: number) => void;
  onUpgradeWeapon: (cost: number) => void;
  onUpgradeArmor: (cost: number) => void;
}

const RARITY_BORDER: Record<ItemRarity, string> = {
  common: 'border-slate-500/50',
  rare: 'border-[#06b6d4]/70',
  legendary: 'border-[#f59e0b]/80',
  cursed: 'border-[#8b5cf6]/80',
};

const RARITY_TEXT: Record<ItemRarity, string> = {
  common: 'text-slate-300',
  rare: 'text-[#4cd7f6]',
  legendary: 'text-[#ffc174]',
  cursed: 'text-[#d5c3ff]',
};

export const InventoryModal: React.FC<InventoryModalProps> = ({
  hero,
  inventory,
  encounteredArchetypes,
  onClose,
  onUseItem,
  onBuyItem,
  onUpgradeWeapon,
  onUpgradeArmor,
}) => {
  const [tab, setTab] = useState<'pack' | 'forge' | 'bestiary'>('pack');
  const [selectedItemId, setSelectedItemId] = useState<InventoryItemId | null>(
    inventory[0]?.id ?? null
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const selectedItem =
    inventory.find((i) => i.id === selectedItemId) ?? inventory[0] ?? null;

  const weaponUpgradeCost = 40 + (hero.weaponLevel - 1) * 35;
  const armorUpgradeCost = 40 + (hero.armorLevel - 1) * 35;

  const shopItems: { id: InventoryItemId; cost: number }[] = [
    { id: 'med_vial', cost: 25 },
    { id: 'aegis_cell', cost: 35 },
    { id: 'shock_bomb', cost: 40 },
    { id: 'overdrive_core', cost: 55 },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#060e20]/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Inventory and tactical supplies"
    >
      <div className="w-full max-w-2xl rounded-lg bg-[#0f172a] border border-[#06b6d4]/40 shadow-[0_0_24px_rgba(6,182,212,0.16),0_16px_40px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#131b2e] border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[4px] bg-[#060e20] border border-[#222a3d] flex items-center justify-center">
              <HeroSprite classId={hero.classId} className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-[#dae2fd]">
                Field Pack & Armory
              </h2>
              <div className="flex items-center gap-2 text-xs font-mono text-[#a08e7a] tabular-nums">
                <span className="text-[#ffc174]">{hero.gold} Gold</span>
                <span aria-hidden="true">·</span>
                <span>ATK {hero.atk}</span>
                <span aria-hidden="true">·</span>
                <span>DEF {hero.def}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-[4px] bg-[#060e20] border border-white/10 text-[#a08e7a] hover:text-[#dae2fd] hover:border-white/25 transition-colors cursor-pointer"
            aria-label="Close inventory"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#0b1326] border-b border-white/10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab('pack')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-xs font-mono font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              tab === 'pack'
                ? 'bg-[#f59e0b]/20 border border-[#f59e0b] text-[#ffc174]'
                : 'bg-[#131b2e] border border-white/10 text-[#a08e7a] hover:text-[#dae2fd]'
            }`}
          >
            <Backpack className="w-3.5 h-3.5" />
            <span>Consumables ({inventory.reduce((s, i) => s + i.quantity, 0)})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('forge')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-xs font-mono font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              tab === 'forge'
                ? 'bg-[#06b6d4]/20 border border-[#06b6d4] text-[#4cd7f6]'
                : 'bg-[#131b2e] border border-white/10 text-[#a08e7a] hover:text-[#dae2fd]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Supply Cache</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('bestiary')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-xs font-mono font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              tab === 'bestiary'
                ? 'bg-[#8b5cf6]/20 border border-[#8b5cf6] text-[#d5c3ff]'
                : 'bg-[#131b2e] border border-white/10 text-[#a08e7a] hover:text-[#dae2fd]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Bestiary ({encounteredArchetypes.length}/7)</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[#0b1326]">
          {tab === 'pack' && (
            <div className="flex flex-col gap-5">
              {/* Equipped Gear */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[4px] bg-[#060e20] border border-[#f59e0b]/40 flex items-center justify-center shrink-0">
                    <Sword className="w-5 h-5 text-[#ffc174]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-mono text-[#a08e7a]">Equipped Weapon</div>
                    <div className="text-sm font-display font-semibold text-[#dae2fd] truncate">
                      {hero.weaponName} +{hero.weaponLevel}
                    </div>
                  </div>
                </div>
                <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[4px] bg-[#060e20] border border-[#06b6d4]/40 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-[#4cd7f6]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-mono text-[#a08e7a]">Equipped Plating</div>
                    <div className="text-sm font-display font-semibold text-[#dae2fd] truncate">
                      {hero.armorName} +{hero.armorLevel}
                    </div>
                  </div>
                </div>
              </div>

              {/* Item Nodes Grid */}
              <div className="flex flex-col gap-2">
                <div className="text-xs font-mono text-[#a08e7a]">
                  Stored Consumables
                </div>
                {inventory.length === 0 ? (
                  <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-4 text-xs text-[#a08e7a]">
                    Your pack is empty. Gather vials from dungeon rooms or purchase supplies using Gold in the Supply Cache tab.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {inventory.map((item) => {
                      const isSelected = selectedItem?.id === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedItemId(item.id)}
                          className={`relative w-14 h-14 rounded-[4px] bg-[#0f172a] border flex items-center justify-center transition-all cursor-pointer ${
                            RARITY_BORDER[item.rarity]
                          } ${
                            isSelected
                              ? 'ring-2 ring-[#ffc174] scale-[1.03]'
                              : 'hover:brightness-125'
                          }`}
                          aria-label={item.name}
                        >
                          <ItemIcon id={item.id} className="w-8 h-8" />
                          <span className="absolute bottom-0.5 right-1 text-[10px] font-mono font-bold text-[#dae2fd] bg-[#060e20]/85 px-1 rounded-xs tabular-nums">
                            x{item.quantity}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected Item Detail */}
              {selectedItem && (
                <div className="rounded-lg bg-[#131b2e] border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-[4px] bg-[#060e20] border flex items-center justify-center shrink-0 ${
                        RARITY_BORDER[selectedItem.rarity]
                      }`}
                    >
                      <ItemIcon id={selectedItem.id} className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-bold text-[#dae2fd]">
                          {selectedItem.name}
                        </span>
                        <span className={`text-xs font-mono capitalize ${RARITY_TEXT[selectedItem.rarity]}`}>
                          {selectedItem.rarity}
                        </span>
                      </div>
                      <p className="text-xs text-[#a08e7a] mt-1">
                        {selectedItem.description}
                      </p>
                    </div>
                  </div>

                  {selectedItem.usableInExploration ? (
                    <button
                      type="button"
                      onClick={() => onUseItem(selectedItem.id)}
                      className="px-4 py-2 rounded-[4px] bg-gradient-to-b from-[#f59e0b] to-[#d97706] text-[#090d16] font-display text-xs font-bold uppercase tracking-wide whitespace-nowrap shrink-0 cursor-pointer hover:brightness-110"
                    >
                      Use Now
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-[#a08e7a] whitespace-nowrap shrink-0">
                      Combat Only
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'forge' && (
            <div className="flex flex-col gap-5">
              {/* Gear Upgrades */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#a08e7a]">
                  <span>Field Gear Upgrades</span>
                  <span className="inline-flex items-center gap-1 text-[#ffc174]">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{hero.gold} Gold Available</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3.5 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-display font-semibold text-[#dae2fd]">
                        Sharpen Weapon
                      </div>
                      <div className="text-xs text-[#a08e7a] mt-0.5">
                        +2 Attack permanently
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={hero.gold < weaponUpgradeCost}
                      onClick={() => onUpgradeWeapon(weaponUpgradeCost)}
                      className="px-3 py-2 rounded-[4px] bg-[#f59e0b]/15 border border-[#f59e0b] text-[#ffc174] font-mono text-xs font-semibold hover:bg-[#f59e0b]/25 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {weaponUpgradeCost} G
                    </button>
                  </div>

                  <div className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3.5 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-display font-semibold text-[#dae2fd]">
                        Reinforce Armor
                      </div>
                      <div className="text-xs text-[#a08e7a] mt-0.5">
                        +1 Defense & +4 Max HP
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={hero.gold < armorUpgradeCost}
                      onClick={() => onUpgradeArmor(armorUpgradeCost)}
                      className="px-3 py-2 rounded-[4px] bg-[#06b6d4]/15 border border-[#06b6d4] text-[#4cd7f6] font-mono text-xs font-semibold hover:bg-[#06b6d4]/25 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {armorUpgradeCost} G
                    </button>
                  </div>
                </div>
              </div>

              {/* Buy Consumables */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-mono text-[#a08e7a]">
                  Requisition Consumables
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {shopItems.map(({ id, cost }) => {
                    const meta = ITEM_CATALOG[id];
                    const canAfford = hero.gold >= cost;
                    return (
                      <div
                        key={id}
                        className="rounded-[4px] bg-[#131b2e] border border-white/10 p-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-[4px] bg-[#060e20] border border-[#222a3d] flex items-center justify-center shrink-0">
                            <ItemIcon id={id} className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-display font-semibold text-[#dae2fd] truncate">
                              {meta.name}
                            </div>
                            <div className="text-[11px] text-[#a08e7a] truncate">
                              {meta.description}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={!canAfford}
                          onClick={() => onBuyItem(id, cost)}
                          className="px-3 py-1.5 rounded-[4px] bg-[#10b981]/15 border border-[#10b981] text-[#6ee7b7] font-mono text-xs font-semibold hover:bg-[#10b981]/25 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {cost} G
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === 'bestiary' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(ENEMY_ARCHETYPES).map((arch) => {
                const seen = encounteredArchetypes.includes(arch.id);
                return (
                  <div
                    key={arch.id}
                    className={`rounded-[4px] border p-3 flex items-start gap-3 ${
                      seen
                        ? 'bg-[#131b2e] border-white/10'
                        : 'bg-[#060e20] border-[#222a3d] opacity-60'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-[4px] bg-[#060e20] border border-[#222a3d] flex items-center justify-center shrink-0">
                      <EnemySprite
                        archetypeId={arch.id}
                        className={`w-8 h-8 ${seen ? '' : 'brightness-0 invert opacity-20'}`}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs font-display font-bold text-[#dae2fd]">
                        <span>{seen ? arch.name : 'Unknown Hostile'}</span>
                        <span className="font-mono text-[11px] text-[#a08e7a]">
                          Floor {arch.minFloor}+
                        </span>
                      </div>
                      <p className="text-[11px] text-[#a08e7a] mt-1 leading-snug">
                        {seen
                          ? arch.description
                          : 'Encounter this enemy in the dungeon to log its combat telemetry.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
