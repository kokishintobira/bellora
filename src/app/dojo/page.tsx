"use client";

import { useState, useEffect } from "react";
import type { DojoTool, DojoLevel, DojoStats } from "@/types/dojo";
import { loadStats, isLevelUnlocked, getLevelStats } from "@/lib/dojo/storage";
import {
  TOOL_LABELS,
  LEVEL_LABELS,
  LEVEL_DESCRIPTIONS,
} from "@/lib/dojo/constants";
import { useRouter } from "next/navigation";

const TOOLS: DojoTool[] = ["tmux", "nvim"];
const LEVELS: DojoLevel[] = [1, 2, 3];

export default function DojoHome() {
  const router = useRouter();
  const [selectedTool, setSelectedTool] = useState<DojoTool>("tmux");
  const [stats, setStats] = useState<DojoStats | null>(null);

  useEffect(() => {
    setStats(loadStats());
  }, []);

  function handleStart(level: DojoLevel) {
    router.push(`/dojo/play?tool=${selectedTool}&level=${level}`);
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center py-6">
        <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-2">
          Command Dojo
        </h1>
        <p className="text-[var(--color-foreground-muted)]">
          tmux / Neovim のコマンドを反復練習して記憶を定着させよう
        </p>
      </section>

      {/* Tool Selector */}
      <section>
        <h2 className="text-sm text-[var(--color-foreground-muted)] mb-3 uppercase tracking-wider">
          ツールを選択
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {TOOLS.map((tool) => (
            <button
              key={tool}
              onClick={() => setSelectedTool(tool)}
              className={`card text-center py-4 cursor-pointer transition-all ${
                selectedTool === tool
                  ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "hover:border-[var(--color-foreground-muted)]"
              }`}
            >
              <div className="text-2xl mb-1">
                {tool === "tmux" ? "🖥" : "📝"}
              </div>
              <div className="font-bold">{TOOL_LABELS[tool]}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Level Selector */}
      <section>
        <h2 className="text-sm text-[var(--color-foreground-muted)] mb-3 uppercase tracking-wider">
          レベルを選択
        </h2>
        <div className="space-y-3">
          {LEVELS.map((level) => {
            const unlocked = stats
              ? isLevelUnlocked(stats, selectedTool, level)
              : level === 1;
            const levelStats = stats
              ? getLevelStats(stats, selectedTool, level)
              : null;

            return (
              <button
                key={level}
                onClick={() => handleStart(level)}
                disabled={!unlocked}
                className={`card w-full text-left flex items-center justify-between transition-all ${
                  unlocked
                    ? "cursor-pointer hover:border-[var(--color-primary)]"
                    : "level-locked"
                }`}
              >
                <div>
                  <div className="font-bold flex items-center gap-2">
                    {!unlocked && <span>🔒</span>}
                    <span>
                      Lv.{level} — {LEVEL_LABELS[level]}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--color-foreground-muted)] mt-1">
                    {LEVEL_DESCRIPTIONS[level]}
                  </div>
                </div>
                {levelStats && levelStats.attempts > 0 && (
                  <div className="text-right text-xs">
                    <div className="text-[var(--color-accent)]">
                      Best: {levelStats.bestScore}%
                    </div>
                    <div className="text-[var(--color-foreground-muted)]">
                      {levelStats.attempts} 回挑戦
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {stats && (
          <p className="text-xs text-[var(--color-foreground-muted)] mt-2">
            ※ 次のレベルは正答率70%以上でアンロック
          </p>
        )}
      </section>

      {/* Stats Overview */}
      {stats && <StatsOverview stats={stats} />}
    </div>
  );
}

function StatsOverview({ stats }: { stats: DojoStats }) {
  const tools: DojoTool[] = ["tmux", "nvim"];
  const hasAny = tools.some((t) =>
    Object.values(stats[t]).some(
      (l) => l && typeof l === "object" && "attempts" in l && l.attempts > 0
    )
  );

  if (!hasAny) return null;

  return (
    <section>
      <h2 className="text-sm text-[var(--color-foreground-muted)] mb-3 uppercase tracking-wider">
        統計
      </h2>
      <div className="card">
        <div className="grid grid-cols-2 gap-4">
          {tools.map((tool) => (
            <div key={tool}>
              <div className="font-bold text-[var(--color-primary)] mb-2">
                {TOOL_LABELS[tool]}
              </div>
              {([1, 2, 3] as DojoLevel[]).map((level) => {
                const ls = getLevelStats(stats, tool, level);
                if (ls.attempts === 0) return null;
                return (
                  <div
                    key={level}
                    className="flex justify-between text-xs py-1"
                  >
                    <span>Lv.{level}</span>
                    <span className="text-[var(--color-accent)]">
                      {ls.bestScore}% ({ls.attempts}回)
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
