/* ───── Dojo Tool Types ───── */

export type DojoTool = "tmux" | "nvim";
export type DojoLevel = 1 | 2 | 3;

/* ───── Question ───── */

export interface DojoQuestion {
  id: string;
  tool: DojoTool;
  level: DojoLevel;
  prompt: string;
  hint?: string;
  answers: string[];
  optimal: string;
  explanation: string;
  category: string;
  scene?: string;
}

/* ───── Game State ───── */

export type GameStatus = "idle" | "playing" | "feedback" | "finished";

export interface AnswerResult {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  isOptimal: boolean;
  timeTaken: number; // ms
}

export interface GameState {
  status: GameStatus;
  tool: DojoTool;
  level: DojoLevel;
  questions: DojoQuestion[];
  currentIndex: number;
  answers: AnswerResult[];
  showHint: boolean;
  showCheatSheet: boolean;
  startTime: number;
  questionStartTime: number;
}

/* ───── Game Actions ───── */

export type GameAction =
  | { type: "START"; questions: DojoQuestion[]; tool: DojoTool; level: DojoLevel }
  | { type: "SUBMIT_ANSWER"; answer: string }
  | { type: "NEXT_QUESTION" }
  | { type: "TOGGLE_HINT" }
  | { type: "TOGGLE_CHEATSHEET" }
  | { type: "FINISH" };

/* ───── Session Result (sessionStorage) ───── */

export interface SessionResult {
  tool: DojoTool;
  level: DojoLevel;
  answers: AnswerResult[];
  totalTime: number;
  score: number;
  totalQuestions: number;
}

/* ───── Persistent Stats (localStorage) ───── */

export interface LevelStats {
  attempts: number;
  bestScore: number;
  bestTime: number;
  lastPlayed: string; // ISO date
}

export interface ToolStats {
  [level: number]: LevelStats;
}

export interface DojoStats {
  tmux: ToolStats;
  nvim: ToolStats;
}

/* ───── Cheat Sheet ───── */

export interface CheatSheetEntry {
  keys: string;
  description: string;
}

export interface CheatSheetSection {
  title: string;
  entries: CheatSheetEntry[];
}
