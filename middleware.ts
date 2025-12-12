import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    // Adicione outras rotas protegidas aqui
  ],
};
