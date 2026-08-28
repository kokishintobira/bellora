"use client";

import { useEffect, useState } from "react";
import { CheckIcon, MessageIcon } from "./Icons";

export function CommentBox({ targetId, initialComment = "", compact = false }: { targetId: string; initialComment?: string; compact?: boolean }) {
  const storageKey = `keirin-comment:${targetId}`;
  const targetType = targetId.startsWith("daily-") ? "daily_result" : targetId.startsWith("experiment-") ? "experiment" : "race_prediction";
  const [comment, setComment] = useState(initialComment);
  const [savedComment, setSavedComment] = useState(initialComment);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(!compact || Boolean(initialComment));

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    async function hydrateComment() {
      let value = stored;
      try {
        const response = await fetch(`/api/keirin/comments?targetType=${targetType}&targetId=${encodeURIComponent(targetId)}`);
        if (response.ok) {
          const body = (await response.json()) as { comment?: { comment?: string } | null };
          value = body.comment?.comment ?? value;
        }
      } catch {
        // オフラインまたはDB未設定時はブラウザ保存を利用する。
      }
      if (value !== null) {
        setComment(value);
        setSavedComment(value);
        if (value) setOpen(true);
      }
    }
    void hydrateComment();
  }, [storageKey, targetId, targetType]);

  async function save() {
    const value = comment.trim();
    window.localStorage.setItem(storageKey, value);
    setSavedComment(value);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
    try {
      await fetch("/api/keirin/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetType, targetId, comment: value }),
      });
    } catch {
      // ローカル保存は完了済み。
    }
  }

  async function remove() {
    window.localStorage.removeItem(storageKey);
    setComment("");
    setSavedComment("");
    if (compact) setOpen(false);
    try {
      await fetch("/api/keirin/comments", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetType, targetId }),
      });
    } catch {
      // ローカル削除は完了済み。
    }
  }

  if (!open) {
    return <button type="button" className="k-comment-trigger" onClick={() => setOpen(true)}><MessageIcon />分析メモを追加</button>;
  }

  return (
    <div className={`k-comment-box ${compact ? "is-compact" : ""}`}>
      <div className="k-comment-title"><MessageIcon /><span>分析メモ</span>{saved && <em><CheckIcon />保存しました</em>}</div>
      <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="予測や結果について気づいたことを記録…" rows={compact ? 2 : 3} />
      <div className="k-comment-actions">
        {savedComment && <button type="button" className="k-button-text is-danger" onClick={remove}>削除</button>}
        <button type="button" className="k-button-secondary" onClick={save} disabled={!comment.trim() || comment.trim() === savedComment}>メモを保存</button>
      </div>
    </div>
  );
}
