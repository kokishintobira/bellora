import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Enable PPR for ISR pages when available
  },
};

export default nextConfig;
