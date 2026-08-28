"use client";

import { useState } from "react";
import { useKeirinSettings } from "./KeirinProvider";

export function StakePicker({ compact = false }: { compact?: boolean }) {
  const { baseStake, setBaseStake } = useKeirinSettings();
  const [custom, setCustom] = useState(String(baseStake));

  if (compact) {
    return (
      <label className="k-compact-picker">
        <span>1買い目あたり</span>
        <select value={baseStake} onChange={(event) => setBaseStake(Number(event.target.value))}>
          {[100, 500, 1000, 2000].map((amount) => <option key={amount} value={amount}>{amount.toLocaleString()}円</option>)}
        </select>
      </label>
    );
  }

  return (
    <div className="k-stake-picker">
      {[100, 500, 1000].map((amount) => (
        <button key={amount} type="button" className={baseStake === amount ? "is-selected" : ""} onClick={() => { setBaseStake(amount); setCustom(String(amount)); }}>
          {amount.toLocaleString()}円
        </button>
      ))}
      <div className="k-custom-stake">
        <input inputMode="numeric" aria-label="カスタム投資額" value={custom} onChange={(event) => setCustom(event.target.value.replace(/\D/g, ""))} />
        <span>円</span>
        <button type="button" onClick={() => setBaseStake(Number(custom) || 100)}>適用</button>
      </div>
    </div>
  );
}
