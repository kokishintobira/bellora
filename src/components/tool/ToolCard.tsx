import Link from "next/link";
import type { Tool } from "@/types";
import { CategoryBadge } from "@/components/common/CategoryBadge";

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="flex flex-col rounded-xl border border-border bg-surface p-5 transition hover:border-primary/40"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold">{tool.name}</h3>
          <p className="text-xs text-foreground-muted">{tool.vendor}</p>
        </div>
        <CategoryBadge category={tool.category} linked={false} />
      </div>
      <p className="mt-3 flex-1 text-xs leading-relaxed text-foreground-muted">
        {tool.description}
      </p>
    </Link>
  );
}
