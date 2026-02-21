import Link from "next/link";

export default async function GoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // TODO: slug → アフィリエイトURLマッピングを追加後、redirect() に切り替え
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <p className="text-sm text-foreground/50">リダイレクト準備中</p>
      <p className="mt-2 text-xs text-foreground/40">
        アイテム: <code className="rounded bg-muted px-2 py-1">{slug}</code>
      </p>
      <Link
        href="/"
        className="mt-6 text-sm text-primary underline hover:text-primary-dark"
      >
        トップに戻る
      </Link>
    </div>
  );
}
