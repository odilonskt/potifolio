import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Define the root for turbopack to avoid lockfile detection issues
  turbopack: {
    root: __dirname,
    // O código do Piper (voz de IA do blog) cita "fs" em trechos só para Node
    resolveAlias: {
      fs: { browser: "./src/lib/empty-module.ts" },
    },
  },
  reactStrictMode: true,
  // Não expõe "X-Powered-By: Next.js"
  poweredByHeader: false,
  // Next.js 15 vem com otimizações automáticas
  experimental: {
    // Se quiser usar server actions puros
    serverActions: {
      // Imagens (até 4 MB somadas por envio) + campos do formulário do painel.
      // A Vercel recusa corpos acima de 4,5 MB de qualquer forma.
      bodySizeLimit: "4.4mb",
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
        // GIFs da seção "Destaque visual" (servidas pelo proxy de imagens do Next)
        protocol: "https",
        hostname: "i.pinimg.com",
        pathname: "/originals/**",
      },
      {
        // Imagens enviadas pelo painel (Firebase Storage)
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: `/v0/b/${process.env.FIREBASE_STORAGE_BUCKET ?? "*"}/**`,
      },
    ],
  },
};

export default nextConfig;
