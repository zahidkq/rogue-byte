import { ActiveRunState, CareerRecords, HighScoreEntry } from '../types/game';

const ACTIVE_RUN_KEY = 'rogue_byte_active_run_v1';
const CAREER_KEY = 'rogue_byte_career_v1';
const PLAYER_NAME_KEY = 'rogue_byte_player_name_v1';
const CONTROLS_TIP_DISMISSED_KEY = 'rogue_byte_controls_tip_dismissed_v1';

const DEFAULT_CAREER: CareerRecords = {
  bestScore: 0,
  deepestFloor: 0,
  totalRuns: 0,
  totalVictories: 0,
  totalKills: 0,
  totalGold: 0,
  leaderboard: [],
};

export function loadControlsTipDismissed(): boolean {
  try {
    return localStorage.getItem(CONTROLS_TIP_DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
}

export function saveControlsTipDismissed(dismissed: boolean): void {
  try {
    localStorage.setItem(CONTROLS_TIP_DISMISSED_KEY, dismissed ? '1' : '0');
  } catch {
    // ignore storage errors
  }
}

export function loadPlayerName(): string {
  try {
    const saved = localStorage.getItem(PLAYER_NAME_KEY);
    return saved && saved.trim().length > 0 ? saved.trim() : 'Runner-01';
  } catch {
    return 'Runner-01';
  }
}

export function savePlayerName(name: string): void {
  try {
    localStorage.setItem(PLAYER_NAME_KEY, name.trim() || 'Runner-01');
  } catch {
    // ignore storage errors
  }
}

export function saveActiveRun(run: ActiveRunState): void {
  try {
    localStorage.setItem(ACTIVE_RUN_KEY, JSON.stringify(run));
  } catch {
    // ignore storage errors
  }
}

export function loadActiveRun(): ActiveRunState | null {
  try {
    const raw = localStorage.getItem(ACTIVE_RUN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveRunState;
    if (!parsed || !parsed.hero || !parsed.floor || !parsed.floor.tiles) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearActiveRun(): void {
  try {
    localStorage.removeItem(ACTIVE_RUN_KEY);
  } catch {
    // ignore
  }
}

export function loadCareerRecords(): CareerRecords {
  try {
    const raw = localStorage.getItem(CAREER_KEY);
    if (!raw) return { ...DEFAULT_CAREER };
    const parsed = JSON.parse(raw) as CareerRecords;
    return {
      ...DEFAULT_CAREER,
      ...parsed,
      totalVictories: parsed.totalVictories ?? 0,
      leaderboard: Array.isArray(parsed.leaderboard) ? parsed.leaderboard : [],
    };
  } catch {
    return { ...DEFAULT_CAREER };
  }
}

export function recordFinishedRun(entry: HighScoreEntry): {
  records: CareerRecords;
  isNewBest: boolean;
} {
  const prev = loadCareerRecords();
  const isNewBest = entry.score > prev.bestScore;
  const updatedLeaderboard = [...prev.leaderboard, entry]
    .sort((a, b) => b.score - a.score || b.floor - a.floor || b.enemiesDefeated - a.enemiesDefeated)
    .slice(0, 10);

  const records: CareerRecords = {
    bestScore: Math.max(prev.bestScore, entry.score),
    deepestFloor: Math.max(prev.deepestFloor, entry.floor),
    totalRuns: prev.totalRuns + 1,
    totalVictories: (prev.totalVictories ?? 0) + (entry.victory ? 1 : 0),
    totalKills: prev.totalKills + entry.enemiesDefeated,
    totalGold: prev.totalGold + entry.gold,
    leaderboard: updatedLeaderboard,
  };

  try {
    localStorage.setItem(CAREER_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }

  return { records, isNewBest };
}

export function clearCareerRecords(): CareerRecords {
  try {
    localStorage.removeItem(CAREER_KEY);
  } catch {
    // ignore
  }
  return { ...DEFAULT_CAREER };
}
