import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Enable PPR for ISR pages when available
  },
  // 制作物のデザイン案プレビュー（public/preview 配下の静的HTML）を短いURLで開けるようにする
  async rewrites() {
    return [
      {
        source: "/preview/tenpura-oirase",
        destination: "/preview/tenpura-oirase/index.html",
      },
      {
        source: "/preview/tenpura-oirase/a",
        destination: "/preview/tenpura-oirase/a-premium/index.html",
      },
      {
        source: "/preview/tenpura-oirase/b",
        destination: "/preview/tenpura-oirase/b-shokudo/index.html",
      },
    ];
  },
};

export default nextConfig;
