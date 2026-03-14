"use client";

import { useEffect, useRef } from "react";

interface AdBannerProps {
  slot: string;
  format?: "vertical" | "horizontal";
  className?: string;
}

/**
 * A8.net 広告バナーラッパー。
 * slot に A8.net のスクリプトコードをセットすると表示される。
 * 空の場合はプレースホルダーを表示（開発用）。
 */
export function AdBanner({ slot, format = "vertical", className = "" }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slot || !containerRef.current) return;

    // A8.net のスクリプトタグを注入
    const container = containerRef.current;
    if (slot.includes("<")) {
      container.innerHTML = slot;
      // スクリプトタグを再実行
      const scripts = container.querySelectorAll("script");
      scripts.forEach((oldScript) => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
    }
  }, [slot]);

  const isVertical = format === "vertical";

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center ${className}`}
    >
      {/* Placeholder — A8.net コード未設定時 */}
      {!slot && (
        <div
          className={`border border-dashed border-[var(--color-border)] rounded flex items-center justify-center text-[10px] text-[var(--color-foreground-muted)] ${
            isVertical ? "w-[250px] h-[250px]" : "w-full h-[90px]"
          }`}
        >
          <span className="opacity-40">AD</span>
        </div>
      )}
    </div>
  );
}
