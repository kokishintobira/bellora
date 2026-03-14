import { redirect } from "next/navigation";
import { getToolBySlug, getTools } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const tools = await getTools();
  return tools.map((t) => ({ slug: t.affiliateSlug }));
}

export default async function GoPage({ params }: Props) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);

  if (!tool) {
    redirect("/");
  }

  // In production, this would go to the affiliate URL.
  // For MVP, redirect to the tool's official site.
  redirect(tool.url);
}
