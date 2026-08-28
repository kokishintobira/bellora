"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { allTimePerformance, dailyResults, experiments, monthPerformance, todayPredictions } from "@/lib/keirin/data";
import type { KeirinDashboardData } from "@/lib/keirin/types";

type KeirinContextValue = {
  baseStake: number;
  setBaseStake: (value: number) => void;
  data: KeirinDashboardData;
};

const KeirinContext = createContext<KeirinContextValue | null>(null);

export function KeirinProvider({ children }: { children: React.ReactNode }) {
  const [baseStake, setBaseStakeState] = useState(500);
  const demoMode = process.env.NEXT_PUBLIC_KEIRIN_DEMO_MODE === "true";
  const [data, setData] = useState<KeirinDashboardData | null>(() => demoMode ? {
    dataMode: "demo", generatedAt: new Date().toISOString(), todayPredictions, dailyResults,
    experiments, monthPerformance, allTimePerformance,
  } : null);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("keirin-base-stake");
    if (saved && Number(saved) >= 100) {
      queueMicrotask(() => setBaseStakeState(Number(saved)));
    }
  }, []);

  useEffect(() => {
    if (demoMode) return;
    fetch("/api/keirin/dashboard", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "実データを取得できませんでした");
        setData(payload);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "実データを取得できませんでした"));
  }, [demoMode]);

  const value = useMemo(
    () => ({
      baseStake,
      data: data!,
      setBaseStake(value: number) {
        const safeValue = Math.max(100, Math.round(value / 100) * 100);
        setBaseStakeState(safeValue);
        window.localStorage.setItem("keirin-base-stake", String(safeValue));
      },
    }),
    [baseStake, data],
  );

  if (error) return <div className="k-data-state"><strong>実データを表示できません</strong><p>{error}</p><p>プレビュー値への自動切替は行っていません。</p></div>;
  if (!data) return <div className="k-data-state"><strong>実データを読み込み中…</strong></div>;

  return <KeirinContext.Provider value={value}>{children}</KeirinContext.Provider>;
}

export function useKeirinSettings() {
  const value = useContext(KeirinContext);
  if (!value) throw new Error("useKeirinSettings must be used within KeirinProvider");
  return value;
}
