// lib/auth/session.ts
// Sessão do painel: cookie de sessão do Firebase verificado no servidor a cada request.
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { adminAuth, isAdminConfigured } from "@/lib/firebase/admin";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 5; // 5 dias

export type Session =
  | { authenticated: true; uid: string; email: string }
  | { authenticated: false };

/** E-mails autorizados a usar o painel (ADMIN_EMAILS, separados por vírgula). */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
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
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true);
    if (!isAllowedAdmin(decoded.email)) return { authenticated: false };

    return { authenticated: true, uid: decoded.uid, email: decoded.email! };
  } catch {
    return { authenticated: false };
  }
});

/** Use no topo de páginas e server actions do painel. */
export async function requireAdmin(): Promise<{ uid: string; email: string }> {
  const session = await getSession();
  if (!session.authenticated) redirect("/login");
  return { uid: session.uid, email: session.email };
}
