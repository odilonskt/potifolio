// lib/auth/session.ts
// Sessão do painel: cookie de sessão do Firebase verificado no servidor a cada request.
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { env } from "@/lib/env";
import { adminAuth, isAdminConfigured } from "@/lib/firebase/admin";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 5; // 5 dias

export type Session =
  | { authenticated: true; uid: string; email: string }
  | { authenticated: false };

/** E-mails autorizados a usar o painel (ADMIN_EMAILS, separados por vírgula). */
export function getAdminEmails(): string[] {
  return (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

/**
 * Lê e verifica o cookie de sessão (assinatura, expiração e revogação).
 * Memoizado por request com React.cache.
 */
export const getSession = cache(async (): Promise<Session> => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionCookie || !isAdminConfigured()) {
    return { authenticated: false };
  }

  try {
    const decoded = await (await adminAuth()).verifySessionCookie(sessionCookie, true);
    if (!isAllowedAdmin(decoded.email)) return { authenticated: false };

    return { authenticated: true, uid: decoded.uid, email: decoded.email! };
  } catch (error) {
    // Cookie inválido/expirado é normal (erros "auth/..."); o resto é falha de infraestrutura
    const code = (error as { code?: unknown })?.code;
    if (typeof code !== "string" || !code.startsWith("auth/")) {
      console.error("Falha ao verificar sessão:", error);
    }
    return { authenticated: false };
  }
});

/**
 * Autorização para Route Handlers (/api/*): aceita o cookie de sessão do painel
 * ou um header "Authorization: Bearer <Firebase ID token>" de um e-mail admin.
 */
export async function isAdminRequest(request: Request): Promise<boolean> {
  const session = await getSession();
  if (session.authenticated) return true;

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ") || !isAdminConfigured()) return false;

  try {
    const decoded = await (await adminAuth()).verifyIdToken(header.slice(7), true);
    return isAllowedAdmin(decoded.email);
  } catch {
    return false;
  }
}

/** Use no topo de páginas e server actions do painel. */
export async function requireAdmin(): Promise<{ uid: string; email: string }> {
  const session = await getSession();
  if (!session.authenticated) redirect("/login");
  return { uid: session.uid, email: session.email };
}
