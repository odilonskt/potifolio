import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Headers de privacidade globais.
// connect-src 'self': o navegador só fala com este site. Tudo do GitHub passa pelo
// proxy /api/github (servidor), então o IP de quem visita nunca chega ao GitHub.
const PRIVACY_HEADERS = {
  "X-DNS-Prefetch-Control": "off",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=(), payment=()",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';",
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

  // Adicionar headers de privacidade globais
  Object.entries(PRIVACY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // X-Powered-By é desligado em next.config.ts (poweredByHeader: false)
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
