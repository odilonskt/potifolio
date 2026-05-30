import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Headers de privacidade globais
const PRIVACY_HEADERS = {
  "X-DNS-Prefetch-Control": "off",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=(), payment=()",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.github.com; frame-ancestors 'none';",
};

// Esta função pode ser marcada como `async` se estiver usando `await`
export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  // Se não houver sessão e o usuário tentar acessar rotas protegidas
  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Se já tiver sessão e tentar acessar login
  if (session && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const response = NextResponse.next();

  // Adicionar headers de privacidade globais
  Object.entries(PRIVACY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Remove headers que podem expor informações
  response.headers.delete("Server");
  response.headers.delete("X-Powered-By");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
