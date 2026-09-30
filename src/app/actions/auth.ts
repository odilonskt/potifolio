"use server";

import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  isAllowedAdmin,
} from "@/lib/auth/session";
import { env } from "@/lib/env";
import { adminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import { localePath } from "@/lib/i18n/config";
import { dashboard } from "@/lib/i18n/messages/dashboard";
import { getRequestLocale } from "@/lib/i18n/server";
import { actionClientIp, rateLimit } from "@/lib/security/request-guard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

type LoginMessages = (typeof dashboard)["pt"]["login"];

const loginSchema = (t: LoginMessages) =>
  z.object({
    email: z.string().trim().email(t.invalidEmail).max(254),
    password: z.string().min(6, t.shortPassword).max(128),
  });

export type LoginFormState = {
  message: string;
  error?: {
    email?: string[];
    password?: string[];
  };
  success?: boolean;
};


/**
 * Autentica pela API REST do Firebase Auth (sem estado compartilhado entre requests)
 * e devolve o ID token recém-emitido.
 */
async function signInWithPassword(
  email: string,
  password: string,
  t: LoginMessages
): Promise<{ idToken: string } | { error: string }> {
  const apiKey = env.FIREBASE_API_KEY;
  if (!apiKey) return { error: t.unavailable };

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      cache: "no-store",
    }
  );

  if (response.ok) {
    const data = (await response.json()) as { idToken: string };
    return { idToken: data.idToken };
  }

  const data = (await response.json().catch(() => null)) as {
    error?: { message?: string };
  } | null;
  if (data?.error?.message?.startsWith("TOO_MANY_ATTEMPTS")) {
    return { error: t.tooManyAttempts };
  }
  // Mensagem genérica: não revela se o e-mail existe
  return { error: t.invalidCredentials };
}

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const t = dashboard[await getRequestLocale()].login;
  const validatedFields = loginSchema(t).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      message: t.fixErrors,
      error: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  if (!isAdminConfigured()) {
    console.error(
      "Login bloqueado: FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY ausentes."
    );
    return { message: t.unavailable, success: false };
  }

  const { email, password } = validatedFields.data;

  // Força bruta: 5 tentativas/min por IP e 5 a cada 15 min por e-mail
  const ipLimit = rateLimit(`login:ip:${await actionClientIp()}`, 5, 60 * 1000);
  const emailLimit = rateLimit(`login:email:${email.toLowerCase()}`, 5, 15 * 60 * 1000);
  if (!ipLimit.allowed || !emailLimit.allowed) {
    return { message: t.tooManyAttempts, success: false };
  }

  if (!isAllowedAdmin(email)) {
    return { message: t.invalidCredentials, success: false };
  }

  try {
    const result = await signInWithPassword(email, password, t);
    if ("error" in result) return { message: result.error, success: false };

    // Confere o token no servidor antes de emitir a sessão
    const decoded = await (await adminAuth()).verifyIdToken(result.idToken);
    if (!isAllowedAdmin(decoded.email)) {
      return { message: t.invalidCredentials, success: false };
    }

    const sessionCookie = await (await adminAuth()).createSessionCookie(
      result.idToken,
      { expiresIn: SESSION_MAX_AGE_SECONDS * 1000 }
    );

    const cookieStore = await cookies();
    cookieStore.set({
      name: SESSION_COOKIE,
      value: sessionCookie,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return { message: t.success, success: true };
  } catch (error) {
    console.error("Erro ao criar sessão:", error);
    return { message: t.failed, success: false };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  cookieStore.delete(SESSION_COOKIE);

  // Revoga os refresh tokens para invalidar a sessão em todos os dispositivos
  if (sessionCookie && isAdminConfigured()) {
    try {
      const decoded = await (await adminAuth()).verifySessionCookie(sessionCookie);
      await (await adminAuth()).revokeRefreshTokens(decoded.sub);
    } catch {
      // Cookie já inválido/expirado: nada a revogar
    }
  }

  redirect(localePath(await getRequestLocale(), "/login"));
}
