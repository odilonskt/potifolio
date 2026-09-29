// lib/security/request-guard.ts
// Proteções de borda para rotas e server actions: limite de tentativas por IP,
// verificação de origem (CSRF) e limite de tamanho do corpo.
import "server-only";

import { headers } from "next/headers";
import { isIP } from "node:net";

// ─── Limite de tentativas (janela deslizante, em memória) ─────────────────────
// Em serverless cada instância tem a própria memória: é uma primeira barreira,
// não uma garantia global. Para limite global use Upstash/Redis ou o Firewall da Vercel.

type Bucket = { hits: number[] };
const buckets = new Map<string, Bucket>();
const MAX_KEYS = 10_000;

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((time) => now - time < windowMs);

  if (bucket.hits.length >= limit) {
    const retryAfterMs = windowMs - (now - bucket.hits[0]);
    return { allowed: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
  }

  bucket.hits.push(now);
  // Evita crescer sem limite: descarta a chave mais antiga
  if (!buckets.has(key) && buckets.size >= MAX_KEYS) {
    const oldest = buckets.keys().next().value;
    if (oldest) buckets.delete(oldest);
  }
  buckets.set(key, bucket);
  return { allowed: true };
}

/** IP do cliente (a Vercel preenche x-forwarded-for). Usado só como chave em memória. */
export function clientIp(requestHeaders: Headers): string {
  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip")?.trim() ||
    "desconhecido"
  );
}

/**
 * IP para gravar no banco: só aceita um IPv4/IPv6 válido (nada de texto arbitrário
 * vindo de header). Na Vercel, x-forwarded-for é definido pela própria plataforma.
 */
export function clientIpForStorage(requestHeaders: Headers): string | undefined {
  const ip = clientIp(requestHeaders);
  return isIP(ip) ? ip : undefined;
}

/** Mesma coisa, para server actions (onde não há Request). */
export async function actionClientIp(): Promise<string> {
  return clientIp(await headers());
}

// ─── Origem (CSRF) ────────────────────────────────────────────────────────────

/**
 * Rotas que alteram dados só aceitam pedidos do próprio site. O navegador sempre
 * envia Origin em POST/DELETE via fetch; um site terceiro não consegue falsificá-lo.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// ─── Tamanho do corpo ─────────────────────────────────────────────────────────

export function exceedsBodyLimit(request: Request, maxBytes: number): boolean {
  const length = Number(request.headers.get("content-length") ?? "0");
  return Number.isFinite(length) && length > maxBytes;
}
