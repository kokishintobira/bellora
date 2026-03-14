import type { DojoQuestion } from "@/types/dojo";

/** Normalize an answer for comparison */
function normalize(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/** Normalize tmux-specific key notation */
function normalizeTmuxKeys(input: string): string {
  return normalize(input)
    .replace(/ctrl[\-\+]b/g, "ctrl-b")
    .replace(/c-b/g, "ctrl-b")
    .replace(/prefix/g, "ctrl-b");
}

/** Normalize nvim-specific input */
function normalizeNvimInput(input: string): string {
  let n = normalize(input);
  // Strip leading colon for command matching
  if (n.startsWith(":")) {
    n = n.slice(1);
  }
  // Normalize ctrl notation
  n = n
    .replace(/ctrl[\-\+](\w)/g, "ctrl-$1")
    .replace(/c-(\w)/g, "ctrl-$1")
    .replace(/<c-(\w)>/g, "ctrl-$1")
    .replace(/<esc>/g, "esc");
  return n;
}

/** Check if user answer matches any accepted answer */
export function checkAnswer(
  question: DojoQuestion,
  userAnswer: string
): { isCorrect: boolean; isOptimal: boolean } {
  const isTmux = question.tool === "tmux";

  const normalizeAnswer = isTmux ? normalizeTmuxKeys : normalizeNvimInput;
  const normalizedUser = normalizeAnswer(userAnswer);

  const isCorrect = question.answers.some(
    (a) => normalizeAnswer(a) === normalizedUser
  );

  const isOptimal = normalizeAnswer(question.optimal) === normalizedUser;

  return { isCorrect, isOptimal };
}

/** Calculate score as percentage */
export function calculateScore(
  correct: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}
