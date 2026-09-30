import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isLocale, LOCALE_COOKIE, localePath, negotiateLocale } from "@/lib/i18n/config";

const isProd = process.env.NODE_ENV === "production";

// Content Security Policy: de onde o navegador pode carregar cada tipo de recurso.
// - connect-src 'self': o navegador só fala com este site (GitHub/Firebase via servidor)
// - 'unsafe-eval' só em desenvolvimento (recarregamento do next dev)
// - 'unsafe-inline' em script-src é exigido pelo Next sem nonce; nonce tornaria todas
//   as páginas dinâmicas e desligaria o cache (ISR)
// - Só nos posts do blog (voz de IA, opcional): 'wasm-unsafe-eval' para compilar o
//   WebAssembly do Piper, download da voz no Hugging Face e áudio gerado em blob:
const HUGGING_FACE = "https://huggingface.co https://*.huggingface.co https://*.hf.co";

function buildCsp({ tts }: { tts: boolean }) {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${tts ? " 'wasm-unsafe-eval'" : ""}${isProd ? "" : " 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src 'self'${tts ? ` ${HUGGING_FACE}` : ""}`,
    `media-src 'self'${tts ? " blob:" : ""}`,
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    ...(isProd ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

const CSP = buildCsp({ tts: false });
const CSP_WITH_TTS = buildCsp({ tts: true });

const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": CSP,
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=(), payment=(), usb=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "X-DNS-Prefetch-Control": "off",
  // O filtro XSS antigo dos navegadores é obsoleto e pode ser explorado: desligado
  "X-XSS-Protection": "0",
  // HTTPS obrigatório por 2 anos (só em produção; em localhost quebraria o http)
  ...(isProd ? { "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload" } : {}),
};

function withSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

/** Idioma de quem chega sem prefixo: a escolha anterior (cookie) ou o idioma da máquina. */
function preferredLocale(request: NextRequest) {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  return isLocale(saved) ? saved : negotiateLocale(request.headers.get("accept-language"));
}

// Next 16.3+: "proxy" substitui a convenção "middleware"
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // API e arquivos (icon.svg, imagens) não têm idioma
  const isApiOrFile = pathname.startsWith("/api/") || /\.[a-z0-9]+$/i.test(pathname);
  const [, first = ""] = pathname.split("/");

  // Sem prefixo de idioma: redireciona para /pt, /en ou /es
  if (!isApiOrFile && !isLocale(first)) {
    const url = request.nextUrl.clone();
    url.pathname = localePath(preferredLocale(request), pathname);
    url.search = search;
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  const locale = isLocale(first) ? first : null;
  const route = locale ? pathname.slice(locale.length + 1) || "/" : pathname;
  const isAdminArea = route.startsWith("/dashboard") || route.startsWith("/login");

  // Filtro rápido: sem cookie nem chega no painel. A verificação real do cookie
  // (assinatura, expiração, e-mail admin) acontece no servidor via requireAdmin().
  // Não redirecionamos /login -> /dashboard aqui: um cookie inválido causaria loop.
  if (locale && !request.cookies.get("session") && route.startsWith("/dashboard")) {
    return withSecurityHeaders(NextResponse.redirect(new URL(localePath(locale, "/login"), request.url)));
  }

  const response = withSecurityHeaders(NextResponse.next());
  // Post do blog ("/blog/slug"): libera só o necessário para a voz de IA
  if (/^\/blog\/[^/]+$/.test(route)) response.headers.set("Content-Security-Policy", CSP_WITH_TTS);

  // Lembra o idioma da página (usado por server actions e por quem volta sem prefixo)
  if (locale && request.cookies.get(LOCALE_COOKIE)?.value !== locale) {
    response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", secure: isProd });
  }

  // Área administrativa nunca vai para cache compartilhado
  if (isAdminArea) response.headers.set("Cache-Control", "private, no-store");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
