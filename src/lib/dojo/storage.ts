import type {
  DojoStats,
  DojoTool,
  DojoLevel,
  LevelStats,
  SessionResult,
} from "@/types/dojo";
import { STORAGE_KEY, SESSION_RESULT_KEY, UNLOCK_THRESHOLD } from "./constants";

const defaultLevelStats: LevelStats = {
  attempts: 0,
  bestScore: 0,
  bestTime: Infinity,
  lastPlayed: "",
};

const defaultStats: DojoStats = {
  tmux: {},
  nvim: {},
};

export function loadStats(): DojoStats {
  if (typeof window === "undefined") return defaultStats;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStats;
    return JSON.parse(raw) as DojoStats;
  } catch {
    return defaultStats;
  }
}

export function saveStats(stats: DojoStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function getLevelStats(
  stats: DojoStats,
  tool: DojoTool,
  level: DojoLevel
): LevelStats {
  return stats[tool][level] || { ...defaultLevelStats };
}

export function updateLevelStats(
  stats: DojoStats,
  tool: DojoTool,
  level: DojoLevel,
  score: number,
  time: number
): DojoStats {
  const current = getLevelStats(stats, tool, level);
  const updated: LevelStats = {
    attempts: current.attempts + 1,
    bestScore: Math.max(current.bestScore, score),
    bestTime:
      current.bestTime === Infinity
        ? time
        : Math.min(current.bestTime, time),
    lastPlayed: new Date().toISOString(),
  };
  return {
    ...stats,
    [tool]: {
      ...stats[tool],
      [level]: updated,
    },
  };
}

export function isLevelUnlocked(
  stats: DojoStats,
  tool: DojoTool,
  level: DojoLevel
): boolean {
  if (level === 1) return true;
  const prevLevel = (level - 1) as DojoLevel;
  const prevStats = getLevelStats(stats, tool, prevLevel);
  return prevStats.bestScore >= UNLOCK_THRESHOLD * 100;
}

/** Session result for passing data between play → result pages */
export function saveSessionResult(result: SessionResult): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_RESULT_KEY, JSON.stringify(result));
}

export function loadSessionResult(): SessionResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_RESULT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionResult;
  } catch {
    return null;
  }
}

export function clearSessionResult(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_RESULT_KEY);
}
