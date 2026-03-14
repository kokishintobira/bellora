"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { DojoStats, SessionResult } from "@/types/dojo";
import {
  loadSessionResult,
  clearSessionResult,
  loadStats,
  saveStats,
  updateLevelStats,
} from "@/lib/dojo/storage";
import { TOOL_LABELS, LEVEL_LABELS } from "@/lib/dojo/constants";

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<SessionResult | null>(null);

  useEffect(() => {
    const r = loadSessionResult();
    if (!r) {
      router.push("/dojo");
      return;
    }
    setResult(r);

    // Persist stats
    const stats = loadStats();
    const updated = updateLevelStats(
      stats,
      r.tool,
      r.level,
      r.score,
      r.totalTime
    );
    saveStats(updated);

    return () => clearSessionResult();
  }, [router]);

  if (!result) {
    return (
      <div className="text-center py-12 text-[var(--color-foreground-muted)]">
        Loading...
      </div>
    );
  }

  const correctCount = result.answers.filter((a) => a.isCorrect).length;
  const optimalCount = result.answers.filter((a) => a.isOptimal).length;
  const totalSec = Math.round(result.totalTime / 1000);

  function getGrade(score: number): { label: string; color: string } {
    if (score >= 100) return { label: "S", color: "var(--color-accent)" };
    if (score >= 80) return { label: "A", color: "var(--color-primary)" };
    if (score >= 60) return { label: "B", color: "var(--color-foreground)" };
    if (score >= 40) return { label: "C", color: "var(--color-foreground-muted)" };
    return { label: "D", color: "var(--color-error)" };
  }

  const grade = getGrade(result.score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-sm text-[var(--color-foreground-muted)] mb-2">
          {TOOL_LABELS[result.tool]} / Lv.{result.level}{" "}
          {LEVEL_LABELS[result.level]}
        </div>
        <h1 className="text-xl font-bold mb-4">結果</h1>
      </div>

      {/* Score */}
      <div className="card text-center space-y-4">
        <div
          className="text-6xl font-bold"
          style={{ color: grade.color }}
        >
          {grade.label}
        </div>
        <div className="text-3xl font-bold text-[var(--color-primary)]">
          {result.score}%
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-[var(--color-foreground-muted)]">正解</div>
            <div className="font-bold">
              {correctCount}/{result.totalQuestions}
            </div>
          </div>
          <div>
            <div className="text-[var(--color-foreground-muted)]">最適解</div>
            <div className="font-bold text-[var(--color-accent)]">
              {optimalCount}
            </div>
          </div>
          <div>
            <div className="text-[var(--color-foreground-muted)]">時間</div>
            <div className="font-bold">{totalSec}s</div>
          </div>
        </div>
      </div>

      {/* Answer details */}
      <div className="card space-y-3">
        <h2 className="text-sm font-bold text-[var(--color-foreground-muted)] uppercase tracking-wider">
          回答詳細
        </h2>
        {result.answers.map((answer, i) => (
          <div
            key={answer.questionId}
            className={`flex items-start gap-3 py-2 ${
              i < result.answers.length - 1
                ? "border-b border-[var(--color-border)]"
                : ""
            }`}
          >
            <span
              className={`text-sm font-bold ${
                answer.isCorrect
                  ? "text-[var(--color-success)]"
                  : "text-[var(--color-error)]"
              }`}
            >
              {answer.isCorrect ? "✓" : "✗"}
            </span>
            <div className="flex-1 text-sm">
              <div>
                <code className="text-[var(--color-accent)]">
                  {answer.userAnswer}
                </code>
              </div>
              {answer.isOptimal && (
                <span className="text-xs text-[var(--color-accent)]">
                  最適解
                </span>
              )}
            </div>
            <div className="text-xs text-[var(--color-foreground-muted)]">
              {Math.round(answer.timeTaken / 1000)}s
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() =>
            router.push(
              `/dojo/play?tool=${result.tool}&level=${result.level}`
            )
          }
          className="btn-primary text-sm flex-1 text-center"
        >
          もう一度挑戦
        </button>
        <button
          onClick={() => router.push("/dojo")}
          className="btn-secondary text-sm flex-1 text-center"
        >
          ← ホームに戻る
        </button>
      </div>

      {/* Unlock notice */}
      {result.score >= 70 && result.level < 3 && (
        <div className="card text-center text-sm">
          <span className="text-[var(--color-accent)]">🔓</span> Lv.
          {result.level + 1} がアンロックされました！
        </div>
      )}
    </div>
  );
}
