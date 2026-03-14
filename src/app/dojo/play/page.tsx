"use client";

import { useReducer, useEffect, useCallback, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { DojoTool, DojoLevel, SessionResult } from "@/types/dojo";
import { gameReducer, initialGameState } from "@/lib/dojo/game-reducer";
import { loadGameQuestions } from "@/lib/dojo/questions";
import { calculateScore } from "@/lib/dojo/scoring";
import { saveSessionResult } from "@/lib/dojo/storage";
import { TOOL_LABELS, LEVEL_LABELS } from "@/lib/dojo/constants";
import { CommandInput } from "@/components/dojo/CommandInput";
import { KeyboardDisplay } from "@/components/dojo/KeyboardDisplay";
import { TerminalPreview } from "@/components/dojo/TerminalPreview";
import { JudgeOverlay } from "@/components/dojo/JudgeOverlay";
import { CheatSheetPanel } from "@/components/dojo/CheatSheet";
import tmuxCheatsheet from "@/data/dojo/tmux-cheatsheet.json";
import nvimCheatsheet from "@/data/dojo/nvim-cheatsheet.json";
import type { CheatSheetSection } from "@/types/dojo";

function PlayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tool = (searchParams.get("tool") || "tmux") as DojoTool;
  const level = Number(searchParams.get("level") || "1") as DojoLevel;

  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [showJudge, setShowJudge] = useState(false);

  // Show judge overlay when entering feedback
  useEffect(() => {
    if (state.status === "feedback") {
      setShowJudge(true);
    }
  }, [state.status]);

  // Start game on mount
  useEffect(() => {
    const questions = loadGameQuestions(tool, level);
    if (questions.length === 0) {
      router.push("/dojo");
      return;
    }
    dispatch({ type: "START", questions, tool, level });
  }, [tool, level, router]);

  // Navigate to result when finished
  useEffect(() => {
    if (state.status === "finished") {
      const correctCount = state.answers.filter((a) => a.isCorrect).length;
      const totalTime = Date.now() - state.startTime;
      const score = calculateScore(correctCount, state.questions.length);

      const result: SessionResult = {
        tool: state.tool,
        level: state.level,
        answers: state.answers,
        totalTime,
        score,
        totalQuestions: state.questions.length,
      };
      saveSessionResult(result);
      router.push("/dojo/result");
    }
  }, [state.status, state.answers, state.startTime, state.questions, state.tool, state.level, router]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (state.status === "playing") {
        dispatch({ type: "SUBMIT_ANSWER", answer });
      }
    },
    [state.status]
  );

  const handleNext = useCallback(() => {
    dispatch({ type: "NEXT_QUESTION" });
  }, []);

  if (state.status === "idle") {
    return (
      <div className="text-center py-12 text-[var(--color-foreground-muted)]">
        Loading...
      </div>
    );
  }

  const question = state.questions[state.currentIndex];
  const currentAnswer = state.answers[state.answers.length - 1];
  const progress = ((state.currentIndex + (state.status === "feedback" ? 1 : 0)) / state.questions.length) * 100;
  const cheatsheetData = (tool === "tmux" ? tmuxCheatsheet : nvimCheatsheet) as CheatSheetSection[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="text-[var(--color-primary)]">
            {TOOL_LABELS[tool]}
          </span>
          <span className="text-[var(--color-foreground-muted)]">
            {" "}
            / Lv.{level} {LEVEL_LABELS[level]}
          </span>
        </div>
        <div className="text-sm text-[var(--color-foreground-muted)]">
          {state.currentIndex + 1} / {state.questions.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Terminal Preview */}
      {question?.scene && (
        <TerminalPreview
          scene={question.scene}
          phase={state.status === "feedback" ? "after" : "before"}
          isCorrect={currentAnswer?.isCorrect}
        />
      )}

      {/* Question */}
      {question && (
        <div className="card space-y-4">
          <div className="text-xs text-[var(--color-foreground-muted)] uppercase">
            {question.category}
          </div>
          <h2 className="text-lg font-bold">{question.prompt}</h2>

          {/* Hint */}
          {question.hint && state.status === "playing" && (
            <div>
              {state.showHint ? (
                <p className="text-sm text-[var(--color-accent)]">
                  💡 {question.hint}
                </p>
              ) : (
                <button
                  onClick={() => dispatch({ type: "TOGGLE_HINT" })}
                  className="text-xs text-[var(--color-foreground-muted)] hover:text-[var(--color-accent)] cursor-pointer"
                >
                  ヒントを表示
                </button>
              )}
            </div>
          )}

          {/* Input */}
          {state.status === "playing" && (
            <CommandInput
              key={state.currentIndex}
              tool={tool}
              onSubmit={handleAnswer}
            />
          )}

          {/* Feedback */}
          {state.status === "feedback" && currentAnswer && (
            <div className="space-y-3">
              <div
                className={`p-3 border ${
                  currentAnswer.isCorrect
                    ? "feedback-correct border-[var(--color-success)]"
                    : "feedback-incorrect border-[var(--color-error)]"
                }`}
              >
                <div className="font-bold text-sm">
                  {currentAnswer.isCorrect
                    ? currentAnswer.isOptimal
                      ? "✓ 最適解！"
                      : "✓ 正解！"
                    : "✗ 不正解"}
                </div>
                <div className="text-xs mt-1 text-[var(--color-foreground)]">
                  あなたの回答:{" "}
                  <code className="text-[var(--color-accent)]">
                    {currentAnswer.userAnswer}
                  </code>
                </div>
                {!currentAnswer.isOptimal && (
                  <div className="text-xs mt-1 feedback-optimal">
                    最適解:{" "}
                    <code className="font-bold">{question.optimal}</code>
                  </div>
                )}
              </div>
              <p className="text-sm text-[var(--color-foreground-muted)]">
                {question.explanation}
              </p>
              <button onClick={handleNext} className="btn-primary text-sm">
                {state.currentIndex + 1 < state.questions.length
                  ? "次の問題 →"
                  : "結果を見る →"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Visual Keyboard */}
      {state.status === "playing" && <KeyboardDisplay />}

      {/* Cheat Sheet Toggle */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => dispatch({ type: "TOGGLE_CHEATSHEET" })}
          className="btn-secondary rounded-full w-12 h-12 flex items-center justify-center text-lg"
          title="チートシート"
        >
          📋
        </button>
      </div>

      {/* Cheat Sheet */}
      {state.showCheatSheet && (
        <CheatSheetPanel
          sections={cheatsheetData}
          onClose={() => dispatch({ type: "TOGGLE_CHEATSHEET" })}
        />
      )}

      {/* Judge Overlay */}
      {showJudge && currentAnswer && (
        <JudgeOverlay
          isCorrect={currentAnswer.isCorrect}
          isOptimal={currentAnswer.isOptimal}
          onDone={() => setShowJudge(false)}
        />
      )}
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-12 text-[var(--color-foreground-muted)]">
          Loading...
        </div>
      }
    >
      <PlayContent />
    </Suspense>
  );
}
