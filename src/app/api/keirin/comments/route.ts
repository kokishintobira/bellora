import { NextRequest, NextResponse } from "next/server";
import { getKeirinDb, isKeirinDbConfigured } from "@/lib/keirin/db";

const targetTypes = new Set(["daily_result", "race_prediction", "experiment"]);

export async function GET(request: NextRequest) {
  const targetType = request.nextUrl.searchParams.get("targetType");
  const targetId = request.nextUrl.searchParams.get("targetId");
  if (!targetType || !targetId || !targetTypes.has(targetType)) {
    return NextResponse.json({ error: "対象が正しくありません" }, { status: 400 });
  }
  if (!isKeirinDbConfigured()) return NextResponse.json({ comment: null, storage: "local" });

  const result = await getKeirinDb().execute({
    sql: "SELECT id, comment, created_at, updated_at FROM analysis_comments WHERE target_type = ? AND target_id = ? LIMIT 1",
    args: [targetType, targetId],
  });
  return NextResponse.json({ comment: result.rows[0] ?? null, storage: "turso" });
}

export async function POST(request: NextRequest) {
  if (!isKeirinDbConfigured()) return NextResponse.json({ error: "DB未設定" }, { status: 503 });
  const body = (await request.json()) as { targetType?: string; targetId?: string; comment?: string };
  if (!body.targetType || !targetTypes.has(body.targetType) || !body.targetId || !body.comment?.trim()) {
    return NextResponse.json({ error: "入力内容が正しくありません" }, { status: 400 });
  }

  const id = `${body.targetType}:${body.targetId}`;
  await getKeirinDb().execute({
    sql: `INSERT INTO analysis_comments (id, target_type, target_id, comment)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(target_type, target_id) DO UPDATE SET comment = excluded.comment, updated_at = CURRENT_TIMESTAMP`,
    args: [id, body.targetType, body.targetId, body.comment.trim()],
  });
  return NextResponse.json({ id, comment: body.comment.trim() });
}

export async function DELETE(request: NextRequest) {
  if (!isKeirinDbConfigured()) return NextResponse.json({ error: "DB未設定" }, { status: 503 });
  const body = (await request.json()) as { targetType?: string; targetId?: string };
  if (!body.targetType || !targetTypes.has(body.targetType) || !body.targetId) {
    return NextResponse.json({ error: "対象が正しくありません" }, { status: 400 });
  }
  await getKeirinDb().execute({
    sql: "DELETE FROM analysis_comments WHERE target_type = ? AND target_id = ?",
    args: [body.targetType, body.targetId],
  });
  return NextResponse.json({ deleted: true });
}
