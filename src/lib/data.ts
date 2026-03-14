import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { Tool, WeeklyReport, ToolTrendHistory, XTokens, XPkceState } from "@/types";

const DATA_DIR = join(process.cwd(), "src/data");

/* ───── Tools Registry ───── */

export async function getTools(): Promise<Tool[]> {
  const raw = await readFile(join(DATA_DIR, "tools-registry.json"), "utf-8");
  return JSON.parse(raw) as Tool[];
}

export async function getToolBySlug(slug: string): Promise<Tool | undefined> {
  const tools = await getTools();
  return tools.find((t) => t.slug === slug);
}

export async function getToolsByCategory(category: string): Promise<Tool[]> {
  const tools = await getTools();
  return tools.filter((t) => t.category === category);
}

/* ───── Weekly Reports ───── */

export async function getWeeklyReport(
  weekSlug: string
): Promise<WeeklyReport | undefined> {
  try {
    const raw = await readFile(
      join(DATA_DIR, "reports", `${weekSlug}.json`),
      "utf-8"
    );
    return JSON.parse(raw) as WeeklyReport;
  } catch {
    return undefined;
  }
}

export async function getAllReportSlugs(): Promise<string[]> {
  const { readdir } = await import("fs/promises");
  try {
    const files = await readdir(join(DATA_DIR, "reports"));
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

export async function getLatestReport(): Promise<WeeklyReport | undefined> {
  const slugs = await getAllReportSlugs();
  if (slugs.length === 0) return undefined;
  return getWeeklyReport(slugs[0]);
}

export async function saveWeeklyReport(report: WeeklyReport): Promise<void> {
  const dir = join(DATA_DIR, "reports");
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, `${report.weekSlug}.json`),
    JSON.stringify(report, null, 2),
    "utf-8"
  );
}

/* ───── Tool Trend History ───── */

export async function getToolTrendHistory(
  toolSlug: string
): Promise<ToolTrendHistory | undefined> {
  try {
    const raw = await readFile(
      join(DATA_DIR, "tools", `${toolSlug}.json`),
      "utf-8"
    );
    return JSON.parse(raw) as ToolTrendHistory;
  } catch {
    return undefined;
  }
}

export async function saveToolTrendHistory(
  history: ToolTrendHistory
): Promise<void> {
  const dir = join(DATA_DIR, "tools");
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, `${history.toolSlug}.json`),
    JSON.stringify(history, null, 2),
    "utf-8"
  );
}

/* ───── X OAuth Tokens ───── */

export async function getXTokens(): Promise<XTokens | undefined> {
  try {
    const raw = await readFile(join(DATA_DIR, "x-tokens.json"), "utf-8");
    return JSON.parse(raw) as XTokens;
  } catch {
    return undefined;
  }
}

export async function saveXTokens(tokens: XTokens): Promise<void> {
  await writeFile(
    join(DATA_DIR, "x-tokens.json"),
    JSON.stringify(tokens, null, 2),
    "utf-8"
  );
}

export async function getXPkceState(): Promise<XPkceState | undefined> {
  try {
    const raw = await readFile(join(DATA_DIR, "x-pkce.json"), "utf-8");
    return JSON.parse(raw) as XPkceState;
  } catch {
    return undefined;
  }
}

export async function saveXPkceState(state: XPkceState): Promise<void> {
  await writeFile(
    join(DATA_DIR, "x-pkce.json"),
    JSON.stringify(state, null, 2),
    "utf-8"
  );
}

export async function deleteXPkceState(): Promise<void> {
  const { unlink } = await import("fs/promises");
  try {
    await unlink(join(DATA_DIR, "x-pkce.json"));
  } catch {
    // already deleted — ignore
  }
}
