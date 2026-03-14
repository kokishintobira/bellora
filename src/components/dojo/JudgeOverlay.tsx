"use client";

import { useEffect, useState } from "react";

interface JudgeOverlayProps {
  isCorrect: boolean;
  isOptimal?: boolean;
  onDone: () => void;
}

export function JudgeOverlay({ isCorrect, isOptimal, onDone }: JudgeOverlayProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDone();
    }, 1200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center pointer-events-none transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-3 animate-[judgePopIn_0.3s_ease-out]">
        {isCorrect ? (
          <>
            <div
              className="w-28 h-28 rounded-full border-[6px] flex items-center justify-center text-6xl font-black"
              style={{
                borderColor: isOptimal ? "var(--color-accent)" : "var(--color-success)",
                color: isOptimal ? "var(--color-accent)" : "var(--color-success)",
                boxShadow: isOptimal
                  ? "0 0 40px rgba(255,176,0,0.4), 0 0 80px rgba(255,176,0,0.15)"
                  : "0 0 40px rgba(0,255,65,0.4), 0 0 80px rgba(0,255,65,0.15)",
              }}
            >
              ○
            </div>
            <div
              className="text-2xl font-black tracking-wider"
              style={{
                color: isOptimal ? "var(--color-accent)" : "var(--color-success)",
              }}
            >
              {isOptimal ? "最適解！" : "正解！"}
            </div>
          </>
        ) : (
          <>
            <div
              className="w-28 h-28 rounded-full border-[6px] flex items-center justify-center text-6xl font-black"
              style={{
                borderColor: "var(--color-error)",
                color: "var(--color-error)",
                boxShadow: "0 0 40px rgba(255,68,68,0.4), 0 0 80px rgba(255,68,68,0.15)",
              }}
            >
              ✕
            </div>
            <div className="text-2xl font-black tracking-wider text-[var(--color-error)]">
              不正解
            </div>
          </>
        )}
      </div>
    </div>
  );
}
