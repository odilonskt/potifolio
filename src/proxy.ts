import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const isProd = process.env.NODE_ENV === "production";

// Content Security Policy: de onde o navegador pode carregar cada tipo de recurso.
// - connect-src 'self': o navegador só fala com este site (GitHub/Firebase via servidor)
// - 'unsafe-eval' só em desenvolvimento (recarregamento do next dev)
// - 'unsafe-inline' em script-src é exigido pelo Next sem nonce; nonce tornaria todas
//   as páginas dinâmicas e desligaria o cache (ISR)
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

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

// Next 16.3+: "proxy" substitui a convenção "middleware"
export function proxy(request: NextRequest) {
  const session = request.cookies.get("session");

  // Filtro rápido: sem cookie nem chega no painel. A verificação real do cookie
  // (assinatura, expiração, e-mail admin) acontece no servidor via requireAdmin().
  // Não redirecionamos /login -> /dashboard aqui: um cookie inválido causaria loop.
  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  // Área administrativa nunca vai para cache compartilhado
  if (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/login")) {
    response.headers.set("Cache-Control", "private, no-store");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
