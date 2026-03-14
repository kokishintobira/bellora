"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface KeyDef {
  label: string;
  code: string;
  width?: number; // relative width units (1 = normal key)
}

const ROWS: KeyDef[][] = [
  [
    { label: "Esc", code: "Escape", width: 1.5 },
    { label: "1", code: "Digit1" },
    { label: "2", code: "Digit2" },
    { label: "3", code: "Digit3" },
    { label: "4", code: "Digit4" },
    { label: "5", code: "Digit5" },
    { label: "6", code: "Digit6" },
    { label: "7", code: "Digit7" },
    { label: "8", code: "Digit8" },
    { label: "9", code: "Digit9" },
    { label: "0", code: "Digit0" },
    { label: "-", code: "Minus" },
    { label: "=", code: "Equal" },
    { label: "BS", code: "Backspace", width: 1.5 },
  ],
  [
    { label: "Tab", code: "Tab", width: 1.5 },
    { label: "Q", code: "KeyQ" },
    { label: "W", code: "KeyW" },
    { label: "E", code: "KeyE" },
    { label: "R", code: "KeyR" },
    { label: "T", code: "KeyT" },
    { label: "Y", code: "KeyY" },
    { label: "U", code: "KeyU" },
    { label: "I", code: "KeyI" },
    { label: "O", code: "KeyO" },
    { label: "P", code: "KeyP" },
    { label: "[", code: "BracketLeft" },
    { label: "]", code: "BracketRight" },
    { label: "\\", code: "Backslash", width: 1.5 },
  ],
  [
    { label: "Ctrl", code: "ControlLeft", width: 1.75 },
    { label: "A", code: "KeyA" },
    { label: "S", code: "KeyS" },
    { label: "D", code: "KeyD" },
    { label: "F", code: "KeyF" },
    { label: "G", code: "KeyG" },
    { label: "H", code: "KeyH" },
    { label: "J", code: "KeyJ" },
    { label: "K", code: "KeyK" },
    { label: "L", code: "KeyL" },
    { label: ";", code: "Semicolon" },
    { label: "'", code: "Quote" },
    { label: "Enter", code: "Enter", width: 2.25 },
  ],
  [
    { label: "Shift", code: "ShiftLeft", width: 2.25 },
    { label: "Z", code: "KeyZ" },
    { label: "X", code: "KeyX" },
    { label: "C", code: "KeyC" },
    { label: "V", code: "KeyV" },
    { label: "B", code: "KeyB" },
    { label: "N", code: "KeyN" },
    { label: "M", code: "KeyM" },
    { label: ",", code: "Comma" },
    { label: ".", code: "Period" },
    { label: "/", code: "Slash" },
    { label: "Shift", code: "ShiftRight", width: 2.75 },
  ],
  [
    { label: "Ctrl", code: "ControlRight", width: 1.5 },
    { label: "Alt", code: "AltLeft", width: 1.5 },
    { label: "Space", code: "Space", width: 7 },
    { label: "Alt", code: "AltRight", width: 1.5 },
    { label: "Ctrl", code: "ControlLeft2", width: 1.5 },
  ],
];

// Map e.code to all matching visual key codes
function matchCodes(code: string): string[] {
  const matches = [code];
  // Left/Right variants for modifiers
  if (code === "ControlLeft" || code === "ControlRight") {
    matches.push("ControlLeft", "ControlRight", "ControlLeft2");
  }
  if (code === "ShiftLeft" || code === "ShiftRight") {
    matches.push("ShiftLeft", "ShiftRight");
  }
  if (code === "AltLeft" || code === "AltRight") {
    matches.push("AltLeft", "AltRight");
  }
  return matches;
}

const LINGER_MS = 400;

export function KeyboardDisplay() {
  const [pressed, setPressed] = useState<Set<string>>(new Set());
  const [recent, setRecent] = useState<Set<string>>(new Set());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const codes = matchCodes(e.code);
    // Cancel any pending fade-out for these keys
    codes.forEach((c) => {
      const t = timersRef.current.get(c);
      if (t) { clearTimeout(t); timersRef.current.delete(c); }
    });
    setPressed((prev) => {
      const next = new Set(prev);
      codes.forEach((c) => next.add(c));
      return next;
    });
    setRecent((prev) => {
      const next = new Set(prev);
      codes.forEach((c) => next.delete(c));
      return next;
    });
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const codes = matchCodes(e.code);
    // Move from pressed → recent
    setPressed((prev) => {
      const next = new Set(prev);
      codes.forEach((c) => next.delete(c));
      return next;
    });
    setRecent((prev) => {
      const next = new Set(prev);
      codes.forEach((c) => next.add(c));
      return next;
    });
    // Schedule removal from recent
    codes.forEach((c) => {
      const t = timersRef.current.get(c);
      if (t) clearTimeout(t);
      timersRef.current.set(
        c,
        setTimeout(() => {
          setRecent((prev) => {
            const next = new Set(prev);
            next.delete(c);
            return next;
          });
          timersRef.current.delete(c);
        }, LINGER_MS)
      );
    });
  }, []);

  // Clear all on blur
  const handleBlur = useCallback(() => {
    setPressed(new Set());
    setRecent(new Set());
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current.clear();
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [handleKeyDown, handleKeyUp, handleBlur]);

  return (
    <div className="hidden md:block select-none" aria-hidden="true">
      <div className="flex flex-col items-center gap-[3px]">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-[3px]">
            {row.map((key) => {
              const isPressed = pressed.has(key.code);
              const isRecent = recent.has(key.code);
              const w = key.width || 1;
              return (
                <div
                  key={key.code}
                  style={{ width: `${w * 2.2}rem` }}
                  className={`
                    h-8 flex items-center justify-center rounded text-[10px] font-bold
                    border transition-all
                    ${
                      isPressed
                        ? "bg-[var(--color-primary)] text-[var(--color-background)] border-[var(--color-primary)] shadow-[0_0_8px_rgba(0,255,65,0.5)] duration-75"
                        : isRecent
                          ? "bg-[var(--color-primary)]/30 text-[var(--color-primary)] border-[var(--color-primary)]/60 shadow-[0_0_4px_rgba(0,255,65,0.2)] duration-300"
                          : "bg-[var(--color-surface)] text-[var(--color-foreground-muted)] border-[var(--color-border)] duration-300"
                    }
                  `}
                >
                  {key.label}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
