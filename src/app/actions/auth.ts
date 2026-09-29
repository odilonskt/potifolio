"use server";

import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  isAllowedAdmin,
} from "@/lib/auth/session";
import { env } from "@/lib/env";
import { adminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import { actionClientIp, rateLimit } from "@/lib/security/request-guard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Email inválido").max(254),
  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(128),
});

export type LoginFormState = {
  message: string;
  error?: {
    email?: string[];
    password?: string[];
  };
  success?: boolean;
};

const INVALID_CREDENTIALS = "Credenciais inválidas";

/**
 * Autentica pela API REST do Firebase Auth (sem estado compartilhado entre requests)
 * e devolve o ID token recém-emitido.
 */
async function signInWithPassword(
  email: string,
  password: string
): Promise<{ idToken: string } | { error: string }> {
  const apiKey = env.FIREBASE_API_KEY;
  if (!apiKey) return { error: "Serviço de login indisponível" };

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
    return { error: "Muitas tentativas. Tente novamente mais tarde" };
  }
  // Mensagem genérica: não revela se o e-mail existe
  return { error: INVALID_CREDENTIALS };
}

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      message: "Por favor, corrija os erros abaixo.",
      error: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  if (!isAdminConfigured()) {
    console.error(
      "Login bloqueado: FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY ausentes."
    );
    return { message: "Serviço de login indisponível", success: false };
  }

  const { email, password } = validatedFields.data;

  // Força bruta: 5 tentativas/min por IP e 5 a cada 15 min por e-mail
  const ipLimit = rateLimit(`login:ip:${await actionClientIp()}`, 5, 60 * 1000);
  const emailLimit = rateLimit(`login:email:${email.toLowerCase()}`, 5, 15 * 60 * 1000);
  if (!ipLimit.allowed || !emailLimit.allowed) {
    return { message: "Muitas tentativas. Aguarde alguns minutos e tente de novo.", success: false };
  }

  if (!isAllowedAdmin(email)) {
    return { message: INVALID_CREDENTIALS, success: false };
  }

  try {
    const result = await signInWithPassword(email, password);
    if ("error" in result) return { message: result.error, success: false };

    // Confere o token no servidor antes de emitir a sessão
    const decoded = await (await adminAuth()).verifyIdToken(result.idToken);
    if (!isAllowedAdmin(decoded.email)) {
      return { message: INVALID_CREDENTIALS, success: false };
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

    return { message: "Login realizado com sucesso!", success: true };
  } catch (error) {
    console.error("Erro ao criar sessão:", error);
    return { message: "Não foi possível entrar agora. Tente novamente em alguns instantes.", success: false };
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

  redirect("/login");
}
