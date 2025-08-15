import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Skip ESLint during builds
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Skip TS type errors during builds
  },
};

export default nextConfig;
