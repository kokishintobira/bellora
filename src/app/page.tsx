import Image from "next/image";
import Link from "next/link";

/* ───── data ───── */

const categories = [
  {
    slug: "morning",
    title: "朝1分ケア",
    description: "洗顔〜保湿まで、1分で完了するアイテム",
    emoji: "🌅",
  },
  {
    slug: "bath",
    title: "お風呂上がり",
    description: "入浴後のスキンケアを最短で仕上げる",
    emoji: "🛁",
  },
  {
    slug: "makeup",
    title: "メイク時短",
    description: "ベースからポイントまで、5分で完成",
    emoji: "💄",
  },
];

const picks = [
  {
    category: "morning",
    items: [
      {
        name: "オールインワンジェル",
        description: "化粧水・乳液・美容液がこれ1つ。洗顔後ワンステップで完了。",
        slug: "allinone-gel",
      },
      {
        name: "拭き取り化粧水シート",
        description: "朝の洗顔代わりに。拭くだけで角質ケア＋保湿。",
        slug: "wiping-lotion",
      },
      {
        name: "UVカット乳液",
        description: "保湿と日焼け止めを同時に。下地いらずで時短。",
        slug: "uv-milk",
      },
    ],
  },
  {
    category: "bath",
    items: [
      {
        name: "インバストリートメント",
        description: "お風呂の中で塗って流すだけ。ドライヤー時間も短縮。",
        slug: "in-bath-treatment",
      },
      {
        name: "ボディミルク(濡れ肌用)",
        description: "タオルドライ前に塗れる。お風呂場で保湿完了。",
        slug: "wet-body-milk",
      },
    ],
  },
  {
    category: "makeup",
    items: [
      {
        name: "クッションファンデ",
        description: "パフでポンポン塗るだけ。カバー力＋ツヤ感を30秒で。",
        slug: "cushion-foundation",
      },
      {
        name: "マルチカラースティック",
        description: "リップ・チーク・アイシャドウ兼用。ポーチもスッキリ。",
        slug: "multi-stick",
      },
      {
        name: "お湯落ちマスカラ",
        description: "クレンジング不要。お湯で落とせるからオフも時短。",
        slug: "oyu-mascara",
      },
    ],
  },
];

const faqs = [
  {
    q: "本当に時短で効果はありますか？",
    a: "はい。各アイテムは口コミ評価と成分を基に厳選しています。時短でも品質に妥協しない製品だけをご紹介しています。",
  },
  {
    q: "敏感肌でも使えるものはありますか？",
    a: "各アイテムの詳細ページで成分情報を確認できます。敏感肌向けの製品も積極的にピックアップしています。",
  },
  {
    q: "掲載アイテムはどう選んでいますか？",
    a: "編集部が実際の口コミ・成分・コスパを総合的に評価し、忙しい方に本当におすすめできるものだけを掲載しています。",
  },
  {
    q: "リンク先で購入できますか？",
    a: "はい。各アイテムのリンクから大手ECサイト等で購入可能です。※当サイトはアフィリエイトプログラムに参加しています。",
  },
  {
    q: "男性でも参考になりますか？",
    a: "もちろんです。時短スキンケアは性別を問わず役立ちます。特にオールインワン系は男性にも人気です。",
  },
];

/* ───── page ───── */

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-monogram-icon.svg"
              alt="Bellora"
              width={28}
              height={28}
              className="rounded"
            />
            <span className="text-lg font-bold tracking-wide text-primary-dark">
              Bellora
            </span>
          </Link>
          <span className="text-xs text-accent">時短美容セレクション</span>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="flex flex-col items-center px-5 pb-16 pt-20 text-center">
        <Image
          src="/logo-primary-icon.svg"
          alt="Bellora"
          width={72}
          height={72}
          className="mb-6 rounded-2xl"
          priority
        />
        <h1 className="text-3xl font-bold leading-snug tracking-tight sm:text-4xl">
          忙しい毎日でも、
          <br />
          きれいは続く。
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-foreground/70">
          育児も仕事もがんばる30代女性のための
          <br className="sm:hidden" />
          時短美容セレクション
        </p>
        <a
          href="#categories"
          className="mt-8 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-dark"
        >
          おすすめを見る
        </a>
      </section>

      {/* ── Problem / Solution ── */}
      <section className="bg-muted px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-xl font-bold">
            こんなお悩みありませんか？
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "朝はバタバタ、スキンケアは化粧水だけ…",
              "子どもを寝かしつけたら自分の時間はゼロ",
              "色々買っても結局使いきれない",
              "何がいいかリサーチする時間すらない",
            ].map((text) => (
              <div
                key={text}
                className="flex items-start gap-3 rounded-xl bg-background p-4"
              >
                <span className="mt-0.5 text-primary">&#10003;</span>
                <p className="text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-2xl border border-primary/20 bg-background p-6 text-center">
            <p className="text-lg font-bold text-primary-dark">
              Bellora が「本当に使えるもの」だけを厳選。
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">
              口コミ・成分・コスパを編集部が総合評価。
              <br />
              忙しいあなたの代わりにリサーチします。
            </p>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section id="categories" className="px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-xl font-bold">
            3つのシーンから選ぶ
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {categories.map((cat) => (
              <a
                key={cat.slug}
                href={`#${cat.slug}`}
                className="rounded-2xl border border-border bg-background p-6 text-center transition hover:border-primary/40 hover:shadow-sm"
              >
                <span className="text-3xl">{cat.emoji}</span>
                <h3 className="mt-3 text-base font-bold">{cat.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-foreground/60">
                  {cat.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Picks ── */}
      <section className="bg-muted px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-xl font-bold">
            編集部おすすめアイテム
          </h2>
          {picks.map((group) => {
            const cat = categories.find((c) => c.slug === group.category)!;
            return (
              <div key={group.category} id={group.category} className="mb-12 last:mb-0">
                <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-primary-dark">
                  <span>{cat.emoji}</span>
                  {cat.title}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => (
                    <div
                      key={item.slug}
                      className="flex flex-col justify-between rounded-2xl border border-border bg-background p-5"
                    >
                      <div>
                        <h4 className="text-sm font-bold">{item.name}</h4>
                        <p className="mt-2 text-xs leading-relaxed text-foreground/60">
                          {item.description}
                        </p>
                      </div>
                      <Link
                        href={`/go/${item.slug}`}
                        className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-medium text-white transition hover:bg-primary-dark"
                      >
                        詳しく見る
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-xl font-bold">
            よくある質問
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl border border-border bg-background"
              >
                <summary className="flex cursor-pointer items-center justify-between p-5 text-sm font-medium">
                  {faq.q}
                  <span className="ml-2 text-primary transition group-open:rotate-45">
                    ＋
                  </span>
                </summary>
                <p className="px-5 pb-5 text-xs leading-relaxed text-foreground/70">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-muted px-5 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-lg font-bold text-primary-dark">Bellora</p>
          <p className="mt-1 text-xs text-foreground/50">時短美容セレクション</p>

          <div className="mt-6 space-y-2 text-xs leading-relaxed text-foreground/50">
            <p>
              当サイトはアフィリエイトプログラムに参加しています。
              <br />
              掲載リンクを通じて商品を購入された場合、当サイトが報酬を受け取ることがあります。
            </p>
            <p>
              掲載情報は記事公開時点のものです。最新情報は各公式サイトでご確認ください。
              <br />
              効果・効能を保証するものではありません。
            </p>
          </div>

          <div className="mt-6 text-xs text-foreground/40">
            <p>
              お問い合わせ：
              <a
                href="mailto:contact@bellora.jp"
                className="underline hover:text-primary"
              >
                contact@bellora.jp
              </a>
            </p>
            <p className="mt-2">&copy; 2025 Bellora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
