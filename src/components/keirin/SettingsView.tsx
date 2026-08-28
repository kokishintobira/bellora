"use client";

import { useEffect, useState } from "react";
import { PageHeading } from "./PageHeading";
import { StakePicker } from "./StakePicker";
import { useKeirinSettings } from "./KeirinProvider";
import { formatYen } from "@/lib/keirin/calculations";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`k-toggle ${checked ? "is-on" : ""}`} onClick={onChange} />;
}

export function SettingsView() {
  const { baseStake, data } = useKeirinSettings();
  const [notifications, setNotifications] = useState(true);
  const [showOdds, setShowOdds] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem("keirin-preferences");
    if (raw) {
      const value = JSON.parse(raw) as { notifications?: boolean; showOdds?: boolean };
      queueMicrotask(() => {
        setNotifications(value.notifications ?? true);
        setShowOdds(value.showOdds ?? true);
      });
    }
  }, []);

  function save() {
    window.localStorage.setItem("keirin-preferences", JSON.stringify({ notifications, showOdds }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <>
      <PageHeading eyebrow="Simulation settings" title="設定" description="仮想投資額と表示方法を調整" />
      <div className="k-settings-grid">
        <section className="k-card k-settings-card">
          <h2>基準投資額</h2>
          <p>1買い目あたりの金額を変更すると、すべてのシミュレーション結果を同じ比率で再計算します。現在は <strong>{formatYen(baseStake)}</strong> です。</p>
          <StakePicker />
          <div style={{ marginTop: 26 }}>
            <div className="k-setting-row"><div><strong>結果確定のお知らせ</strong><span>日次結果の更新状態をダッシュボードに表示</span></div><Toggle label="結果確定のお知らせ" checked={notifications} onChange={() => setNotifications((value) => !value)} /></div>
            <div className="k-setting-row"><div><strong>予想オッズを表示</strong><span>Today画面に取得時点の参考オッズを表示</span></div><Toggle label="予想オッズを表示" checked={showOdds} onChange={() => setShowOdds((value) => !value)} /></div>
          </div>
          <button type="button" className="k-button-primary" onClick={save}>{saved ? "保存しました ✓" : "表示設定を保存"}</button>
        </section>

        <aside className="k-card k-settings-card">
          <h2>システム状態</h2>
          <p>データ連携と日次集計の直近ステータスです。</p>
          <div className="k-db-status">
            <div><span>表示モード</span><b>{data.dataMode === "real" ? "実データ" : "デモ"}</b></div>
            <div><span>予想データ</span><b>{data.todayPredictions.length}レース</b></div>
            <div><span>確定結果</span><b>{data.dailyResults.length}日分</b></div>
            <div><span>タイムゾーン</span><strong>Asia/Tokyo</strong></div>
          </div>
          <div className="k-worker-note" style={{ marginTop: 18 }}><span />ML Workerはローカル実行です。再学習・本番バックテストを行うにはWorkerを起動してください。</div>
        </aside>
      </div>
      <div className="k-disclaimer">設定値はこのブラウザに保存されます。実際の投票・決済・リアルマネーとの連携は行いません。</div>
    </>
  );
}
