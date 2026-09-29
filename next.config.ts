import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Define the root for turbopack to avoid lockfile detection issues
  turbopack: {
    root: __dirname,
  },
  reactStrictMode: true,
  // Não expõe "X-Powered-By: Next.js"
  poweredByHeader: false,
  // Next.js 15 vem com otimizações automáticas
  experimental: {
    // Se quiser usar server actions puros
    serverActions: {
      // Imagens de até 2 MB + campos do formulário do painel
      bodySizeLimit: "3mb",
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
        // Imagens enviadas pelo painel (Firebase Storage)
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: `/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "*"}/**`,
      },
    ],
  },
};

export default nextConfig;
