// lib/content/translations.ts
// Conteúdo do painel em outros idiomas. O português é o texto base; cada documento
// pode ter `translations.en` e `translations.es` com os campos traduzidos. O que
// estiver vazio cai para o português.
import { z } from "zod";

import type { Locale } from "@/lib/i18n/config";

export const TRANSLATED_LOCALES = ["en", "es"] as const;
export type TranslatedLocale = (typeof TRANSLATED_LOCALES)[number];

export type Translations<T> = Partial<Record<TranslatedLocale, Partial<T>>>;

/** Aplica a tradução do idioma, campo a campo, sem apagar o português quando vazio. */
export function localize<T extends { translations?: Translations<Partial<T>> }>(item: T, locale: Locale): T {
  if (locale === "pt") return item;
  const translated = item.translations?.[locale];
  if (!translated) return item;
  const merged = { ...item };
  for (const [key, value] of Object.entries(translated)) {
    if (typeof value === "string" && value.trim() !== "") (merged as Record<string, unknown>)[key] = value;
  }
  return merged;
}

/**
 * Lê os campos traduzidos de um formulário ("en.title", "es.title"...), validando
 * só o tamanho: traduções são opcionais. Devolve apenas o que foi preenchido.
 */
export function readTranslations<K extends string>(
  formData: FormData,
  limits: Record<K, number>,
): { ok: true; data: Translations<Record<K, string>> } | { ok: false; field: string; max: number } {
  const data: Translations<Record<K, string>> = {};
  for (const locale of TRANSLATED_LOCALES) {
    const fields: Partial<Record<K, string>> = {};
    for (const [key, max] of Object.entries(limits) as [K, number][]) {
      const raw = formData.get(`${locale}.${key}`);
      const value = typeof raw === "string" ? raw.trim() : "";
      if (!value) continue;
      if (!z.string().max(max).safeParse(value).success) return { ok: false, field: `${locale}.${key}`, max };
      fields[key] = value;
    }
    if (Object.keys(fields).length > 0) data[locale] = fields;
  }
  return { ok: true, data };
}
