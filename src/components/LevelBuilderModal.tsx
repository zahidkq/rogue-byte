import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  Check,
  CheckCircle2,
  Coins,
  Copy,
  Download,
  Eraser,
  Eye,
  EyeOff,
  Flame,
  FolderOpen,
  LayoutGrid,
  Play,
  RotateCcw,
  Save,
  Share2,
  Shield,
  Skull,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import {
  applyMapTemplate,
  createDefaultCustomMap,
  validateCustomMap,
} from '../engine/customMap';
import {
  CustomMapData,
  CustomMapEntity,
  EnemyArchetypeId,
  HeroClassId,
  LootType,
  MapValidationResult,
  TrapType,
} from '../types/game';
import {
  deleteCustomMap,
  encodeCustomMap,
  getShareUrl,
  loadSavedCustomMaps,
  saveCustomMap,
  SHOWCASE_MAPS,
} from '../utils/customMapStorage';
import {
  EnemySprite,
  HeroSprite,
  LootSprite,
  StairsSprite,
  TrapSprite,
} from './Sprites';

export type BuilderTool =
  | { kind: 'tile'; tile: '#' | '.' }
  | { kind: 'spawn' }
  | { kind: 'exit' }
  | { kind: 'enemy'; archetypeId: EnemyArchetypeId }
  | { kind: 'trap'; trapType: TrapType }
  | { kind: 'loot'; lootType: LootType; goldAmount?: number }
  | { kind: 'eraser' };

interface LevelBuilderModalProps {
  initialMap?: CustomMapData | null;
  heroClassId: HeroClassId;
  onPlayMap: (map: CustomMapData) => void;
  onClose: () => void;
}

export const LevelBuilderModal: React.FC<LevelBuilderModalProps> = ({
  initialMap,
  heroClassId,
  onPlayMap,
  onClose,
}) => {
  const [map, setMap] = useState<CustomMapData>(() => initialMap ?? createDefaultCustomMap());
  const [selectedTool, setSelectedTool] = useState<BuilderTool>({ kind: 'tile', tile: '#' });
  const [showSolutionPath, setShowSolutionPath] = useState(true);
  const [activeTab, setActiveTab] = useState<'tiles' | 'monsters' | 'hazards' | 'loot'>('tiles');

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [importCodeInput, setImportCodeInput] = useState('');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [isMouseDown, setIsMouseDown] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Validate map reactively whenever tiles, spawn, exit, or entities change
  const validation: MapValidationResult = useMemo(() => {
    return validateCustomMap(map);
  }, [map]);

  const solutionPathSet = useMemo(() => {
    if (!validation.valid || !validation.pathCoords) return new Set<string>();
    return new Set(validation.pathCoords.map((c) => `${c.x},${c.y}`));
  }, [validation]);

  // Global mouseup listener to stop painting even if cursor leaves grid
  useEffect(() => {
    const handleMouseUp = () => setIsMouseDown(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Apply chosen tool to a specific cell
  const applyToolToCell = useCallback(
    (x: number, y: number) => {
      setMap((prev) => {
        const { width, height } = prev;
        if (x < 0 || x >= width || y < 0 || y >= height) return prev;

        const nextTiles = prev.tiles.map((row) => [...row]);
        let nextSpawn = { ...prev.spawn };
        let nextExit = { ...prev.exit };
        let nextEntities = prev.entities.filter((e) => !(e.x === x && e.y === y));

        if (selectedTool.kind === 'tile') {
          // If placing wall, clear any spawn or exit or entity on it
          nextTiles[y][x] = selectedTool.tile;
          if (selectedTool.tile === '#') {
            if (nextSpawn.x === x && nextSpawn.y === y) {
              // Cannot overwrite spawn with wall directly
              return prev;
            }
            if (nextExit.x === x && nextExit.y === y) {
              // Cannot overwrite exit with wall directly
              return prev;
            }
          }
        } else if (selectedTool.kind === 'spawn') {
          // Relocate spawn point
          nextTiles[y][x] = '.';
          if (nextExit.x === x && nextExit.y === y) {
            return prev; // Cannot place spawn on exit
          }
          nextSpawn = { x, y };
        } else if (selectedTool.kind === 'exit') {
          // Relocate exit point
          nextTiles[y][x] = '>';
          if (nextSpawn.x === x && nextSpawn.y === y) {
            return prev; // Cannot place exit on spawn
          }
          // Clear previous exit tile to floor
          if (nextExit.x < width && nextExit.y < height) {
            nextTiles[nextExit.y][nextExit.x] = '.';
          }
          nextExit = { x, y };
        } else if (selectedTool.kind === 'enemy') {
          // Place monster: ensure floor tile underneath
          nextTiles[y][x] = '.';
          if (nextSpawn.x === x && nextSpawn.y === y) return prev;
          nextEntities.push({
            id: `ent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            kind: 'enemy',
            subType: selectedTool.archetypeId,
            x,
            y,
          });
        } else if (selectedTool.kind === 'trap') {
          // Place trap
          nextTiles[y][x] = '.';
          if (nextSpawn.x === x && nextSpawn.y === y) return prev;
          nextEntities.push({
            id: `ent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            kind: 'trap',
            subType: selectedTool.trapType,
            x,
            y,
          });
        } else if (selectedTool.kind === 'loot') {
          // Place loot
          nextTiles[y][x] = '.';
          nextEntities.push({
            id: `ent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            kind: 'loot',
            subType: selectedTool.lootType,
            x,
            y,
            goldAmount: selectedTool.goldAmount,
          });
        } else if (selectedTool.kind === 'eraser') {
          // Eraser clears entity or reverts wall to floor
          nextTiles[y][x] = '.';
        }

        return {
          ...prev,
          tiles: nextTiles,
          spawn: nextSpawn,
          exit: nextExit,
          entities: nextEntities,
          updatedAt: Date.now(),
        };
      });
    },
    [selectedTool]
  );

  const handleCellMouseDown = (x: number, y: number) => {
    setIsMouseDown(true);
    applyToolToCell(x, y);
  };

  const handleCellMouseEnter = (x: number, y: number) => {
    if (isMouseDown) {
      applyToolToCell(x, y);
    }
  };

  const handleResize = (newWidth: number, newHeight: number) => {
    setMap((prev) => {
      const nextTiles: ('#' | '.' | '>')[][] = [];
      for (let y = 0; y < newHeight; y++) {
        const row: ('#' | '.' | '>')[] = [];
        for (let x = 0; x < newWidth; x++) {
          if (x === 0 || x === newWidth - 1 || y === 0 || y === newHeight - 1) {
            row.push('#');
          } else if (y < prev.height && x < prev.width) {
            row.push(prev.tiles[y][x] === '>' ? '.' : prev.tiles[y][x]);
          } else {
            row.push('.');
          }
        }
        nextTiles.push(row);
      }

      const nextSpawn = {
        x: Math.min(prev.spawn.x, newWidth - 2),
        y: Math.min(prev.spawn.y, newHeight - 2),
      };
      const nextExit = { x: newWidth - 3, y: newHeight - 3 };
      nextTiles[nextSpawn.y][nextSpawn.x] = '.';
      nextTiles[nextExit.y][nextExit.x] = '>';

      const validEntities = prev.entities.filter((e) => e.x < newWidth - 1 && e.y < newHeight - 1);

      return {
        ...prev,
        width: newWidth,
        height: newHeight,
        tiles: nextTiles,
        spawn: nextSpawn,
        exit: nextExit,
        entities: validEntities,
        updatedAt: Date.now(),
      };
    });
  };

  const handleSaveToStorage = () => {
    saveCustomMap(map);
    setSaveStatus('Map saved to My Maps!');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handleCopyShareLink = async () => {
    try {
      const url = getShareUrl(map);
      await navigator.clipboard.writeText(url);
      setCopyStatus('Link copied to clipboard!');
      setTimeout(() => setCopyStatus(null), 2500);
    } catch {
      setCopyStatus('Error copying link');
      setTimeout(() => setCopyStatus(null), 2500);
    }
  };

  const handleCopyRawCode = async () => {
    try {
      const code = encodeCustomMap(map);
      await navigator.clipboard.writeText(code);
      setCopyStatus('Map code copied to clipboard!');
      setTimeout(() => setCopyStatus(null), 2500);
    } catch {
      setCopyStatus('Error copying code');
      setTimeout(() => setCopyStatus(null), 2500);
    }
  };

  const handleImportCode = () => {
    const trimmed = importCodeInput.trim();
    if (!trimmed) return;
    try {
      const { decodeCustomMap } = require('../utils/customMapStorage');
      const loaded = decodeCustomMap(trimmed);
      if (loaded) {
        setMap(loaded);
        setShareModalOpen(false);
        setImportCodeInput('');
      } else {
        alert('Invalid or corrupted map code. Please verify the string and try again.');
      }
    } catch {
      alert('Failed to decode map code.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#060e20]/95 backdrop-blur-md overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Custom Level Builder"
    >
      <div className="w-full max-w-[1360px] h-[96vh] rounded-lg bg-[#0f172a] border border-[#f59e0b]/40 shadow-[0_0_36px_rgba(245,158,11,0.18),0_18px_50px_rgba(0,0,0,0.92)] flex flex-col overflow-hidden">
        {/* Top Control Bar */}
        <header className="px-4 sm:px-6 py-3 bg-[#131b2e] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-[#060e20] border border-[#f59e0b]/40 flex items-center justify-center shrink-0">
              <LayoutGrid className="w-5 h-5 text-[#ffc174]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={30}
                  value={map.name}
                  onChange={(e) => setMap({ ...map, name: e.target.value })}
                  placeholder="Crypt Name"
                  className="bg-transparent font-display text-base sm:text-lg font-bold text-[#dae2fd] border-b border-transparent hover:border-white/20 focus:border-[#f59e0b] focus:outline-none transition-colors max-w-[220px] sm:max-w-[320px]"
                />
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#a08e7a]">
                <span>Author:</span>
                <input
                  type="text"
                  maxLength={18}
                  value={map.author}
                  onChange={(e) => setMap({ ...map, author: e.target.value })}
                  placeholder="Creator Name"
                  className="bg-transparent text-[#ffc174] border-b border-transparent hover:border-white/20 focus:border-[#f59e0b] focus:outline-none transition-colors w-28"
                />
              </div>
            </div>
          </div>

          {/* Size & Layout Presets */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-[#a08e7a] hidden md:inline mr-1">Grid Size:</span>
            {[
              { label: '15×11', w: 15, h: 11 },
              { label: '17×13', w: 17, h: 13 },
              { label: '19×15', w: 19, h: 15 },
            ].map(({ label, w, h }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleResize(w, h)}
                className={`px-2.5 py-1.5 rounded-[4px] transition-colors cursor-pointer ${
                  map.width === w && map.height === h
                    ? 'bg-[#f59e0b]/20 border border-[#f59e0b] text-[#ffc174] font-semibold'
                    : 'bg-[#060e20] border border-white/10 text-[#a08e7a] hover:text-[#dae2fd]'
                }`}
              >
                {label}
              </button>
            ))}

            <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

            <button
              type="button"
              onClick={() => setMap(applyMapTemplate(map, 'empty'))}
              className="px-2.5 py-1.5 rounded-[4px] bg-[#060e20] border border-white/10 text-[#a08e7a] hover:text-[#dae2fd] transition-colors cursor-pointer hidden lg:inline"
              title="Clear interior to open floor"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setMap(applyMapTemplate(map, 'pillars'))}
              className="px-2.5 py-1.5 rounded-[4px] bg-[#060e20] border border-white/10 text-[#a08e7a] hover:text-[#dae2fd] transition-colors cursor-pointer hidden lg:inline"
              title="Generate pillar array"
            >
              Pillars
            </button>
            <button
              type="button"
              onClick={() => setMap(applyMapTemplate(map, 'corridors'))}
              className="px-2.5 py-1.5 rounded-[4px] bg-[#060e20] border border-white/10 text-[#a08e7a] hover:text-[#dae2fd] transition-colors cursor-pointer hidden lg:inline"
              title="Generate tactical corridors"
            >
              Corridors
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLibraryModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#06b6d4]/15 border border-[#06b6d4]/60 text-[#4cd7f6] text-xs font-mono font-semibold hover:bg-[#06b6d4]/25 transition-colors cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">My Maps</span>
            </button>

            <button
              type="button"
              onClick={() => setShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#131b2e] border border-white/15 text-[#dae2fd] text-xs font-mono font-semibold hover:border-[#f59e0b]/50 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#ffc174]" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              type="button"
              onClick={handleSaveToStorage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#131b2e] border border-white/15 text-[#dae2fd] text-xs font-mono font-semibold hover:border-[#10b981]/60 transition-colors cursor-pointer"
              title="Save to local browser library"
            >
              <Save className="w-3.5 h-3.5 text-[#6ee7b7]" />
              <span className="hidden sm:inline">Save</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[4px] bg-[#060e20] border border-white/10 text-[#a08e7a] hover:text-[#dae2fd] transition-colors cursor-pointer"
              aria-label="Close Level Builder"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Validation Reachability Ribbon */}
        <div
          className={`px-4 sm:px-6 py-2 border-b flex flex-wrap items-center justify-between gap-3 text-xs font-mono transition-colors shrink-0 ${
            validation.valid
              ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#6ee7b7]'
              : 'bg-[#ef4444]/15 border-[#ef4444]/40 text-[#ffb4ab]'
          }`}
        >
          <div className="flex items-center gap-2">
            {validation.valid ? (
              <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-[#ef4444] shrink-0" />
            )}
            <div>
              {validation.valid ? (
                <span>
                  <strong>Exit Reachable:</strong> Solution path verified (
                  <span className="text-[#4cd7f6] font-bold">{validation.pathLength}</span> steps
                  from Spawn to Stairs). Ready to play &amp; share!
                </span>
              ) : (
                <span>
                  <strong>Unreachable Exit:</strong> {validation.errors[0] || 'Check path from spawn to exit.'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {validation.valid && (
              <button
                type="button"
                onClick={() => setShowSolutionPath((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#060e20] border border-white/10 text-xs font-mono text-[#dae2fd] hover:text-[#4cd7f6] hover:border-[#06b6d4]/50 transition-colors cursor-pointer"
              >
                {showSolutionPath ? <Eye className="w-3.5 h-3.5 text-[#4cd7f6]" /> : <EyeOff className="w-3.5 h-3.5 text-[#a08e7a]" />}
                <span>{showSolutionPath ? 'Path Visible' : 'Path Hidden'}</span>
              </button>
            )}

            {saveStatus && <span className="text-[#6ee7b7] font-semibold">{saveStatus}</span>}
          </div>
        </div>

        {/* Main Work Area: Palette + Interactive Grid */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Palette Sidebar */}
          <aside className="w-full md:w-64 bg-[#090d16] border-b md:border-b-0 md:border-r border-white/10 p-3 sm:p-4 flex flex-col gap-3 overflow-y-auto shrink-0">
            {/* Palette Category Selector */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#131b2e] rounded-[4px] border border-white/5">
              {[
                { id: 'tiles', label: 'Tiles' },
                { id: 'monsters', label: 'Monsters' },
                { id: 'hazards', label: 'Traps' },
                { id: 'loot', label: 'Loot' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as any)}
                  className={`py-1 text-center rounded-[3px] text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                    activeTab === t.id
                      ? 'bg-[#f59e0b]/20 border border-[#f59e0b] text-[#ffc174]'
                      : 'text-[#a08e7a] hover:text-[#dae2fd]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Category Items */}
            <div className="flex flex-col gap-1.5 flex-1">
              {activeTab === 'tiles' && (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedTool({ kind: 'tile', tile: '#' })}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-[4px] border text-left transition-colors cursor-pointer ${
                      selectedTool.kind === 'tile' && selectedTool.tile === '#'
                        ? 'bg-[#1e293b] border-[#f59e0b] text-[#ffc174]'
                        : 'bg-[#131b2e] border-white/10 text-[#dae2fd] hover:bg-[#1a233a]'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-[2px] bg-[#1e293b] border border-[#334155] flex items-center justify-center">
                      <Square className="w-3 h-3 text-[#94a3b8]" />
                    </div>
                    <div className="text-xs font-mono">
                      <div className="font-semibold">Dungeon Wall</div>
                      <div className="text-[10px] text-[#a08e7a]">Impassable barrier</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTool({ kind: 'tile', tile: '.' })}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-[4px] border text-left transition-colors cursor-pointer ${
                      selectedTool.kind === 'tile' && selectedTool.tile === '.'
                        ? 'bg-[#1e293b] border-[#f59e0b] text-[#ffc174]'
                        : 'bg-[#131b2e] border-white/10 text-[#dae2fd] hover:bg-[#1a233a]'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-[2px] bg-[#11192d] border border-white/10 flex items-center justify-center text-[10px] text-[#a08e7a]">
                      ·
                    </div>
                    <div className="text-xs font-mono">
                      <div className="font-semibold">Corridor Floor</div>
                      <div className="text-[10px] text-[#a08e7a]">Walkable ground</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTool({ kind: 'spawn' })}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-[4px] border text-left transition-colors cursor-pointer ${
                      selectedTool.kind === 'spawn'
                        ? 'bg-[#1e293b] border-[#06b6d4] text-[#4cd7f6]'
                        : 'bg-[#131b2e] border-white/10 text-[#dae2fd] hover:bg-[#1a233a]'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-[2px] bg-[#060e20] border border-[#06b6d4]/40 flex items-center justify-center">
                      <HeroSprite classId={heroClassId} className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-mono">
                      <div className="font-semibold text-[#4cd7f6]">Hero Spawn</div>
                      <div className="text-[10px] text-[#a08e7a]">Placement start point</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTool({ kind: 'exit' })}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-[4px] border text-left transition-colors cursor-pointer ${
                      selectedTool.kind === 'exit'
                        ? 'bg-[#1e293b] border-[#f59e0b] text-[#ffc174]'
                        : 'bg-[#131b2e] border-white/10 text-[#dae2fd] hover:bg-[#1a233a]'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-[2px] bg-[#060e20] border border-[#f59e0b]/40 flex items-center justify-center">
                      <StairsSprite className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-mono">
                      <div className="font-semibold text-[#ffc174]">Descent Stairs (Exit)</div>
                      <div className="text-[10px] text-[#a08e7a]">Goal &amp; level completion</div>
                    </div>
                  </button>
                </>
              )}

              {activeTab === 'monsters' && (
                <>
                  {[
                    { id: 'scrap_rat', name: 'Scrap Rat', desc: 'Standard · 15 HP' },
                    { id: 'null_goblin', name: 'Null Raider', desc: 'Standard · 15 HP' },
                    { id: 'rust_sentinel', name: 'Rust Sentinel', desc: 'Armored · 23 HP' },
                    { id: 'blight_drone', name: 'Blight Drone', desc: 'Hazard · 19 HP' },
                    { id: 'void_stalker', name: 'Void Stalker', desc: 'Elite · 27 HP' },
                    { id: 'arcane_wraith', name: 'Arcane Wraith', desc: 'Elite · 32 HP' },
                    { id: 'floor_warden', name: 'Zenexis Overlord', desc: 'Boss · 80 HP' },
                  ].map(({ id, name, desc }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedTool({ kind: 'enemy', archetypeId: id as any })}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-[4px] border text-left transition-colors cursor-pointer ${
                        selectedTool.kind === 'enemy' && selectedTool.archetypeId === id
                          ? 'bg-[#1e293b] border-[#8b5cf6] text-[#d5c3ff]'
                          : 'bg-[#131b2e] border-white/10 text-[#dae2fd] hover:bg-[#1a233a]'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-[2px] bg-[#060e20] border border-white/10 flex items-center justify-center shrink-0">
                        <EnemySprite archetypeId={id as any} className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-mono min-w-0">
                        <div className="font-semibold truncate">{name}</div>
                        <div className="text-[10px] text-[#a08e7a]">{desc}</div>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {activeTab === 'hazards' && (
                <>
                  {[
                    { id: 'spike', name: 'Spike Trap', desc: '6 Physical damage' },
                    { id: 'biomine', name: 'Biomine Pod', desc: '9 Chemical damage' },
                    { id: 'arcsnare', name: 'Arc Snare', desc: '8 Electric damage' },
                  ].map(({ id, name, desc }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedTool({ kind: 'trap', trapType: id as any })}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-[4px] border text-left transition-colors cursor-pointer ${
                        selectedTool.kind === 'trap' && selectedTool.trapType === id
                          ? 'bg-[#1e293b] border-[#ef4444] text-[#ffb4ab]'
                          : 'bg-[#131b2e] border-white/10 text-[#dae2fd] hover:bg-[#1a233a]'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-[2px] bg-[#060e20] border border-white/10 flex items-center justify-center shrink-0">
                        <TrapSprite type={id as any} triggered={false} className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-mono">
                        <div className="font-semibold text-[#ffb4ab]">{name}</div>
                        <div className="text-[10px] text-[#a08e7a]">{desc}</div>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {activeTab === 'loot' && (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedTool({ kind: 'loot', lootType: 'gold', goldAmount: 35 })}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-[4px] border text-left transition-colors cursor-pointer ${
                      selectedTool.kind === 'loot' && selectedTool.lootType === 'gold'
                        ? 'bg-[#1e293b] border-[#f59e0b] text-[#ffc174]'
                        : 'bg-[#131b2e] border-white/10 text-[#dae2fd] hover:bg-[#1a233a]'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-[2px] bg-[#060e20] border border-white/10 flex items-center justify-center shrink-0">
                      <LootSprite type="gold" className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-mono">
                      <div className="font-semibold text-[#ffc174]">Gold Cache</div>
                      <div className="text-[10px] text-[#a08e7a]">Collectible currency (+35G)</div>
                    </div>
                  </button>

                  {[
                    { id: 'med_vial', name: 'Med Vial', desc: 'Restores 14 HP' },
                    { id: 'aegis_cell', name: 'Shield Cell', desc: '+10 Kinetic Shield' },
                    { id: 'shock_bomb', name: 'Shock Bomb', desc: '14 DMG + Stun' },
                    { id: 'overdrive_core', name: 'Overdrive Core', desc: '+4 ATK in Combat' },
                  ].map(({ id, name, desc }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedTool({ kind: 'loot', lootType: id as any })}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-[4px] border text-left transition-colors cursor-pointer ${
                        selectedTool.kind === 'loot' && selectedTool.lootType === id
                          ? 'bg-[#1e293b] border-[#10b981] text-[#6ee7b7]'
                          : 'bg-[#131b2e] border-white/10 text-[#dae2fd] hover:bg-[#1a233a]'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-[2px] bg-[#060e20] border border-white/10 flex items-center justify-center shrink-0">
                        <LootSprite type={id as any} className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-mono">
                        <div className="font-semibold text-[#6ee7b7]">{name}</div>
                        <div className="text-[10px] text-[#a08e7a]">{desc}</div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Eraser Tool */}
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedTool({ kind: 'eraser' })}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[4px] border text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  selectedTool.kind === 'eraser'
                    ? 'bg-[#ef4444]/20 border-[#ef4444] text-[#ffb4ab]'
                    : 'bg-[#131b2e] border-white/10 text-[#a08e7a] hover:text-[#dae2fd]'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Eraser / Clear Tile</span>
              </button>
            </div>
          </aside>

          {/* Center Interactive Drawing Canvas */}
          <main
            ref={canvasRef}
            className="flex-1 bg-[#060e20] p-4 sm:p-6 flex items-center justify-center overflow-auto"
          >
            <div
              className="relative rounded-lg bg-[#090d16] border border-[#f59e0b]/20 p-2 sm:p-3 shadow-[0_12px_36px_rgba(0,0,0,0.85)] max-w-full max-h-full"
              style={{
                aspectRatio: `${map.width} / ${map.height}`,
                width: `min(100%, ${map.width * 42}px)`,
              }}
            >
              <div
                className="grid gap-[2px] w-full h-full"
                style={{
                  gridTemplateColumns: `repeat(${map.width}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${map.height}, minmax(0, 1fr))`,
                }}
              >
                {map.tiles.map((row, y) =>
                  row.map((tileChar, x) => {
                    const isSpawn = map.spawn.x === x && map.spawn.y === y;
                    const isExit = map.exit.x === x && map.exit.y === y;
                    const isWall = tileChar === '#';
                    const entity = map.entities.find((e) => e.x === x && e.y === y);
                    const isSolutionStep = showSolutionPath && solutionPathSet.has(`${x},${y}`) && !isSpawn && !isExit;

                    let bg = isWall ? 'bg-[#1e293b]' : 'bg-[#11192d]';
                    let border = isWall ? 'border-[#334155]/80' : 'border-[#1e293b]/50 hover:border-[#f59e0b]/60';

                    if (isSpawn) {
                      bg = 'bg-[#060e20]';
                      border = 'border-[#06b6d4] ring-1 ring-[#06b6d4]/50';
                    } else if (isExit) {
                      bg = 'bg-[#1e1b4b]';
                      border = 'border-[#f59e0b] ring-1 ring-[#f59e0b]/50';
                    }

                    return (
                      <div
                        key={`${x}-${y}`}
                        onMouseDown={() => handleCellMouseDown(x, y)}
                        onMouseEnter={() => handleCellMouseEnter(x, y)}
                        className={`relative aspect-square w-full rounded-[2px] border flex items-center justify-center transition-colors select-none cursor-crosshair ${bg} ${border}`}
                      >
                        {/* Wall bevel */}
                        {isWall && <div className="w-[50%] h-[50%] rounded-[1px] bg-[#31394d]/60" />}

                        {/* Solution Path Indicator Dot */}
                        {isSolutionStep && (
                          <div className="absolute w-2 h-2 rounded-full bg-[#06b6d4] shadow-[0_0_6px_#06b6d4] z-10 pointer-events-none animate-pulse" />
                        )}

                        {/* Spawn Icon */}
                        {isSpawn && (
                          <div className="relative z-20 flex flex-col items-center justify-center pointer-events-none">
                            <HeroSprite classId={heroClassId} className="w-[80%] h-[80%]" />
                          </div>
                        )}

                        {/* Exit Stairs */}
                        {isExit && (
                          <div className="relative z-20 flex items-center justify-center pointer-events-none">
                            <StairsSprite className="w-[75%] h-[75%]" />
                          </div>
                        )}

                        {/* Placed Entity (Enemy, Trap, Loot) */}
                        {entity && !isSpawn && !isExit && (
                          <div className="relative z-20 flex items-center justify-center pointer-events-none w-full h-full">
                            {entity.kind === 'enemy' && (
                              <EnemySprite archetypeId={entity.subType as any} className="w-[80%] h-[80%]" />
                            )}
                            {entity.kind === 'trap' && (
                              <TrapSprite type={entity.subType as any} triggered={false} className="w-[70%] h-[70%]" />
                            )}
                            {entity.kind === 'loot' && (
                              <LootSprite type={entity.subType as any} className="w-[70%] h-[70%]" />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </main>
        </div>

        {/* Bottom Play & Export Action Bar */}
        <footer className="px-4 sm:px-6 py-3 bg-[#131b2e] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 text-xs font-mono text-[#a08e7a] tabular-nums">
            <span>
              Hostiles: <strong className="text-[#d5c3ff]">{map.entities.filter((e) => e.kind === 'enemy').length}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Traps: <strong className="text-[#ffb4ab]">{map.entities.filter((e) => e.kind === 'trap').length}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Loot: <strong className="text-[#ffc174]">{map.entities.filter((e) => e.kind === 'loot').length}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-[4px] bg-[#060e20] border border-white/10 text-xs font-mono text-[#a08e7a] hover:text-[#dae2fd] transition-colors cursor-pointer"
            >
              Exit Builder
            </button>

            <button
              type="button"
              disabled={!validation.valid}
              onClick={() => onPlayMap(map)}
              className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-[4px] font-display text-sm font-bold uppercase tracking-wide border-t transition-all whitespace-nowrap cursor-pointer ${
                validation.valid
                  ? 'bg-gradient-to-b from-[#f59e0b] to-[#d97706] text-[#090d16] border-[#fde68a]/60 shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:brightness-110'
                  : 'bg-[#1e293b] border-white/10 text-[#64748b] cursor-not-allowed opacity-50'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>Play Test Map</span>
            </button>
          </div>
        </footer>
      </div>

      {/* Share / Export Modal */}
      {shareModalOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#060e20]/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Share or Import Map"
        >
          <div className="w-full max-w-lg rounded-lg bg-[#0f172a] border border-[#f59e0b]/40 p-5 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-base font-bold text-[#dae2fd] flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#ffc174]" />
                <span>Share or Import Custom Crypt</span>
              </h3>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="text-[#a08e7a] hover:text-[#dae2fd] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Share Buttons */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono text-[#a08e7a]">One-Click Web Share Link</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getShareUrl(map)}
                    className="flex-1 px-3 py-2 rounded-[4px] bg-[#060e20] border border-white/15 text-xs font-mono text-[#dae2fd] truncate select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="px-3 py-2 rounded-[4px] bg-[#06b6d4]/15 border border-[#06b6d4] text-[#4cd7f6] text-xs font-mono font-semibold hover:bg-[#06b6d4]/25 transition-colors cursor-pointer"
                  >
                    Copy Link
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono text-[#a08e7a]">Raw Encoded Map Code</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={encodeCustomMap(map)}
                    className="flex-1 px-3 py-2 rounded-[4px] bg-[#060e20] border border-white/15 text-xs font-mono text-[#dae2fd] truncate select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyRawCode}
                    className="px-3 py-2 rounded-[4px] bg-[#131b2e] border border-white/15 text-[#dae2fd] text-xs font-mono font-semibold hover:border-[#f59e0b]/50 transition-colors cursor-pointer"
                  >
                    Copy Code
                  </button>
                </div>
              </div>

              {copyStatus && (
                <div className="text-xs font-mono text-[#6ee7b7] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>{copyStatus}</span>
                </div>
              )}
            </div>

            {/* Import Code Section */}
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <span className="text-xs font-mono text-[#dae2fd] font-semibold">Import Map from Code</span>
              <textarea
                rows={3}
                value={importCodeInput}
                onChange={(e) => setImportCodeInput(e.target.value)}
                placeholder="Paste an encoded custom crypt code here..."
                className="w-full px-3 py-2 rounded-[4px] bg-[#060e20] border border-white/15 text-xs font-mono text-[#dae2fd] placeholder:text-[#a08e7a]/60 focus:outline-none focus:border-[#f59e0b]"
              />
              <button
                type="button"
                onClick={handleImportCode}
                disabled={!importCodeInput.trim()}
                className="px-4 py-2 rounded-[4px] bg-gradient-to-b from-[#f59e0b] to-[#d97706] text-[#090d16] font-display text-xs font-bold uppercase tracking-wide hover:brightness-110 disabled:opacity-40 transition-all cursor-pointer"
              >
                Import &amp; Load Crypt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Library Modal */}
      {libraryModalOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#060e20]/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="My Custom Maps Library"
        >
          <div className="w-full max-w-2xl rounded-lg bg-[#0f172a] border border-[#06b6d4]/40 p-5 flex flex-col gap-4 shadow-2xl max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-base font-bold text-[#dae2fd] flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#4cd7f6]" />
                <span>Custom Crypts Library</span>
              </h3>
              <button
                type="button"
                onClick={() => setLibraryModalOpen(false)}
                className="text-[#a08e7a] hover:text-[#dae2fd] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 flex flex-col gap-2.5 pr-1">
              {loadSavedCustomMaps().map((saved) => (
                <div
                  key={saved.id}
                  className="rounded-lg bg-[#131b2e] border border-white/10 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/20 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-display text-sm font-bold text-[#dae2fd] truncate">
                      {saved.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#a08e7a] mt-0.5">
                      <span>By {saved.author}</span>
                      <span aria-hidden="true">·</span>
                      <span>{saved.width}×{saved.height}</span>
                      <span aria-hidden="true">·</span>
                      <span>{saved.entities.filter((e) => e.kind === 'enemy').length} Hostiles</span>
                    </div>
                    {saved.description && (
                      <p className="text-xs text-[#a08e7a] mt-1 line-clamp-1">{saved.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setMap(saved);
                        setLibraryModalOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-[4px] bg-[#06b6d4]/15 border border-[#06b6d4] text-[#4cd7f6] text-xs font-mono font-semibold hover:bg-[#06b6d4]/25 transition-colors cursor-pointer"
                    >
                      Load in Editor
                    </button>
                    {!saved.id.startsWith('showcase_') && (
                      <button
                        type="button"
                        onClick={() => {
                          deleteCustomMap(saved.id);
                          setLibraryModalOpen(false);
                          setTimeout(() => setLibraryModalOpen(true), 10);
                        }}
                        className="p-1.5 rounded-[4px] bg-[#060e20] border border-white/10 text-[#a08e7a] hover:text-[#ffb4ab] hover:border-[#ef4444]/40 transition-colors cursor-pointer"
                        title="Delete map"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
