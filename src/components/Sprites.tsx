import React from 'react';
import {
  EnemyArchetypeId,
  HeroClassId,
  InventoryItemId,
  LootType,
  TrapType,
} from '../types/game';

export const HeroSprite: React.FC<{
  classId: HeroClassId;
  className?: string;
  flipX?: boolean;
}> = ({ classId, className = 'w-7 h-7', flipX = false }) => {
  const primary =
    classId === 'volt' ? '#06b6d4' : classId === 'aegis' ? '#8b5cf6' : '#f59e0b';
  const highlight =
    classId === 'volt' ? '#67e8f9' : classId === 'aegis' ? '#d5c3ff' : '#fde68a';

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={`${className} transition-transform duration-150 ${
        flipX ? '-scale-x-100' : 'scale-x-100'
      }`}
      aria-hidden="true"
    >
      {/* Ground aura */}
      <ellipse cx="16" cy="27" rx="9" ry="2.5" fill={primary} fillOpacity="0.28" />
      {/* Cloak / Shoulders */}
      <path
        d="M8 25L10 14H22L24 25H8Z"
        fill="#1e293b"
        stroke={primary}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Chest core */}
      <path d="M14 16H18L17 22H15L14 16Z" fill={primary} />
      {/* Helmet / Visor */}
      <rect
        x="10.5"
        y="6"
        width="11"
        height="9"
        rx="2.5"
        fill="#0f172a"
        stroke={highlight}
        strokeWidth="1.6"
      />
      {/* Glowing tactical visor */}
      <rect x="12.5" y="9.5" width="7" height="2.4" rx="1" fill={primary} />
      {/* Weapon silhouette */}
      {classId === 'volt' ? (
        <path d="M24 9L27 21" stroke="#67e8f9" strokeWidth="2" strokeLinecap="round" />
      ) : classId === 'aegis' ? (
        <path
          d="M5.5 13H10.5V21L8 23.5L5.5 21V13Z"
          fill="#312e81"
          stroke="#d5c3ff"
          strokeWidth="1.4"
        />
      ) : (
        <path d="M25 8V22M22.5 18H27.5" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" />
      )}
    </svg>
  );
};

export const EnemySprite: React.FC<{
  archetypeId: EnemyArchetypeId;
  className?: string;
}> = ({ archetypeId, className = 'w-7 h-7' }) => {
  switch (archetypeId) {
    case 'scrap_rat':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <ellipse cx="16" cy="26" rx="8" ry="2" fill="#ef4444" fillOpacity="0.22" />
          <path
            d="M7 22C7 16 11 13 17 13C22 13 25 16 25 22H7Z"
            fill="#27272a"
            stroke="#ef4444"
            strokeWidth="1.5"
          />
          <circle cx="11" cy="12" r="2.5" fill="#18181b" stroke="#f87171" strokeWidth="1.3" />
          <circle cx="20" cy="12" r="2.5" fill="#18181b" stroke="#f87171" strokeWidth="1.3" />
          <circle cx="13.5" cy="18" r="1.4" fill="#ef4444" />
          <circle cx="18.5" cy="18" r="1.4" fill="#ef4444" />
          <path d="M25 20C28 19 29 16 27 14" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'null_goblin':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <ellipse cx="16" cy="27" rx="8" ry="2" fill="#ef4444" fillOpacity="0.25" />
          <path d="M9 25L11 15H21L23 25H9Z" fill="#1f2937" stroke="#ef4444" strokeWidth="1.5" />
          <path d="M6 10L11 11L11 7L6 10Z" fill="#7f1d1d" stroke="#fca5a5" strokeWidth="1.2" />
          <path d="M26 10L21 11L21 7L26 10Z" fill="#7f1d1d" stroke="#fca5a5" strokeWidth="1.2" />
          <rect x="11" y="7" width="10" height="8" rx="2" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
          <path d="M13 10.5L15 11.5M19 10.5L17 11.5" stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M24 14L27 23" stroke="#fca5a5" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'rust_sentinel':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <ellipse cx="16" cy="27.5" rx="9.5" ry="2.2" fill="#f59e0b" fillOpacity="0.22" />
          <rect x="7" y="12" width="18" height="13" rx="2" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.6" />
          <rect x="10" y="5.5" width="12" height="7" rx="1.5" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.5" />
          <rect x="12" y="8" width="8" height="2" fill="#ef4444" />
          <path d="M10 17H22M16 14V22" stroke="#64748b" strokeWidth="1.4" />
        </svg>
      );
    case 'blight_drone':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <ellipse cx="16" cy="27" rx="7" ry="1.8" fill="#10b981" fillOpacity="0.28" />
          <circle cx="16" cy="14" r="7.5" fill="#064e3b" stroke="#10b981" strokeWidth="1.6" />
          <circle cx="16" cy="14" r="3" fill="#34d399" />
          <path d="M6 12L9 14L6 16M26 12L23 14L26 16" stroke="#10b981" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M12 21L11 25M16 22V26M20 21L21 25" stroke="#6ee7b7" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'void_stalker':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <ellipse cx="16" cy="27" rx="9" ry="2.2" fill="#8b5cf6" fillOpacity="0.3" />
          <path
            d="M7 25L10 11L16 6L22 11L25 25L20 22L16 26L12 22L7 25Z"
            fill="#1e1b4b"
            stroke="#a78bfa"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M12.5 13L15 14.5M19.5 13L17 14.5" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'arcane_wraith':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <ellipse cx="16" cy="27.5" rx="8" ry="2" fill="#8b5cf6" fillOpacity="0.35" />
          <path
            d="M16 4L23 11L21 24L16 20L11 24L9 11L16 4Z"
            fill="#2e1065"
            stroke="#d5c3ff"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="12.5" r="2.8" fill="#4cd7f6" />
          <circle cx="16" cy="12.5" r="5" stroke="#a78bfa" strokeOpacity="0.5" strokeDasharray="2 2" />
        </svg>
      );
    case 'floor_warden':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <ellipse cx="16" cy="28.5" rx="12" ry="2.5" fill="#8b5cf6" fillOpacity="0.4" />
          {/* Sweeping Cyber Wings / Pauldrons */}
          <path
            d="M3 14L8 9L10 22L4 21L3 14Z"
            fill="#311042"
            stroke="#d5c3ff"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M29 14L24 9L22 22L28 21L29 14Z"
            fill="#311042"
            stroke="#d5c3ff"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* Core Armored Torso */}
          <path
            d="M7 26L9 10L16 5.5L23 10L25 26H7Z"
            fill="#1e1b4b"
            stroke="#fbbf24"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          {/* Crown Horns */}
          <path d="M9 3.5L12.5 8.5M23 3.5L19.5 8.5M16 2.5V6" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" />
          {/* Crimson Visor */}
          <path d="M11 12.5L16 14L21 12.5V15.5L16 16.5L11 15.5V12.5Z" fill="#ef4444" />
          {/* Arc Reactor Chest Core */}
          <polygon points="16,18 19.5,21.5 16,25 12.5,21.5" fill="#8b5cf6" stroke="#4cd7f6" strokeWidth="1.2" />
        </svg>
      );
  }
};

export const LootSprite: React.FC<{ type: LootType; className?: string }> = ({
  type,
  className = 'w-6 h-6',
}) => {
  if (type === 'gold') {
    return (
      <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
        <circle cx="12" cy="16" r="5.5" fill="#d97706" stroke="#fde68a" strokeWidth="1.4" />
        <circle cx="17" cy="13" r="5.5" fill="#f59e0b" stroke="#fef3c7" strokeWidth="1.4" />
        <path d="M17 10.5V15.5M15.2 13H18.8" stroke="#472a00" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'med_vial') {
    return (
      <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
        <rect x="11.5" y="4" width="5" height="3" rx="0.8" fill="#94a3b8" />
        <path
          d="M10 8H18L20 14V21C20 22.5 18.8 23.5 17.5 23.5H10.5C9.2 23.5 8 22.5 8 21V14L10 8Z"
          fill="#064e3b"
          stroke="#10b981"
          strokeWidth="1.5"
        />
        <path d="M14 13V19M11 16H17" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'aegis_cell') {
    return (
      <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
        <path
          d="M14 4L22 7.5V14.5C22 19.5 18.5 22.8 14 24.5C9.5 22.8 6 19.5 6 14.5V7.5L14 4Z"
          fill="#083344"
          stroke="#06b6d4"
          strokeWidth="1.6"
        />
        <path d="M14 9V19M10 14H18" stroke="#67e8f9" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'overdrive_core') {
    return (
      <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
        <polygon
          points="14,3 23,10 20,23 8,23 5,10"
          fill="#451a03"
          stroke="#f59e0b"
          strokeWidth="1.6"
        />
        <polygon points="14,8 18,13 14,19 10,13" fill="#fbbf24" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
      <circle cx="14" cy="15" r="7.5" fill="#2e1065" stroke="#8b5cf6" strokeWidth="1.6" />
      <path d="M14 7.5L16.5 4.5M16.5 4.5L19 5.5" stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 11L11.5 15.5H15L13.5 19.5" stroke="#d5c3ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const ItemIcon: React.FC<{ id: InventoryItemId; className?: string }> = ({
  id,
  className,
}) => <LootSprite type={id} className={className} />;

export const TrapSprite: React.FC<{
  type: TrapType;
  triggered: boolean;
  className?: string;
}> = ({ type, triggered, className = 'w-6 h-6' }) => {
  const stroke = triggered ? '#64748b' : type === 'biomine' ? '#10b981' : '#ef4444';
  const fill = triggered ? '#1e293b' : type === 'biomine' ? '#064e3b' : '#450a0a';

  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
      <rect
        x="5"
        y="5"
        width="18"
        height="18"
        rx="2"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.4"
        strokeDasharray={triggered ? '3 2' : undefined}
      />
      {triggered ? (
        <path d="M9 9L19 19M19 9L9 19" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
      ) : (
        <>
          <path d="M9 19L14 8L19 19H9Z" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="14" cy="16" r="1.2" fill={stroke} />
        </>
      )}
    </svg>
  );
};

export const StairsSprite: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
    <rect
      x="4"
      y="4"
      width="24"
      height="24"
      rx="3"
      fill="#1e1b4b"
      stroke="#f59e0b"
      strokeWidth="1.6"
    />
    <path
      d="M9 11H15V15H19V19H23V23"
      stroke="#fbbf24"
      strokeWidth="2.2"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
    <path d="M18 10L23 15M23 15H19M23 15V11" stroke="#4cd7f6" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
