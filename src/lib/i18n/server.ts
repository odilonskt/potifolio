// lib/i18n/server.ts
// Idioma atual no servidor.
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { lang } from "next/root-params";

import { isLocale, LOCALE_COOKIE, negotiateLocale, type Locale } from "./config";

/** Server Components (páginas, layouts): vem do segmento /[lang] da URL. */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!isLocale(value)) notFound();
  return value;
}

/**
 * Server Actions e Route Handlers (onde root-params não funciona): cookie gravado
 * pelo proxy na última página visitada; sem cookie, o idioma do navegador.
 */
export async function getRequestLocale(): Promise<Locale> {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  return negotiateLocale((await headers()).get("accept-language"));
}

/** Mensagens de um módulo no idioma da página (Server Components). */
export async function getMessages<T>(messages: Record<Locale, T>): Promise<T> {
  return messages[await getLocale()];
}
