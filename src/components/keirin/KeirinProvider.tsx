"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type KeirinContextValue = {
  baseStake: number;
  setBaseStake: (value: number) => void;
};

const KeirinContext = createContext<KeirinContextValue | null>(null);

export function KeirinProvider({ children }: { children: React.ReactNode }) {
  const [baseStake, setBaseStakeState] = useState(500);

  useEffect(() => {
    const saved = window.localStorage.getItem("keirin-base-stake");
    if (saved && Number(saved) >= 100) {
      queueMicrotask(() => setBaseStakeState(Number(saved)));
    }
  }, []);

  const value = useMemo(
    () => ({
      baseStake,
      setBaseStake(value: number) {
        const safeValue = Math.max(100, Math.round(value / 100) * 100);
        setBaseStakeState(safeValue);
        window.localStorage.setItem("keirin-base-stake", String(safeValue));
      },
    }),
    [baseStake],
  );

  return <KeirinContext.Provider value={value}>{children}</KeirinContext.Provider>;
}

export function useKeirinSettings() {
  const value = useContext(KeirinContext);
  if (!value) throw new Error("useKeirinSettings must be used within KeirinProvider");
  return value;
}
