import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Backpack,
  Clock,
  Coins,
  HelpCircle,
  LayoutGrid,
  LogOut,
  Shield,
  Sword,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { CombatModal } from './components/CombatModal';
import { DungeonCanvas } from './components/DungeonCanvas';
import { FloorTransitionModal } from './components/FloorTransitionModal';
import { GameOverScreen } from './components/GameOverScreen';
import { HowToPlayModal } from './components/HowToPlayModal';
import { InventoryModal } from './components/InventoryModal';
import { LevelBuilderModal } from './components/LevelBuilderModal';
import { SegmentedBar } from './components/SegmentedBar';
import { ItemIcon } from './components/Sprites';
import { TitleScreen } from './components/TitleScreen';
import { VictoryScreen } from './components/VictoryScreen';
import { customMapToDungeonFloor } from './engine/customMap';
import {
  addInventoryItem,
  computeFogOfWar,
  consumeInventoryItem,
  createStartingInventory,
  findNextStepBFS,
  generateDungeonFloor,
  HERO_CLASSES,
  ITEM_CATALOG,
  MAX_FLOOR,
  stepEnemiesTowardHero,
} from './engine/dungeon';
import {
  ActiveRunState,
  CareerRecords,
  CombatLogEntry,
  CombatState,
  CustomMapData,
  Enemy,
  FloatingPopup,
  GameScreen,
  HeroClassId,
  HeroState,
  HighScoreEntry,
  InventoryItemId,
  LegendaryWeapon,
  LogEntry,
  MerchantItem,
} from './types/game';
import {
  fetchBossLegendaryWeapon,
  fetchBossRoast,
  getLocalFallbackRoast,
  getLocalFallbackWeapon,
} from './utils/bossApi';
import { sound } from './utils/sound';
import { clearUrlMapParam, getMapFromUrl } from './utils/customMapStorage';
import {
  clearActiveRun,
  clearCareerRecords,
  loadActiveRun,
  loadCareerRecords,
  loadControlsTipDismissed,
  loadPlayerName,
  recordFinishedRun,
  saveActiveRun,
  saveControlsTipDismissed,
  savePlayerName,
} from './utils/storage';

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('TITLE');
  const [playerName, setPlayerName] = useState<string>(() => loadPlayerName());
  const [selectedClass, setSelectedClass] = useState<HeroClassId>('cipher');
  const [savedRun, setSavedRun] = useState<ActiveRunState | null>(() => loadActiveRun());
  const [career, setCareer] = useState<CareerRecords>(() => loadCareerRecords());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => sound.isEnabled());

  const [run, setRun] = useState<ActiveRunState | null>(null);
  const [combat, setCombat] = useState<CombatState | null>(null);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [floorTransitionOpen, setFloorTransitionOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [controlsTipDismissed, setControlsTipDismissed] = useState<boolean>(() =>
    loadControlsTipDismissed()
  );
  const [customMapDraft, setCustomMapDraft] = useState<CustomMapData | null>(null);
  const [heroStep, setHeroStep] = useState<{
    dx: number;
    dy: number;
    seq: number;
    isBump?: boolean;
  }>({ dx: 0, dy: 0, seq: 0 });
  const [popups, setPopups] = useState<FloatingPopup[]>([]);
  const [gameOverSummary, setGameOverSummary] = useState<{
    entry: HighScoreEntry;
    isNewBest: boolean;
  } | null>(null);

  const combatTimerRef = useRef<number | null>(null);
  const roastAbortRef = useRef<AbortController | null>(null);

  // Check URL on initial mount for shared custom map link (#map=... or ?map=...)
  useEffect(() => {
    const urlMap = getMapFromUrl();
    if (urlMap) {
      setCustomMapDraft(urlMap);
      setScreen('BUILDER');
      clearUrlMapParam();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (combatTimerRef.current) {
        window.clearTimeout(combatTimerRef.current);
      }
      if (roastAbortRef.current) {
        roastAbortRef.current.abort();
      }
    };
  }, []);

  // Autosave active run to localStorage whenever run updates
  useEffect(() => {
    if (screen === 'PLAYING' && run) {
      saveActiveRun(run);
      setSavedRun(run);
    }
  }, [run, screen]);

  const spawnPopup = useCallback((x: number, y: number, text: string, color: string) => {
    const id = uid('pop');
    setPopups((prev) => [...prev, { id, x, y, text, color }]);
    window.setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, 850);
  }, []);

  const appendLog = (
    logs: LogEntry[],
    turn: number,
    text: string,
    tone: LogEntry['tone'] = 'neutral'
  ): LogEntry[] => {
    return [{ id: uid('log'), turn, text, tone }, ...logs].slice(0, 40);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    sound.setEnabled(next);
    setSoundEnabled(next);
  };

  const handlePlayerNameChange = (name: string) => {
    setPlayerName(name);
    savePlayerName(name);
  };

  const startNewRun = useCallback((classId: HeroClassId) => {
    const cfg = HERO_CLASSES[classId];
    const resolvedPlayerName = playerName.trim() || 'Runner-01';
    const { floor, spawnPos } = generateDungeonFloor(1);
    const updatedFloor = computeFogOfWar(floor, spawnPos.x, spawnPos.y, cfg.visionRadius);

    const hero: HeroState = {
      classId,
      playerName: resolvedPlayerName,
      name: cfg.name,
      x: spawnPos.x,
      y: spawnPos.y,
      facing: 'down',
      horizontalFacing: 'right',
      hp: cfg.maxHp,
      maxHp: cfg.maxHp,
      shield: 0,
      atk: cfg.baseAtk,
      def: cfg.baseDef,
      critChance: cfg.critChance,
      visionRadius: cfg.visionRadius,
      gold: 0,
      score: 0,
      weaponLevel: 1,
      armorLevel: 1,
      weaponName:
        classId === 'volt'
          ? 'Arc Twinblades'
          : classId === 'aegis'
          ? 'Bastion Halberd'
          : 'Cipher Edge',
      armorName:
        classId === 'volt'
          ? 'Shadow Weave'
          : classId === 'aegis'
          ? 'Titan Carapace'
          : 'Tactical Plate',
    };

    const initialRun: ActiveRunState = {
      hero,
      floor: updatedFloor,
      inventory: createStartingInventory(classId),
      logs: [
        {
          id: uid('log'),
          turn: 0,
          text: `${resolvedPlayerName} (${cfg.name}) entered Floor 1 of ${MAX_FLOOR}. Locate the stairs down.`,
          tone: 'cyan',
        },
      ],
      turn: 0,
      enemiesDefeated: 0,
      trapsTriggered: 0,
      roomsDiscovered: 1,
      encounteredArchetypes: [],
      purchasedShopIds: [],
      startedAt: Date.now(),
    };

    setRun(initialRun);
    saveActiveRun(initialRun);
    setSavedRun(initialRun);
    setCombat(null);
    setInventoryOpen(false);
    setFloorTransitionOpen(false);
    setHelpOpen(false);
    setHeroStep({ dx: 0, dy: 0, seq: 0 });
    setGameOverSummary(null);
    setScreen('PLAYING');
    sound.playMove();
  }, [playerName]);

  const continueSavedRun = useCallback(() => {
    const loaded = loadActiveRun();
    if (!loaded) return;
    setRun(loaded);
    setCombat(null);
    setInventoryOpen(false);
    setFloorTransitionOpen(false);
    setGameOverSummary(null);
    setScreen('PLAYING');
  }, []);

  const handleStartCustomMapRun = useCallback(
    (customMap: CustomMapData) => {
      const cfg = HERO_CLASSES[selectedClass];
      const resolvedPlayerName = playerName.trim() || 'Runner-01';
      const { floor, spawnPos } = customMapToDungeonFloor(customMap, selectedClass);

      const hero: HeroState = {
        classId: selectedClass,
        playerName: resolvedPlayerName,
        name: cfg.name,
        x: spawnPos.x,
        y: spawnPos.y,
        facing: 'down',
        horizontalFacing: 'right',
        hp: cfg.maxHp,
        maxHp: cfg.maxHp,
        shield: 0,
        atk: cfg.baseAtk,
        def: cfg.baseDef,
        critChance: cfg.critChance,
        visionRadius: cfg.visionRadius,
        gold: 0,
        score: 0,
        weaponLevel: 1,
        armorLevel: 1,
        weaponName:
          selectedClass === 'volt'
            ? 'Arc Twinblades'
            : selectedClass === 'aegis'
            ? 'Bastion Halberd'
            : 'Cipher Edge',
        armorName:
          selectedClass === 'volt'
            ? 'Shadow Weave'
            : selectedClass === 'aegis'
            ? 'Titan Carapace'
            : 'Tactical Plate',
      };

      const initialRun: ActiveRunState = {
        hero,
        floor,
        inventory: createStartingInventory(selectedClass),
        logs: [
          {
            id: uid('log'),
            turn: 0,
            text: `${resolvedPlayerName} entered custom crypt: ${customMap.name}. Find the exit stairs!`,
            tone: 'cyan',
          },
        ],
        turn: 0,
        enemiesDefeated: 0,
        trapsTriggered: 0,
        roomsDiscovered: 1,
        encounteredArchetypes: [],
        purchasedShopIds: [],
        isCustomMap: true,
        customMapId: customMap.id,
        customMapName: customMap.name,
        startedAt: Date.now(),
      };

      setRun(initialRun);
      setCombat(null);
      setInventoryOpen(false);
      setFloorTransitionOpen(false);
      setHelpOpen(false);
      setHeroStep({ dx: 0, dy: 0, seq: 0 });
      setGameOverSummary(null);
      setScreen('PLAYING');
      sound.playMove();
    },
    [playerName, selectedClass]
  );

  const triggerGameOver = useCallback(
    (currentRun: ActiveRunState, causeOfDeath: string) => {
      if (combatTimerRef.current) {
        window.clearTimeout(combatTimerRef.current);
      }
      sound.playGameOver();
      clearActiveRun();
      setSavedRun(null);
      setCombat(null);
      setInventoryOpen(false);
      setFloorTransitionOpen(false);

      const entry: HighScoreEntry = {
        id: uid('score'),
        playerName: currentRun.hero.playerName || playerName || currentRun.hero.name,
        classId: currentRun.hero.classId,
        className: currentRun.hero.name,
        score: currentRun.hero.score,
        floor: currentRun.floor.floorNumber,
        gold: currentRun.hero.gold,
        enemiesDefeated: currentRun.enemiesDefeated,
        victory: false,
        causeOfDeath,
        timestamp: Date.now(),
      };

      const { records, isNewBest } = recordFinishedRun(entry);
      setCareer(records);
      setGameOverSummary({ entry, isNewBest });
      setScreen('GAME_OVER');
    },
    [playerName]
  );

  const triggerVictory = useCallback(
    (currentRun: ActiveRunState, summaryText: string, legendaryWeapon?: LegendaryWeapon) => {
      if (combatTimerRef.current) {
        window.clearTimeout(combatTimerRef.current);
      }
      if (roastAbortRef.current) {
        roastAbortRef.current.abort();
      }
      sound.playVictory();
      clearActiveRun();
      setSavedRun(null);
      setCombat(null);
      setInventoryOpen(false);
      setFloorTransitionOpen(false);

      const entry: HighScoreEntry = {
        id: uid('score'),
        playerName: currentRun.hero.playerName || playerName || currentRun.hero.name,
        classId: currentRun.hero.classId,
        className: currentRun.hero.name,
        score: currentRun.hero.score,
        floor: currentRun.floor.floorNumber,
        gold: currentRun.hero.gold,
        enemiesDefeated: currentRun.enemiesDefeated,
        victory: true,
        causeOfDeath: summaryText,
        legendaryWeapon: legendaryWeapon ?? currentRun.hero.legendaryWeapon,
        timestamp: Date.now(),
      };

      const { records, isNewBest } = recordFinishedRun(entry);
      setCareer(records);
      setGameOverSummary({ entry, isNewBest });
      setScreen('VICTORY');
    },
    [playerName]
  );

  const isBossEnemy = (enemy: Enemy) =>
    Boolean(enemy.isBoss || enemy.archetypeId === 'floor_warden');

  const triggerBossRoast = useCallback(
    (
      hero: HeroState,
      enemy: Enemy,
      turnNumber: number,
      potionsUsed: number,
      event: string,
      damageDealt?: number
    ) => {
      if (!isBossEnemy(enemy)) return;
      if (roastAbortRef.current) {
        roastAbortRef.current.abort();
      }
      const controller = new AbortController();
      roastAbortRef.current = controller;

      setCombat((prev) => (prev ? { ...prev, bossRoastLoading: true } : prev));

      void fetchBossRoast(
        {
          playerName: hero.playerName || playerName || hero.name,
          className: hero.name,
          hp: hero.hp,
          maxHp: hero.maxHp,
          shield: hero.shield,
          weaponName: hero.weaponName,
          weaponLevel: hero.weaponLevel,
          atk: hero.atk,
          armorName: hero.armorName,
          armorLevel: hero.armorLevel,
          def: hero.def,
          bossHp: enemy.hp,
          bossMaxHp: enemy.maxHp,
          turnNumber,
          potionsUsed,
          event,
          damageDealt,
        },
        controller.signal
      ).then(({ line }) => {
        if (controller.signal.aborted) return;
        setCombat((prev) =>
          prev ? { ...prev, bossRoast: line, bossRoastLoading: false } : prev
        );
      });
    },
    [playerName]
  );

  const triggerBossLegendaryWeapon = useCallback(
    (
      hero: HeroState,
      turnsTaken: number,
      potionsUsed: number,
      score: number,
      gold: number
    ) => {
      if (roastAbortRef.current) {
        roastAbortRef.current.abort();
      }
      setCombat((prev) =>
        prev ? { ...prev, legendaryDropLoading: true, bossRoastLoading: false } : prev
      );

      void fetchBossLegendaryWeapon({
        playerName: hero.playerName || playerName || hero.name,
        className: hero.name,
        weaponName: hero.weaponName,
        armorName: hero.armorName,
        turnsTaken,
        potionsUsed,
        hpRemaining: hero.hp,
        maxHp: hero.maxHp,
        score,
        gold,
      }).then((weapon) => {
        setCombat((prev) =>
          prev
            ? { ...prev, legendaryDrop: weapon, legendaryDropLoading: false }
            : prev
        );
      });
    },
    [playerName]
  );

  const beginCombat = useCallback(
    (enemy: Enemy, ambushed: boolean) => {
      const bossFight = isBossEnemy(enemy);
      setRun((prev) => {
        if (!prev) return prev;
        const seen = prev.encounteredArchetypes.includes(enemy.archetypeId)
          ? prev.encounteredArchetypes
          : [...prev.encounteredArchetypes, enemy.archetypeId];
        return {
          ...prev,
          encounteredArchetypes: seen,
          logs: appendLog(
            prev.logs,
            prev.turn,
            ambushed
              ? `${enemy.name} ambushed you!`
              : `Engaged ${enemy.name} in combat.`,
            'crimson'
          ),
        };
      });

      const initialRoast =
        bossFight && run
          ? getLocalFallbackRoast({
              playerName: run.hero.playerName || playerName || run.hero.name,
              className: run.hero.name,
              hp: run.hero.hp,
              maxHp: run.hero.maxHp,
              shield: run.hero.shield,
              weaponName: run.hero.weaponName,
              weaponLevel: run.hero.weaponLevel,
              atk: run.hero.atk,
              armorName: run.hero.armorName,
              armorLevel: run.hero.armorLevel,
              def: run.hero.def,
              bossHp: enemy.hp,
              bossMaxHp: enemy.maxHp,
              turnNumber: 1,
              potionsUsed: 0,
              event: 'encounter_start',
            })
          : null;

      setCombat({
        enemy: { ...enemy },
        turnNumber: 1,
        heroDefending: false,
        heroBonusAtk: 0,
        enemyStunned: false,
        phase: 'PLAYER_TURN',
        logs: [
          {
            id: uid('clog'),
            text: ambushed
              ? `${enemy.name} intercepted your path! Choose your action.`
              : `Encountered ${enemy.name} (HP ${enemy.hp}/${enemy.maxHp}).`,
            tone: 'system',
          },
        ],
        lastHeroHit: false,
        lastEnemyHit: false,
        heroAction: null,
        actionTick: 0,
        rewardGold: enemy.goldReward,
        rewardScore: enemy.scoreReward,
        droppedItemName: null,
        potionsUsed: 0,
        bossRoast: initialRoast,
        bossRoastLoading: bossFight,
        legendaryDrop: null,
        legendaryDropLoading: false,
      });

      if (bossFight && run) {
        triggerBossRoast(run.hero, enemy, 1, 0, 'encounter_start');
      }
    },
    [playerName, run, triggerBossRoast]
  );

  const applyDamageToHero = (
    hero: HeroState,
    rawDmg: number
  ): { nextHero: HeroState; shieldAbsorbed: number; hpLost: number } => {
    const shieldAbsorbed = Math.min(hero.shield, rawDmg);
    const hpLost = Math.max(0, rawDmg - shieldAbsorbed);
    return {
      nextHero: {
        ...hero,
        shield: hero.shield - shieldAbsorbed,
        hp: Math.max(0, hero.hp - hpLost),
      },
      shieldAbsorbed,
      hpLost,
    };
  };

  // Resolve a single exploration step (dx, dy) or wait (0, 0)
  const performExplorationStep = useCallback(
    (dx: number, dy: number) => {
      if (
        !run ||
        screen !== 'PLAYING' ||
        combat ||
        inventoryOpen ||
        floorTransitionOpen ||
        helpOpen
      ) {
        return;
      }

      const isWait = dx === 0 && dy === 0;
      const nx = run.hero.x + dx;
      const ny = run.hero.y + dy;
      const nextFacing: HeroState['facing'] =
        dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : dy < 0 ? 'up' : run.hero.facing;
      const nextHorizontalFacing: 'left' | 'right' =
        dx > 0
          ? 'right'
          : dx < 0
          ? 'left'
          : run.hero.horizontalFacing ?? (run.hero.facing === 'left' ? 'left' : 'right');

      if (!isWait) {
        if (
          nx < 0 ||
          nx >= run.floor.width ||
          ny < 0 ||
          ny >= run.floor.height ||
          run.floor.tiles[ny][nx] === 'WALL'
        ) {
          setRun((prev) =>
            prev
              ? {
                  ...prev,
                  hero: {
                    ...prev.hero,
                    facing: nextFacing,
                    horizontalFacing: nextHorizontalFacing,
                  },
                }
              : prev
          );
          setHeroStep((s) => ({ dx, dy, seq: s.seq + 1, isBump: true }));
          return;
        }

        // Check if bumping into an enemy
        const targetEnemy = run.floor.enemies.find((e) => e.x === nx && e.y === ny);
        if (targetEnemy) {
          setRun((prev) =>
            prev
              ? {
                  ...prev,
                  hero: {
                    ...prev.hero,
                    facing: nextFacing,
                    horizontalFacing: nextHorizontalFacing,
                  },
                }
              : prev
          );
          setHeroStep((s) => ({ dx, dy, seq: s.seq + 1, isBump: true }));
          sound.playHit();
          beginCombat(targetEnemy, false);
          return;
        }
      }

      if (!isWait) {
        setHeroStep((s) => ({ dx, dy, seq: s.seq + 1, isBump: false }));
      }

      const nextTurn = run.turn + 1;
      let nextHero: HeroState = {
        ...run.hero,
        x: nx,
        y: ny,
        facing: nextFacing,
        horizontalFacing: nextHorizontalFacing,
      };
      let nextInventory = [...run.inventory];
      let nextLogs = [...run.logs];
      let nextTrapsTriggered = run.trapsTriggered;

      // Recompute fog-of-war
      let nextFloor = computeFogOfWar(run.floor, nx, ny, nextHero.visionRadius);

      if (isWait) {
        nextLogs = appendLog(nextLogs, nextTurn, 'Held position for 1 turn.', 'neutral');
      } else {
        sound.playMove();
      }

      // Check loot on tile
      const lootAtTile = nextFloor.loot.find((l) => l.x === nx && l.y === ny);
      if (lootAtTile) {
        nextFloor = {
          ...nextFloor,
          loot: nextFloor.loot.filter((l) => l.id !== lootAtTile.id),
        };
        if (lootAtTile.type === 'gold') {
          nextHero.gold += lootAtTile.amount;
          nextHero.score += lootAtTile.amount * 2;
          sound.playGold();
          spawnPopup(nx, ny, `+${lootAtTile.amount}G`, '#fbbf24');
          nextLogs = appendLog(
            nextLogs,
            nextTurn,
            `Collected ${lootAtTile.amount} Gold.`,
            'amber'
          );
        } else {
          nextInventory = addInventoryItem(nextInventory, lootAtTile.type, 1);
          nextHero.score += 30;
          sound.playPotion();
          spawnPopup(nx, ny, `+${ITEM_CATALOG[lootAtTile.type].shortName}`, '#6ee7b7');
          nextLogs = appendLog(
            nextLogs,
            nextTurn,
            `Picked up ${lootAtTile.name}.`,
            'emerald'
          );
        }
      }

      // Passive trap spotting on adjacent tiles
      const spotChance = nextHero.classId === 'volt' ? 0.55 : 0.25;
      let spottedAny = false;
      nextFloor = {
        ...nextFloor,
        traps: nextFloor.traps.map((t) => {
          if (
            !t.revealed &&
            !t.triggered &&
            Math.abs(t.x - nx) + Math.abs(t.y - ny) === 1 &&
            Math.random() < spotChance
          ) {
            spottedAny = true;
            nextLogs = appendLog(
              nextLogs,
              nextTurn,
              `Scanner detected a concealed ${t.name}!`,
              'amber'
            );
            return { ...t, revealed: true };
          }
          return t;
        }),
      };
      if (spottedAny) {
        sound.playDefend();
      }

      // Check trap trigger on hero's tile
      const trapOnTile = nextFloor.traps.find(
        (t) => t.x === nx && t.y === ny && !t.triggered
      );
      if (trapOnTile) {
        nextFloor = {
          ...nextFloor,
          traps: nextFloor.traps.map((t) =>
            t.id === trapOnTile.id ? { ...t, triggered: true, revealed: true } : t
          ),
        };
        const { nextHero: damagedHero, shieldAbsorbed, hpLost } = applyDamageToHero(
          nextHero,
          trapOnTile.damage
        );
        nextHero = damagedHero;
        nextTrapsTriggered += 1;
        sound.playTrap();
        spawnPopup(nx, ny, `-${trapOnTile.damage} TRAP`, '#ef4444');
        nextLogs = appendLog(
          nextLogs,
          nextTurn,
          `Triggered ${trapOnTile.name}! Took ${hpLost} HP${
            shieldAbsorbed > 0 ? ` (${shieldAbsorbed} blocked by shield)` : ''
          }.`,
          'crimson'
        );

        if (nextHero.hp <= 0) {
          const fatalRun: ActiveRunState = {
            ...run,
            hero: nextHero,
            floor: nextFloor,
            inventory: nextInventory,
            logs: nextLogs,
            turn: nextTurn,
            trapsTriggered: nextTrapsTriggered,
          };
          setRun(fatalRun);
          triggerGameOver(
            fatalRun,
            `Killed by a ${trapOnTile.name} on Floor ${nextFloor.floorNumber}`
          );
          return;
        }
      }

      // Check stairs discovery / landing
      const steppedOnStairs = nextFloor.tiles[ny][nx] === 'STAIRS';
      if (steppedOnStairs) {
        sound.playStairs();
        const stairRun: ActiveRunState = {
          ...run,
          hero: nextHero,
          floor: nextFloor,
          inventory: nextInventory,
          logs: nextLogs,
          turn: nextTurn,
          trapsTriggered: nextTrapsTriggered,
        };

        if (run.isCustomMap) {
          triggerVictory(
            stairRun,
            `Successfully cleared custom crypt: "${run.customMapName || 'Custom Level'}"!`
          );
          return;
        }

        nextLogs = appendLog(
          nextLogs,
          nextTurn,
          `Reached the descent stairs on Floor ${nextFloor.floorNumber}.`,
          'amber'
        );
        stairRun.logs = nextLogs;
        setRun(stairRun);
        setFloorTransitionOpen(true);
        return;
      }

      // Enemy AI takes 1 step toward hero
      const { updatedFloor, ambushingEnemy } = stepEnemiesTowardHero(nextFloor, nx, ny);

      const updatedRun: ActiveRunState = {
        ...run,
        hero: nextHero,
        floor: updatedFloor,
        inventory: nextInventory,
        logs: nextLogs,
        turn: nextTurn,
        trapsTriggered: nextTrapsTriggered,
      };

      setRun(updatedRun);

      if (ambushingEnemy) {
        sound.playEnemyHit();
        beginCombat(ambushingEnemy, true);
      }
    },
    [
      run,
      screen,
      combat,
      inventoryOpen,
      floorTransitionOpen,
      helpOpen,
      beginCombat,
      spawnPopup,
      triggerGameOver,
    ]
  );

  // Tile click handler: adjacent moves/attacks immediately, distant explored tiles step 1 tile closer
  const handleTileClick = useCallback(
    (tx: number, ty: number) => {
      if (!run || combat || inventoryOpen || floorTransitionOpen || helpOpen) return;

      if (tx === run.hero.x && ty === run.hero.y) {
        if (run.floor.tiles[ty][tx] === 'STAIRS') {
          setFloorTransitionOpen(true);
        }
        return;
      }

      const dist = Math.abs(tx - run.hero.x) + Math.abs(ty - run.hero.y);
      if (dist === 1) {
        performExplorationStep(tx - run.hero.x, ty - run.hero.y);
        return;
      }

      // Smart 1-step path toward clicked explored walkable tile
      if (run.floor.explored[ty]?.[tx] && run.floor.tiles[ty][tx] !== 'WALL') {
        const blocked = new Set<string>(
          run.floor.enemies.map((e) => `${e.x},${e.y}`)
        );
        const step = findNextStepBFS(
          run.floor,
          run.hero.x,
          run.hero.y,
          tx,
          ty,
          blocked
        );
        if (step) {
          performExplorationStep(step.x - run.hero.x, step.y - run.hero.y);
        }
      }
    },
    [run, combat, inventoryOpen, floorTransitionOpen, helpOpen, performExplorationStep]
  );

  // Keyboard shortcuts during exploration (and arrow/space scroll prevention)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (screen !== 'PLAYING') return;

      // Always prevent default window scroll for Arrow keys and Spacebar while playing
      if (
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === ' '
      ) {
        e.preventDefault();
      }

      if (helpOpen || combat || floorTransitionOpen) return;

      if (e.key === '?' || e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }

      if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setInventoryOpen((prev) => !prev);
        return;
      }
      if (e.key === 'Escape') {
        if (inventoryOpen) {
          setInventoryOpen(false);
        } else {
          setScreen('TITLE');
        }
        return;
      }

      if (inventoryOpen) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          performExplorationStep(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          performExplorationStep(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          performExplorationStep(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          performExplorationStep(1, 0);
          break;
        case 'Enter':
          if (
            run &&
            run.floor.tiles[run.hero.y]?.[run.hero.x] === 'STAIRS' &&
            !(document.activeElement instanceof HTMLButtonElement)
          ) {
            e.preventDefault();
            if (run.isCustomMap) {
              triggerVictory(
                run,
                `Successfully cleared custom crypt "${run.customMapName || 'Custom Level'}"!`
              );
            } else {
              setFloorTransitionOpen(true);
            }
          }
          break;
        case ' ':
        case '.':
          performExplorationStep(0, 0);
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    screen,
    run,
    combat,
    inventoryOpen,
    floorTransitionOpen,
    helpOpen,
    performExplorationStep,
  ]);

  // Combat enemy turn execution
  const scheduleEnemyCounterTurn = useCallback(
    (
      nextCombatState: CombatState,
      currentHero: HeroState
    ) => {
      if (combatTimerRef.current) {
        window.clearTimeout(combatTimerRef.current);
      }

      combatTimerRef.current = window.setTimeout(() => {
        setCombat((prev) => {
          if (!prev || prev.phase === 'VICTORY' || prev.phase === 'DEFEAT') return prev;

          if (prev.enemyStunned) {
            return {
              ...prev,
              enemyStunned: false,
              heroDefending: false,
              turnNumber: prev.turnNumber + 1,
              phase: 'PLAYER_TURN',
              lastHeroHit: false,
              lastEnemyHit: false,
              logs: [
                ...prev.logs,
                {
                  id: uid('clog'),
                  text: `${prev.enemy.name} is stunned and loses its turn!`,
                  tone: 'system',
                },
              ],
            };
          }

          const rawAttack = Math.max(
            1,
            prev.enemy.atk - Math.floor(currentHero.def * 0.55) + randInt(-1, 1)
          );
          const dmgAfterGuard = prev.heroDefending
            ? Math.max(1, Math.round(rawAttack * 0.3))
            : rawAttack;

          const { nextHero, shieldAbsorbed, hpLost } = applyDamageToHero(
            currentHero,
            dmgAfterGuard
          );

          sound.playEnemyHit();

          // Reflected counter damage when defending
          let enemyAfterReflect = { ...prev.enemy };
          const logsToAdd: CombatLogEntry[] = [
            {
              id: uid('clog'),
              text: prev.heroDefending
                ? `${prev.enemy.name} strikes your barrier for ${dmgAfterGuard} dmg (${shieldAbsorbed > 0 ? `${shieldAbsorbed} shielded, ` : ''}${hpLost} HP).`
                : `${prev.enemy.name} hits you for ${dmgAfterGuard} dmg${
                    shieldAbsorbed > 0 ? ` (${shieldAbsorbed} shielded)` : ''
                  }.`,
              tone: 'enemy',
            },
          ];

          if (prev.heroDefending) {
            const reflectDmg = 2 + Math.floor((run?.floor.floorNumber ?? 1) / 2);
            enemyAfterReflect.hp = Math.max(0, enemyAfterReflect.hp - reflectDmg);
            logsToAdd.push({
              id: uid('clog'),
              text: `Kinetic Guard reflects ${reflectDmg} damage back!`,
              tone: 'hero',
            });
          }

          setRun((r) => (r ? { ...r, hero: nextHero } : r));

          if (nextHero.hp <= 0) {
            if (run) {
              triggerGameOver(
                { ...run, hero: nextHero },
                `Slain by ${prev.enemy.name} on Floor ${run.floor.floorNumber}`
              );
            }
            return {
              ...prev,
              enemy: enemyAfterReflect,
              phase: 'DEFEAT',
              lastHeroHit: true,
              logs: [...prev.logs, ...logsToAdd],
            };
          }

          // Enemy died from reflect!
          if (enemyAfterReflect.hp <= 0) {
            sound.playVictory();
            if (isBossEnemy(enemyAfterReflect) && run) {
              triggerBossLegendaryWeapon(
                nextHero,
                prev.turnNumber,
                prev.potionsUsed,
                run.hero.score + prev.rewardScore + 500,
                run.hero.gold + prev.rewardGold
              );
            }
              return {
                ...prev,
                enemy: enemyAfterReflect,
                heroDefending: false,
                phase: 'VICTORY',
                lastHeroHit: true,
                lastEnemyHit: true,
                heroAction: 'flinch',
                actionTick: (prev.actionTick ?? 0) + 1,
                logs: [
                  ...prev.logs,
                  ...logsToAdd,
                  {
                    id: uid('clog'),
                    text: `${prev.enemy.name} collapsed from barrier recoil!`,
                    tone: 'crit',
                  },
                ],
              };
            }

            if (isBossEnemy(enemyAfterReflect) && nextHero.hp / nextHero.maxHp <= 0.35) {
              triggerBossRoast(
                nextHero,
                enemyAfterReflect,
                prev.turnNumber + 1,
                prev.potionsUsed,
                'boss_heavy_hit',
                dmgAfterGuard
              );
            }

            return {
              ...prev,
              enemy: enemyAfterReflect,
              heroDefending: false,
              turnNumber: prev.turnNumber + 1,
              phase: 'PLAYER_TURN',
              lastHeroHit: true,
              lastEnemyHit: false,
              heroAction: 'flinch',
              actionTick: (prev.actionTick ?? 0) + 1,
              logs: [...prev.logs, ...logsToAdd],
            };
          });
        }, 280);
      },
      [run, triggerGameOver, triggerBossLegendaryWeapon, triggerBossRoast]
    );

  const handleCombatVictoryRollDrop = (enemy: Enemy): InventoryItemId | null => {
    const chance = enemy.tier === 'warden' ? 0.85 : enemy.tier === 'elite' ? 0.45 : 0.25;
    if (Math.random() > chance) return null;
    const pool: InventoryItemId[] = ['med_vial', 'aegis_cell', 'shock_bomb', 'overdrive_core'];
    return pool[randInt(0, pool.length - 1)];
  };

  const handleCombatAttack = () => {
    if (!combat || !run || combat.phase !== 'PLAYER_TURN') return;

    const totalAtk = run.hero.atk + combat.heroBonusAtk;
    const baseDmg = Math.max(2, totalAtk - Math.floor(combat.enemy.def * 0.45) + randInt(-1, 1));
    const isCrit = Math.random() < run.hero.critChance;
    const finalDmg = isCrit ? Math.round(baseDmg * 1.75) : baseDmg;

    if (isCrit) sound.playCrit();
    else sound.playHit();

    const nextEnemyHp = Math.max(0, combat.enemy.hp - finalDmg);
    const updatedEnemy = { ...combat.enemy, hp: nextEnemyHp };

    const strikeLog: CombatLogEntry = {
      id: uid('clog'),
      text: isCrit
        ? `CRITICAL HIT! You strike ${combat.enemy.name} for ${finalDmg} damage!`
        : `You strike ${combat.enemy.name} for ${finalDmg} damage.`,
      tone: isCrit ? 'crit' : 'hero',
    };

    if (nextEnemyHp <= 0) {
      sound.playVictory();
      const dropId = handleCombatVictoryRollDrop(combat.enemy);
      if (dropId) {
        setRun((r) =>
          r ? { ...r, inventory: addInventoryItem(r.inventory, dropId, 1) } : r
        );
      }
      const bossKilled = isBossEnemy(combat.enemy);
      setCombat({
        ...combat,
        enemy: updatedEnemy,
        phase: 'VICTORY',
        lastEnemyHit: true,
        lastHeroHit: false,
        heroAction: 'attack',
        actionTick: (combat.actionTick ?? 0) + 1,
        droppedItemName: dropId ? ITEM_CATALOG[dropId].name : null,
        legendaryDropLoading: bossKilled,
        logs: [
          ...combat.logs,
          strikeLog,
          { id: uid('clog'), text: `${combat.enemy.name} defeated!`, tone: 'system' },
        ],
      });
      if (bossKilled) {
        triggerBossLegendaryWeapon(
          run.hero,
          combat.turnNumber,
          combat.potionsUsed,
          run.hero.score + combat.rewardScore + 500,
          run.hero.gold + combat.rewardGold
        );
      }
      return;
    }

    const intermediate: CombatState = {
      ...combat,
      enemy: updatedEnemy,
      heroDefending: false,
      phase: 'ANIMATING',
      lastEnemyHit: true,
      lastHeroHit: false,
      heroAction: 'attack',
      actionTick: (combat.actionTick ?? 0) + 1,
      logs: [...combat.logs, strikeLog],
    };
    setCombat(intermediate);

    if (isBossEnemy(updatedEnemy) && (isCrit || finalDmg >= 9 || combat.turnNumber % 2 === 1)) {
      triggerBossRoast(
        run.hero,
        updatedEnemy,
        combat.turnNumber,
        combat.potionsUsed,
        isCrit ? 'player_crit' : 'player_attack',
        finalDmg
      );
    }

    scheduleEnemyCounterTurn(intermediate, run.hero);
  };

  const handleCombatDefend = () => {
    if (!combat || !run || combat.phase !== 'PLAYER_TURN') return;
    sound.playDefend();

    const healed = Math.min(2, run.hero.maxHp - run.hero.hp);
    const nextHero = { ...run.hero, hp: run.hero.hp + healed };
    setRun((r) => (r ? { ...r, hero: nextHero } : r));

    const intermediate: CombatState = {
      ...combat,
      heroDefending: true,
      phase: 'ANIMATING',
      lastHeroHit: false,
      lastEnemyHit: false,
      heroAction: 'defend',
      actionTick: (combat.actionTick ?? 0) + 1,
      logs: [
        ...combat.logs,
        {
          id: uid('clog'),
          text: `Raised Kinetic Guard (-70% incoming dmg, reflects dmg${
            healed > 0 ? `, +${healed} HP surge` : ''
          }).`,
          tone: 'heal',
        },
      ],
    };
    setCombat(intermediate);

    if (
      isBossEnemy(combat.enemy) &&
      (combat.turnNumber % 2 === 1 || nextHero.hp / nextHero.maxHp <= 0.5)
    ) {
      triggerBossRoast(
        nextHero,
        combat.enemy,
        combat.turnNumber,
        combat.potionsUsed,
        'player_defend'
      );
    }

    scheduleEnemyCounterTurn(intermediate, nextHero);
  };

  const handleCombatUseItem = (itemId: InventoryItemId) => {
    if (!combat || !run || combat.phase !== 'PLAYER_TURN') return;
    const item = run.inventory.find((i) => i.id === itemId && i.quantity > 0);
    if (!item) return;

    const nextInv = consumeInventoryItem(run.inventory, itemId);
    let nextHero = { ...run.hero };
    let nextEnemy = { ...combat.enemy };
    let nextBonusAtk = combat.heroBonusAtk;
    let nextStun = combat.enemyStunned;
    const usedPotion = itemId === 'med_vial';
    const nextPotionsUsed = combat.potionsUsed + (usedPotion ? 1 : 0);
    let logEntry: CombatLogEntry;

    if (itemId === 'med_vial') {
      const healAmt = Math.min(14, nextHero.maxHp - nextHero.hp);
      nextHero.hp += healAmt;
      sound.playPotion();
      logEntry = {
        id: uid('clog'),
        text: `Used Nano-Med Vial (+${healAmt} HP).`,
        tone: 'heal',
      };
    } else if (itemId === 'aegis_cell') {
      nextHero.shield += 10;
      sound.playDefend();
      logEntry = {
        id: uid('clog'),
        text: 'Activated Aegis Shield Cell (+10 Kinetic Shield).',
        tone: 'hero',
      };
    } else if (itemId === 'overdrive_core') {
      nextBonusAtk += 4;
      sound.playCrit();
      logEntry = {
        id: uid('clog'),
        text: 'Consumed Overdrive Core (+4 Attack for this encounter).',
        tone: 'crit',
      };
    } else {
      // shock_bomb
      const dmg = 14;
      nextEnemy.hp = Math.max(0, nextEnemy.hp - dmg);
      nextStun = true;
      sound.playTrap();
      logEntry = {
        id: uid('clog'),
        text: `Threw Arc Shock Bomb for ${dmg} damage and stunned ${nextEnemy.name}!`,
        tone: 'crit',
      };
    }

    setRun((r) =>
      r
        ? {
            ...r,
            hero: nextHero,
            inventory: nextInv,
            potionsUsedTotal: (r.potionsUsedTotal ?? 0) + (usedPotion ? 1 : 0),
          }
        : r
    );

    if (nextEnemy.hp <= 0) {
      sound.playVictory();
      const dropId = handleCombatVictoryRollDrop(nextEnemy);
      if (dropId) {
        setRun((r) =>
          r ? { ...r, inventory: addInventoryItem(r.inventory, dropId, 1) } : r
        );
      }
      const bossKilled = isBossEnemy(nextEnemy);
      setCombat({
        ...combat,
        enemy: nextEnemy,
        heroBonusAtk: nextBonusAtk,
        enemyStunned: nextStun,
        potionsUsed: nextPotionsUsed,
        phase: 'VICTORY',
        lastEnemyHit: true,
        lastHeroHit: false,
        heroAction: itemId === 'shock_bomb' ? 'attack' : 'item',
        actionTick: (combat.actionTick ?? 0) + 1,
        droppedItemName: dropId ? ITEM_CATALOG[dropId].name : null,
        legendaryDropLoading: bossKilled,
        logs: [
          ...combat.logs,
          logEntry,
          { id: uid('clog'), text: `${nextEnemy.name} neutralized!`, tone: 'system' },
        ],
      });
      if (bossKilled) {
        triggerBossLegendaryWeapon(
          nextHero,
          combat.turnNumber,
          nextPotionsUsed,
          nextHero.score + combat.rewardScore + 500,
          nextHero.gold + combat.rewardGold
        );
      }
      return;
    }

    const intermediate: CombatState = {
      ...combat,
      enemy: nextEnemy,
      heroBonusAtk: nextBonusAtk,
      enemyStunned: nextStun,
      potionsUsed: nextPotionsUsed,
      heroDefending: false,
      phase: 'ANIMATING',
      lastEnemyHit: itemId === 'shock_bomb',
      lastHeroHit: false,
      heroAction: itemId === 'shock_bomb' ? 'attack' : 'item',
      actionTick: (combat.actionTick ?? 0) + 1,
      logs: [...combat.logs, logEntry],
    };
    setCombat(intermediate);

    if (isBossEnemy(nextEnemy)) {
      triggerBossRoast(
        nextHero,
        nextEnemy,
        combat.turnNumber,
        nextPotionsUsed,
        itemId === 'med_vial'
          ? 'player_potion'
          : itemId === 'shock_bomb'
          ? 'player_bomb'
          : 'player_item'
      );
    }

    scheduleEnemyCounterTurn(intermediate, nextHero);
  };

  const handleCombatFlee = () => {
    if (!combat || !run || combat.phase !== 'PLAYER_TURN') return;
    const escaped = Math.random() < 0.65;
    if (escaped) {
      if (roastAbortRef.current) {
        roastAbortRef.current.abort();
      }
      sound.playMove();
      // Move hero back 1 open tile away from enemy if available so they aren't stuck adjacent
      const dirs = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
      ];
      let bestPos = { x: run.hero.x, y: run.hero.y };
      let bestDist = Math.abs(run.hero.x - combat.enemy.x) + Math.abs(run.hero.y - combat.enemy.y);
      for (const { dx, dy } of dirs) {
        const cx = run.hero.x + dx;
        const cy = run.hero.y + dy;
        if (cx < 0 || cx >= run.floor.width || cy < 0 || cy >= run.floor.height) continue;
        if (run.floor.tiles[cy][cx] === 'WALL') continue;
        if (run.floor.enemies.some((e) => e.x === cx && e.y === cy)) continue;
        const d = Math.abs(cx - combat.enemy.x) + Math.abs(cy - combat.enemy.y);
        if (d > bestDist) {
          bestDist = d;
          bestPos = { x: cx, y: cy };
        }
      }

      setRun((prev) => {
        if (!prev) return prev;
        const nextFloor = computeFogOfWar(
          prev.floor,
          bestPos.x,
          bestPos.y,
          prev.hero.visionRadius
        );
        return {
          ...prev,
          hero: { ...prev.hero, x: bestPos.x, y: bestPos.y },
          floor: nextFloor,
          logs: appendLog(
            prev.logs,
            prev.turn,
            `Disengaged from ${combat.enemy.name}.`,
            'cyan'
          ),
        };
      });
      setCombat(null);
      return;
    }

    // Failed to flee -> enemy strikes
    const intermediate: CombatState = {
      ...combat,
      heroDefending: false,
      phase: 'ANIMATING',
      logs: [
        ...combat.logs,
        {
          id: uid('clog'),
          text: `Failed to break away from ${combat.enemy.name}!`,
          tone: 'enemy',
        },
      ],
    };
    setCombat(intermediate);

    if (isBossEnemy(combat.enemy)) {
      triggerBossRoast(
        run.hero,
        combat.enemy,
        combat.turnNumber,
        combat.potionsUsed,
        'player_flee_fail'
      );
    }

    scheduleEnemyCounterTurn(intermediate, run.hero);
  };

  const handleVictoryContinue = () => {
    if (!combat || !run) return;
    const defeatedId = combat.enemy.id;
    const bonusGold = combat.rewardGold;
    const bonusScore = combat.rewardScore;
    const isFinalBoss =
      Boolean(combat.enemy.isBoss) ||
      (run.floor.floorNumber >= MAX_FLOOR && combat.enemy.tier === 'warden');

    const updatedFloor = {
      ...run.floor,
      enemies: run.floor.enemies.filter((e) => e.id !== defeatedId),
    };

    const victoryCompletionBonus = isFinalBoss ? 500 : 0;

    let awardedRelic: LegendaryWeapon | undefined = undefined;
    let nextHero: HeroState = {
      ...run.hero,
      gold: run.hero.gold + bonusGold,
      score: run.hero.score + bonusScore + victoryCompletionBonus,
    };

    if (isFinalBoss) {
      awardedRelic =
        combat.legendaryDrop ??
        getLocalFallbackWeapon({
          playerName: run.hero.playerName || playerName || run.hero.name,
          className: run.hero.name,
          weaponName: run.hero.weaponName,
          armorName: run.hero.armorName,
          turnsTaken: combat.turnNumber,
          potionsUsed: combat.potionsUsed,
          hpRemaining: run.hero.hp,
          maxHp: run.hero.maxHp,
          score: nextHero.score,
          gold: nextHero.gold,
        });
      nextHero = {
        ...nextHero,
        weaponName: awardedRelic.name,
        weaponLevel: nextHero.weaponLevel + 1,
        atk: nextHero.atk + awardedRelic.bonusAtk,
        legendaryWeapon: awardedRelic,
      };
    }

    const updatedRun: ActiveRunState = {
      ...run,
      hero: nextHero,
      floor: updatedFloor,
      enemiesDefeated: run.enemiesDefeated + 1,
      logs: appendLog(
        run.logs,
        run.turn,
        `Defeated ${combat.enemy.name} (+${bonusGold}G, +${bonusScore + victoryCompletionBonus} Score${
          awardedRelic
            ? `, claimed ${awardedRelic.name}`
            : combat.droppedItemName
            ? `, looted ${combat.droppedItemName}`
            : ''
        }).`,
        'emerald'
      ),
    };

    if (isFinalBoss) {
      triggerVictory(
        updatedRun,
        `Defeated ${combat.enemy.name} and cleared all ${MAX_FLOOR} floors!`,
        awardedRelic
      );
      return;
    }

    setRun(updatedRun);
    spawnPopup(run.hero.x, run.hero.y, `+${bonusGold}G`, '#fbbf24');
    setCombat(null);
  };

  // Use consumable outside combat
  const handleUseExplorationItem = (itemId: InventoryItemId) => {
    if (!run) return;
    const item = run.inventory.find((i) => i.id === itemId && i.quantity > 0);
    if (!item || !item.usableInExploration) return;

    let nextHero = { ...run.hero };
    let msg = '';
    if (itemId === 'med_vial') {
      if (nextHero.hp >= nextHero.maxHp) return;
      const heal = Math.min(14, nextHero.maxHp - nextHero.hp);
      nextHero.hp += heal;
      sound.playPotion();
      msg = `Used Nano-Med Vial (+${heal} HP).`;
      spawnPopup(nextHero.x, nextHero.y, `+${heal} HP`, '#10b981');
    } else if (itemId === 'aegis_cell') {
      nextHero.shield += 10;
      sound.playDefend();
      msg = 'Activated Aegis Shield Cell (+10 Shield).';
      spawnPopup(nextHero.x, nextHero.y, '+10 SHIELD', '#06b6d4');
    } else if (itemId === 'overdrive_core') {
      nextHero.atk += 1;
      sound.playCrit();
      msg = 'Infused Overdrive Core (+1 Attack permanently).';
      spawnPopup(nextHero.x, nextHero.y, '+1 ATK', '#f59e0b');
    }

    const nextInv = consumeInventoryItem(run.inventory, itemId);
    setRun({
      ...run,
      hero: nextHero,
      inventory: nextInv,
      logs: appendLog(run.logs, run.turn, msg, 'emerald'),
    });
  };

  const handleBuyItem = (itemId: InventoryItemId, cost: number) => {
    if (!run || run.hero.gold < cost) return;
    sound.playGold();
    setRun({
      ...run,
      hero: { ...run.hero, gold: run.hero.gold - cost },
      inventory: addInventoryItem(run.inventory, itemId, 1),
      logs: appendLog(
        run.logs,
        run.turn,
        `Requisitioned ${ITEM_CATALOG[itemId].name} (-${cost}G).`,
        'cyan'
      ),
    });
  };

  const handleUpgradeWeapon = (cost: number) => {
    if (!run || run.hero.gold < cost) return;
    sound.playCrit();
    setRun({
      ...run,
      hero: {
        ...run.hero,
        gold: run.hero.gold - cost,
        atk: run.hero.atk + 2,
        weaponLevel: run.hero.weaponLevel + 1,
      },
      logs: appendLog(
        run.logs,
        run.turn,
        `Upgraded ${run.hero.weaponName} (+2 Attack).`,
        'amber'
      ),
    });
  };

  const handleUpgradeArmor = (cost: number) => {
    if (!run || run.hero.gold < cost) return;
    sound.playDefend();
    setRun({
      ...run,
      hero: {
        ...run.hero,
        gold: run.hero.gold - cost,
        def: run.hero.def + 1,
        maxHp: run.hero.maxHp + 4,
        hp: run.hero.hp + 4,
        armorLevel: run.hero.armorLevel + 1,
      },
      logs: appendLog(
        run.logs,
        run.turn,
        `Reinforced ${run.hero.armorName} (+1 DEF, +4 Max HP).`,
        'cyan'
      ),
    });
  };

  const handleBuyMerchantItem = (item: MerchantItem) => {
    if (!run || run.hero.gold < item.cost) return;
    const purchased = run.purchasedShopIds ?? [];
    if (item.unique && purchased.includes(item.id)) return;

    let nextHero: HeroState = {
      ...run.hero,
      gold: run.hero.gold - item.cost,
    };
    let nextInventory = [...run.inventory];

    if (item.atkBonus) {
      nextHero.atk += item.atkBonus;
      nextHero.weaponName = item.name;
      nextHero.weaponLevel += 1;
      sound.playCrit();
    } else if (item.defBonus || item.shieldBonus || item.maxHpBonus) {
      nextHero.def += item.defBonus ?? 0;
      nextHero.shield += item.shieldBonus ?? 0;
      if (item.maxHpBonus) {
        nextHero.maxHp += item.maxHpBonus;
        nextHero.hp = Math.min(nextHero.maxHp, nextHero.hp + item.maxHpBonus);
      }
      nextHero.armorName = item.name;
      nextHero.armorLevel += 1;
      sound.playDefend();
    } else if (item.instantHeal) {
      if (nextHero.hp >= nextHero.maxHp) return;
      nextHero.hp = Math.min(nextHero.maxHp, nextHero.hp + item.instantHeal);
      sound.playPotion();
    } else if (item.inventoryItemId) {
      nextInventory = addInventoryItem(nextInventory, item.inventoryItemId, 1);
      sound.playGold();
    }

    setRun({
      ...run,
      hero: nextHero,
      inventory: nextInventory,
      purchasedShopIds: item.unique ? [...purchased, item.id] : purchased,
      logs: appendLog(
        run.logs,
        run.turn,
        `Purchased ${item.name} (-${item.cost}G) at Inter-Floor Merchant.`,
        'amber'
      ),
    });
  };

  // Descend to Floor N + 1 from Inter-Floor Gear Shop
  const handleContinueNextFloor = () => {
    if (!run) return;
    if (run.floor.floorNumber >= MAX_FLOOR) {
      triggerVictory(run, `Cleared all ${MAX_FLOOR} dungeon floors!`);
      return;
    }

    const nextFloorNum = run.floor.floorNumber + 1;
    const floorBonus = 150 * run.floor.floorNumber;

    const { floor: generatedFloor, spawnPos } = generateDungeonFloor(nextFloorNum);
    const updatedFloor = computeFogOfWar(
      generatedFloor,
      spawnPos.x,
      spawnPos.y,
      run.hero.visionRadius
    );

    sound.playStairs();
    setRun({
      ...run,
      hero: {
        ...run.hero,
        x: spawnPos.x,
        y: spawnPos.y,
        score: run.hero.score + floorBonus,
      },
      floor: updatedFloor,
      logs: appendLog(
        run.logs,
        run.turn,
        nextFloorNum === MAX_FLOOR
          ? `Entered Floor ${nextFloorNum} (Final Floor). Defeat the Zenexis Overlord!`
          : `Descended to Floor ${nextFloorNum} (+${floorBonus} Score Bonus).`,
        nextFloorNum === MAX_FLOOR ? 'violet' : 'amber'
      ),
    });
    setFloorTransitionOpen(false);
  };

  const quickHealItem = useMemo(
    () => run?.inventory.find((i) => i.id === 'med_vial' && i.quantity > 0) ?? null,
    [run]
  );

  const quickShieldItem = useMemo(
    () => run?.inventory.find((i) => i.id === 'aegis_cell' && i.quantity > 0) ?? null,
    [run]
  );

  const dismissControlsTip = () => {
    setControlsTipDismissed(true);
    saveControlsTipDismissed(true);
  };

  if (screen === 'TITLE') {
    return (
      <>
        <TitleScreen
          playerName={playerName}
          onChangePlayerName={handlePlayerNameChange}
          selectedClass={selectedClass}
          onSelectClass={setSelectedClass}
          onStartNewRun={startNewRun}
          savedRun={savedRun}
          onContinueRun={continueSavedRun}
          career={career}
          onClearRecords={() => setCareer(clearCareerRecords())}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          onOpenHelp={() => setHelpOpen(true)}
          onOpenBuilder={() => setScreen('BUILDER')}
        />
        {helpOpen && <HowToPlayModal onClose={() => setHelpOpen(false)} />}
      </>
    );
  }

  if (screen === 'BUILDER') {
    return (
      <LevelBuilderModal
        initialMap={customMapDraft}
        heroClassId={selectedClass}
        onPlayMap={handleStartCustomMapRun}
        onClose={() => setScreen('TITLE')}
      />
    );
  }

  if (screen === 'GAME_OVER' && gameOverSummary) {
    return (
      <GameOverScreen
        runSummary={gameOverSummary.entry}
        isNewBest={gameOverSummary.isNewBest}
        career={career}
        onPlayAgain={() => {
          if (run?.isCustomMap && customMapDraft) {
            handleStartCustomMapRun(customMapDraft);
          } else {
            startNewRun(gameOverSummary.entry.classId);
          }
        }}
        onReturnTitle={() => setScreen('TITLE')}
      />
    );
  }

  if (screen === 'VICTORY' && gameOverSummary) {
    return (
      <VictoryScreen
        runSummary={gameOverSummary.entry}
        isNewBest={gameOverSummary.isNewBest}
        career={career}
        onPlayAgain={() => {
          if (run?.isCustomMap && customMapDraft) {
            handleStartCustomMapRun(customMapDraft);
          } else {
            startNewRun(gameOverSummary.entry.classId);
          }
        }}
        onReturnTitle={() => setScreen('TITLE')}
      />
    );
  }

  if (!run) return null;

  const isCriticalHp = run.hero.hp / run.hero.maxHp <= 0.25;
  const standingOnStairs =
    run.floor.tiles[run.hero.y]?.[run.hero.x] === 'STAIRS';
  const stairsDiscovered =
    run.floor.explored[run.floor.stairsPos.y]?.[run.floor.stairsPos.x] ?? false;

  return (
    <div className="min-h-screen bg-[#090D16] text-[#dae2fd] flex flex-col relative">
      {/* Critical HP Crimson Pulse Vignette */}
      {isCriticalHp && (
        <div
          className="pointer-events-none fixed inset-0 z-30 shadow-[inset_0_0_90px_rgba(239,68,68,0.45)] animate-critical-vignette"
          aria-hidden="true"
        />
      )}

      {/* Top Safe Telemetry HUD */}
      <header className="sticky top-0 z-20 w-full bg-[#0f172a]/85 backdrop-blur-md border-b border-[#f59e0b]/20">
        <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Brand + Floor / Turn */}
          <div className="flex items-center gap-4 min-w-0">
            <span className="font-display text-lg font-bold text-[#ffc174] whitespace-nowrap shrink-0">
              Rogue Byte
            </span>
            <div className="flex items-center gap-2 text-xs font-mono text-[#a08e7a] tabular-nums">
              <span className="text-[#4cd7f6] font-semibold">
                {run.isCustomMap ? (run.customMapName || 'Custom Crypt') : `Floor ${run.floor.floorNumber}/${MAX_FLOOR}`}
              </span>
              <span aria-hidden="true">·</span>
              <span>Turn {run.turn}</span>
              <span className="hidden sm:inline" aria-hidden="true">·</span>
              <span className="hidden sm:inline text-[#ffc174]">
                {run.hero.gold} Gold
              </span>
              <span className="hidden md:inline" aria-hidden="true">·</span>
              <span className="hidden md:inline text-[#dae2fd]">
                Score {run.hero.score.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Center: HP & Shield Meters */}
          <div className="flex items-center gap-4 flex-1 max-w-xs min-w-[170px]">
            <SegmentedBar
              current={run.hero.hp}
              max={run.hero.maxHp}
              color="crimson"
              label={run.hero.shield > 0 ? `HP · +${run.hero.shield} SHD` : 'HP'}
              className="w-full"
            />
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setInventoryOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[4px] bg-[#06b6d4]/15 border border-[#06b6d4]/70 text-[#4cd7f6] text-xs font-mono font-semibold hover:bg-[#06b6d4]/25 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Backpack className="w-3.5 h-3.5" />
              <span>Pack ({run.inventory.reduce((s, i) => s + i.quantity, 0)})</span>
            </button>

            <button
              type="button"
              onClick={() => setScreen('BUILDER')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[4px] bg-[#f59e0b]/15 border border-[#f59e0b]/60 text-[#ffc174] text-xs font-mono font-semibold hover:bg-[#f59e0b]/25 transition-colors whitespace-nowrap cursor-pointer"
              title="Open Custom Level Builder"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Builder</span>
            </button>

            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[4px] bg-[#131b2e] border border-[#f59e0b]/45 text-[#ffc174] text-xs font-mono font-semibold hover:bg-[#1e293b] transition-colors whitespace-nowrap cursor-pointer"
              title="Open How to Play guide (H)"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">How to Play</span>
              <span className="sm:hidden">Help</span>
            </button>

            <button
              type="button"
              onClick={toggleSound}
              className="p-2 rounded-[4px] bg-[#060e20] border border-white/10 text-[#a08e7a] hover:text-[#dae2fd] transition-colors cursor-pointer"
              aria-label={soundEnabled ? 'Mute audio' : 'Enable audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#f59e0b]" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setScreen('TITLE')}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-[4px] bg-[#060e20] border border-white/10 text-xs font-mono text-[#a08e7a] hover:text-[#dae2fd] hover:border-white/25 transition-colors whitespace-nowrap cursor-pointer"
              title="Save and return to main menu"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Playfield */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Center Dungeon Grid */}
        <section className="lg:col-span-8 flex flex-col gap-3">
          {/* Mobile quick Gold/Score strip */}
          <div className="flex sm:hidden items-center justify-between px-3 py-2 rounded-[4px] bg-[#131b2e] border border-white/10 text-xs font-mono tabular-nums">
            <span className="inline-flex items-center gap-1.5 text-[#ffc174]">
              <Coins className="w-3.5 h-3.5" />
              <span>{run.hero.gold} Gold</span>
            </span>
            <span className="text-[#dae2fd]">Score {run.hero.score.toLocaleString()}</span>
            <span className="text-[#a08e7a]">
              ATK {run.hero.atk} · DEF {run.hero.def}
            </span>
          </div>

          {/* First-Floor Dismissible Controls Tooltip for First-Time Players */}
          {run.floor.floorNumber === 1 && !controlsTipDismissed && (
            <div
              className="rounded-[4px] bg-[#131b2e]/95 border border-[#06b6d4]/55 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs shadow-[0_4px_16px_rgba(6,182,212,0.12)]"
              role="region"
              aria-label="Controls quick guide"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[#dae2fd]">
                <span className="font-display font-semibold text-[#4cd7f6]">
                  Quick Controls:
                </span>
                <span className="font-mono text-[11px] text-[#d8c3ad]">
                  Use <strong className="text-[#ffc174]">WASD / Arrows</strong> or tap tiles to move · Bump enemies to fight · <strong className="text-[#ffc174]">Space</strong> wait · <strong className="text-[#ffc174]">Enter</strong> confirm
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setHelpOpen(true)}
                  className="px-2.5 py-1 rounded-[4px] bg-[#06b6d4]/15 border border-[#06b6d4]/60 text-[11px] font-mono font-semibold text-[#4cd7f6] hover:bg-[#06b6d4]/25 transition-colors cursor-pointer"
                >
                  Full Guide
                </button>
                <button
                  type="button"
                  onClick={dismissControlsTip}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#060e20] border border-white/15 text-[11px] font-mono text-[#a08e7a] hover:text-[#dae2fd] hover:border-white/30 transition-colors cursor-pointer"
                  aria-label="Dismiss controls tip"
                >
                  <span>Got it</span>
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Stairs Action Banner when standing on stairs */}
          {standingOnStairs && (
            <div className="rounded-[4px] bg-[#1e1b4b]/80 border border-[#f59e0b] px-4 py-2.5 flex items-center justify-between gap-3">
              <span className="text-xs sm:text-sm font-display font-semibold text-[#ffc174]">
                {run.isCustomMap
                  ? `Exit stairs reached in custom crypt "${run.customMapName || 'Custom Level'}".`
                  : `Stairs to Floor ${run.floor.floorNumber + 1} located beneath your feet.`}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (run.isCustomMap) {
                    triggerVictory(
                      run,
                      `Successfully cleared custom crypt "${run.customMapName || 'Custom Level'}"!`
                    );
                  } else {
                    setFloorTransitionOpen(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-gradient-to-b from-[#f59e0b] to-[#d97706] text-[#090d16] font-display text-xs font-bold uppercase whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>{run.isCustomMap ? 'Complete Crypt (Enter)' : 'Descend (Enter)'}</span>
              </button>
            </div>
          )}

          <DungeonCanvas
            floor={run.floor}
            hero={run.hero}
            popups={popups}
            lastStep={heroStep}
            onTileClick={handleTileClick}
          />

          {/* Compact Grid Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] font-mono text-[#a08e7a]">
            <div className="flex flex-wrap items-center gap-3">
              <span>Tap adjacent tile or use WASD/Arrows to move</span>
              <span aria-hidden="true">·</span>
              <span>Bump enemies to fight</span>
            </div>
            <div>
              {run.floor.floorNumber >= MAX_FLOOR ? (
                <span className="text-[#d5c3ff]">Final Floor · Defeat Zenexis Overlord</span>
              ) : stairsDiscovered ? (
                <span className="text-[#ffc174]">Stairs Discovered</span>
              ) : (
                <span>Stairs Unlocated</span>
              )}
            </div>
          </div>
        </section>

        {/* Right / Bottom Control & Telemetry Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          {/* Tactile Control Deck */}
          <div className="rounded-lg bg-[#0f172a]/90 border border-white/10 p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold text-[#dae2fd]">
                Tactical Controls
              </h2>
              <span className="text-xs font-mono text-[#a08e7a] tabular-nums">
                ATK {run.hero.atk} · DEF {run.hero.def} · Kills {run.enemiesDefeated}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              {/* Virtual Tactile D-Pad */}
              <div className="grid grid-cols-3 gap-1.5 w-[144px] shrink-0">
                <div />
                <button
                  type="button"
                  onClick={() => performExplorationStep(0, -1)}
                  className="h-11 rounded-[4px] bg-[#131b2e] border border-[#f59e0b]/35 text-[#ffc174] hover:bg-[#1e293b] active:scale-95 flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Move North"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <div />

                <button
                  type="button"
                  onClick={() => performExplorationStep(-1, 0)}
                  className="h-11 rounded-[4px] bg-[#131b2e] border border-[#f59e0b]/35 text-[#ffc174] hover:bg-[#1e293b] active:scale-95 flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Move West"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => performExplorationStep(0, 0)}
                  className="h-11 rounded-[4px] bg-[#060e20] border border-white/15 text-[#a08e7a] hover:text-[#dae2fd] active:scale-95 flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Wait one turn"
                  title="Wait 1 turn (Space)"
                >
                  <Clock className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => performExplorationStep(1, 0)}
                  className="h-11 rounded-[4px] bg-[#131b2e] border border-[#f59e0b]/35 text-[#ffc174] hover:bg-[#1e293b] active:scale-95 flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Move East"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div />
                <button
                  type="button"
                  onClick={() => performExplorationStep(0, 1)}
                  className="h-11 rounded-[4px] bg-[#131b2e] border border-[#f59e0b]/35 text-[#ffc174] hover:bg-[#1e293b] active:scale-95 flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Move South"
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
                <div />
              </div>

              {/* Quick Consumables & Gear Status */}
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <button
                  type="button"
                  disabled={!quickHealItem || run.hero.hp >= run.hero.maxHp}
                  onClick={() => handleUseExplorationItem('med_vial')}
                  className="w-full px-3 py-2.5 rounded-[4px] bg-[#10b981]/10 border border-[#10b981]/50 text-left flex items-center justify-between gap-2 hover:bg-[#10b981]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ItemIcon id="med_vial" className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-display font-semibold text-[#6ee7b7] truncate">
                      Med Vial
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#dae2fd] tabular-nums">
                    x{quickHealItem?.quantity ?? 0}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={!quickShieldItem}
                  onClick={() => handleUseExplorationItem('aegis_cell')}
                  className="w-full px-3 py-2.5 rounded-[4px] bg-[#06b6d4]/10 border border-[#06b6d4]/50 text-left flex items-center justify-between gap-2 hover:bg-[#06b6d4]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ItemIcon id="aegis_cell" className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-display font-semibold text-[#4cd7f6] truncate">
                      Shield Cell
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#dae2fd] tabular-nums">
                    x{quickShieldItem?.quantity ?? 0}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setInventoryOpen(true)}
                  className="w-full px-3 py-2 rounded-[4px] bg-[#131b2e] border border-white/10 text-xs font-mono text-[#ffc174] hover:border-[#f59e0b]/50 transition-colors text-center cursor-pointer"
                >
                  Open Forge & Pack (I)
                </button>
              </div>
            </div>

            {/* Active Gear Summary */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#a08e7a]">
              <span className="inline-flex items-center gap-1.5 truncate">
                <Sword className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
                <span className="truncate">{run.hero.weaponName} +{run.hero.weaponLevel}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 truncate">
                <Shield className="w-3.5 h-3.5 text-[#06b6d4] shrink-0" />
                <span className="truncate">{run.hero.armorName} +{run.hero.armorLevel}</span>
              </span>
            </div>
          </div>

          {/* Terminal Event Log */}
          <div className="rounded-lg bg-[#0f172a]/90 border border-white/10 p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold text-[#dae2fd]">
                Exploration Log
              </h2>
              <span className="text-xs font-mono text-[#a08e7a] tabular-nums">
                {run.floor.enemies.length} Hostiles Left
              </span>
            </div>
            <div className="rounded-[4px] bg-[#060e20] border border-[#222a3d] p-3 max-h-56 overflow-y-auto flex flex-col gap-1.5 text-xs font-mono">
              {run.logs.map((entry) => {
                const colorClass =
                  entry.tone === 'amber'
                    ? 'text-[#ffc174]'
                    : entry.tone === 'cyan'
                    ? 'text-[#4cd7f6]'
                    : entry.tone === 'emerald'
                    ? 'text-[#6ee7b7]'
                    : entry.tone === 'crimson'
                    ? 'text-[#ffb4ab]'
                    : entry.tone === 'violet'
                    ? 'text-[#d5c3ff]'
                    : 'text-[#a08e7a]';
                return (
                  <div key={entry.id} className={`${colorClass} leading-snug`}>
                    <span className="text-[#534434] mr-1.5">&gt;</span>
                    {entry.text}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </main>

      {/* Turn-Based Combat Modal */}
      {combat && (
        <CombatModal
          combat={combat}
          hero={run.hero}
          inventory={run.inventory}
          onAttack={handleCombatAttack}
          onDefend={handleCombatDefend}
          onUseItem={handleCombatUseItem}
          onFlee={handleCombatFlee}
          onVictoryContinue={handleVictoryContinue}
        />
      )}

      {/* Inventory / Forge / Bestiary Modal */}
      {inventoryOpen && (
        <InventoryModal
          hero={run.hero}
          inventory={run.inventory}
          encounteredArchetypes={run.encounteredArchetypes}
          onClose={() => setInventoryOpen(false)}
          onUseItem={handleUseExplorationItem}
          onBuyItem={handleBuyItem}
          onUpgradeWeapon={handleUpgradeWeapon}
          onUpgradeArmor={handleUpgradeArmor}
        />
      )}

      {/* Inter-Floor Gear Shop Modal */}
      {floorTransitionOpen && (
        <FloorTransitionModal
          currentFloor={run.floor.floorNumber}
          hero={run.hero}
          inventory={run.inventory}
          purchasedShopIds={run.purchasedShopIds ?? []}
          scoreBonus={150 * run.floor.floorNumber}
          onBuyMerchantItem={handleBuyMerchantItem}
          onContinueNextFloor={handleContinueNextFloor}
          onStay={() => setFloorTransitionOpen(false)}
        />
      )}

      {/* How to Play Guide Modal */}
      {helpOpen && <HowToPlayModal onClose={() => setHelpOpen(false)} />}
    </div>
  );
}
