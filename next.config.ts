import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Define the root for turbopack to avoid lockfile detection issues
  turbopack: {
    root: __dirname,
  },
  reactStrictMode: true,
  // Next.js 15 vem com otimizações automáticas
  experimental: {
    // Se quiser usar server actions puros
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Melhor suporte para PWA e cache
  cacheHandler: process.env.NEXT_CACHE_HANDLER,
  cacheMaxMemorySize: 50, // MB
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "opengraph.githubassets.com",
      },
      {
        protocol: "https",
        hostname: "readme-typing-svg.herokuapp.com",
      },
      {
        protocol: "https",
        hostname: "*.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "skillicons.dev",
      },
      {
        protocol: "https",
        hostname: "**",
      },

      {
        protocol: "https",
        hostname: "skillicons.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "readme-typing-svg.herokuapp.com",
        pathname: "/**",
      },
      // Add this for GitHub raw content if needed
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
