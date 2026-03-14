import Link from "next/link";
import type { ToolCategory } from "@/types";
import { CATEGORY_LABELS, CATEGORY_EMOJI } from "@/lib/constants";

export function CategoryBadge({
  category,
  linked = true,
}: {
  category: ToolCategory;
  linked?: boolean;
}) {
  const content = (
    <>
      <span>{CATEGORY_EMOJI[category]}</span>
      <span>{CATEGORY_LABELS[category]}</span>
    </>
  );

  const className =
    "inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-xs text-foreground-muted transition hover:text-foreground";

  if (linked) {
    return (
      <Link href={`/categories/${category}`} className={className}>
        {content}
      </Link>
    );
  }

  return <span className={className}>{content}</span>;
}
