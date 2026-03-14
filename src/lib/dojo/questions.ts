import type { DojoQuestion, DojoTool, DojoLevel } from "@/types/dojo";
import tmuxQuestions from "@/data/dojo/tmux-questions.json";
import nvimQuestions from "@/data/dojo/nvim-questions.json";
import { QUESTIONS_PER_GAME } from "./constants";

const allQuestions: DojoQuestion[] = [
  ...(tmuxQuestions as DojoQuestion[]),
  ...(nvimQuestions as DojoQuestion[]),
];

export function getQuestions(tool: DojoTool, level: DojoLevel): DojoQuestion[] {
  return allQuestions.filter((q) => q.tool === tool && q.level === level);
}

export function shuffleAndPick(
  questions: DojoQuestion[],
  count: number = QUESTIONS_PER_GAME
): DojoQuestion[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function loadGameQuestions(
  tool: DojoTool,
  level: DojoLevel
): DojoQuestion[] {
  const pool = getQuestions(tool, level);
  return shuffleAndPick(pool);
}
