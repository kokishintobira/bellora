"use client";

import type { CheatSheetSection } from "@/types/dojo";

interface CheatSheetPanelProps {
  sections: CheatSheetSection[];
  onClose: () => void;
}

export function CheatSheetPanel({ sections, onClose }: CheatSheetPanelProps) {
  return (
    <>
      <div className="cheatsheet-overlay" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[560px] sm:max-h-[80vh] z-50">
        <div className="cheatsheet-panel rounded-t-lg sm:rounded-lg p-4 max-h-[70vh] sm:max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--color-primary)]">
              チートシート
            </h3>
            <button
              onClick={onClose}
              className="text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] text-lg cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.title}>
                <h4 className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider mb-2">
                  {section.title}
                </h4>
                <div className="space-y-1">
                  {section.entries.map((entry) => (
                    <div
                      key={entry.keys}
                      className="flex justify-between text-xs py-1 border-b border-[var(--color-border)]"
                    >
                      <code className="text-[var(--color-primary)]">
                        {entry.keys}
                      </code>
                      <span className="text-[var(--color-foreground-muted)] ml-4 text-right">
                        {entry.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
