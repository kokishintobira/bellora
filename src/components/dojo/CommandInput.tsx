"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { DojoTool } from "@/types/dojo";

interface CommandInputProps {
  tool: DojoTool;
  onSubmit: (answer: string) => void;
  disabled?: boolean;
}

export function CommandInput({ tool, onSubmit, disabled }: CommandInputProps) {
  const [mode, setMode] = useState<"text" | "combo">("text");
  const [textValue, setTextValue] = useState("");
  const [comboKeys, setComboKeys] = useState<string[]>([]);
  const [awaitingNext, setAwaitingNext] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);

  const activeRef = mode === "combo" ? hiddenRef : inputRef;

  // Focus on mount and mode change
  useEffect(() => {
    activeRef.current?.focus();
  }, [mode, activeRef]);

  // Auto-submit: show combo badges briefly, then submit
  useEffect(() => {
    if (!pendingSubmit) return;
    const timer = setTimeout(() => {
      onSubmit(pendingSubmit);
      setPendingSubmit(null);
    }, 250);
    return () => clearTimeout(timer);
  }, [pendingSubmit, onSubmit]);

  const reset = useCallback(() => {
    setMode("text");
    setTextValue("");
    setComboKeys([]);
    setAwaitingNext(false);
  }, []);

  const submit = useCallback(() => {
    if (pendingSubmit) return; // already auto-submitting
    const answer = mode === "combo" ? comboKeys.join(" ") : textValue;
    if (!answer.trim()) return;
    onSubmit(answer);
    reset();
  }, [mode, comboKeys, textValue, onSubmit, reset, pendingSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled || pendingSubmit) return;

      // Submit on Enter (unless awaiting next key)
      if (e.key === "Enter" && !awaitingNext) {
        e.preventDefault();
        submit();
        return;
      }

      // Ignore modifier-only presses
      if (["Control", "Shift", "Alt", "Meta"].includes(e.key)) return;

      // Escape → auto-submit
      if (e.key === "Escape") {
        e.preventDefault();
        setMode("combo");
        setComboKeys(["Esc"]);
        setTextValue("");
        setAwaitingNext(false);
        setPendingSubmit("Esc");
        return;
      }

      // Ctrl + key → capture combo
      if (e.ctrlKey) {
        e.preventDefault();
        const key = e.key.length === 1 ? e.key : e.key;
        const combo = `Ctrl-${key}`;
        setMode("combo");
        setComboKeys([combo]);
        setTextValue("");
        if (tool === "tmux" && key.toLowerCase() === "b") {
          // tmux: wait for next key
          setAwaitingNext(true);
        } else {
          // nvim Ctrl combos: auto-submit
          setAwaitingNext(false);
          setPendingSubmit(combo);
        }
        return;
      }

      // Awaiting next key after tmux prefix (Ctrl-b → ?)
      if (awaitingNext) {
        e.preventDefault();
        const key =
          e.key === " "
            ? "Space"
            : e.key === '"'
              ? '"'
              : e.key;
        const finalCombo = [...comboKeys, key].join(" ");
        setComboKeys((prev) => [...prev, key]);
        setAwaitingNext(false);
        setPendingSubmit(finalCombo);
        return;
      }

      // Backspace in combo mode → reset to text
      if (e.key === "Backspace" && mode === "combo") {
        e.preventDefault();
        reset();
        return;
      }

      // Regular key in combo mode → switch back to text mode
      if (mode === "combo" && e.key.length === 1) {
        e.preventDefault();
        setMode("text");
        setComboKeys([]);
        setTextValue(e.key);
        return;
      }
    },
    [disabled, awaitingNext, mode, tool, submit, reset, comboKeys, pendingSubmit]
  );

  return (
    <div className="flex gap-2">
      <div className="flex-1 flex items-center gap-2">
        <span className="text-[var(--color-primary)] font-bold shrink-0">
          $
        </span>
        <div
          className="relative flex-1"
          onClick={() => activeRef.current?.focus()}
        >
          {mode === "combo" ? (
            <>
              <div className="flex items-center gap-1 px-3 py-2 border border-[var(--color-border)] min-h-[38px] bg-[var(--color-background)]">
                {comboKeys.map((k, i) => (
                  <kbd
                    key={i}
                    className="bg-[var(--color-primary)] text-[var(--color-background)] px-2 py-0.5 rounded text-sm font-bold"
                  >
                    {k}
                  </kbd>
                ))}
                {awaitingNext && (
                  <span className="cursor-blink text-[var(--color-primary)] ml-1">
                    ▋
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    reset();
                  }}
                  className="ml-auto text-xs text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] cursor-pointer"
                >
                  ✕
                </button>
              </div>
              {/* Hidden input to keep capturing keydown events */}
              <input
                ref={hiddenRef}
                type="text"
                className="sr-only"
                onKeyDown={handleKeyDown}
                aria-label="Key capture"
                tabIndex={0}
              />
            </>
          ) : (
            <input
              ref={inputRef}
              type="text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              disabled={disabled}
              placeholder="コマンドを入力 or キーを押す..."
              className="w-full px-3 py-2 text-sm"
            />
          )}
        </div>
      </div>
      <button
        onClick={submit}
        disabled={
          disabled || (mode === "text" ? !textValue.trim() : comboKeys.length === 0) || awaitingNext
        }
        className="btn-primary text-sm"
      >
        Enter
      </button>
    </div>
  );
}
