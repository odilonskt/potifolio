// lib/i18n/config.ts
// Idiomas do site. Funciona no servidor e no cliente (sem segredos aqui).

export const LOCALES = ["pt", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "pt";

/** Cookie com o idioma escolhido (gravado pelo proxy a cada página visitada) */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Valor do atributo lang do <html> e locale do Intl (datas, números) */
export const HTML_LANG: Record<Locale, string> = { pt: "pt-BR", en: "en", es: "es" };

/** Nome de cada idioma escrito nele mesmo (o seletor mostra assim) */
export const LOCALE_NAMES: Record<Locale, string> = { pt: "Português", en: "English", es: "Español" };

/** Open Graph usa sublinhado: pt_BR */
export const OG_LOCALE: Record<Locale, string> = { pt: "pt_BR", en: "en_US", es: "es_ES" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** "/blog" → "/en/blog"; hashes e âncoras continuam funcionando ("/#Contato" → "/en#Contato") */
export function localePath(locale: Locale, path = "/"): string {
  if (path === "/" || path === "") return `/${locale}`;
  if (path.startsWith("/#")) return `/${locale}${path.slice(1)}`;
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Remove o prefixo de idioma: "/en/blog/x" → "/blog/x" */
export function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split("/");
  return isLocale(first) ? `/${rest.join("/")}` : pathname;
}

/**
 * Escolhe o idioma pelo cabeçalho Accept-Language do navegador (o idioma da máquina).
 * "es-MX,es;q=0.9,en;q=0.8" → "es". Sem correspondência, português.
 */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const ranked = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((param) => param.trim()).find((param) => param.startsWith("q="));
      const quality = q ? Number(q.slice(2)) : 1;
      return { base: tag.toLowerCase().split("-")[0], quality: Number.isFinite(quality) ? quality : 0, index };
    })
    .filter((entry) => entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);
  return ranked.map((entry) => entry.base).find(isLocale) ?? DEFAULT_LOCALE;
}

/**
 * canonical + hreflang de uma rota ("/blog"), para o Google indexar cada idioma
 * e mostrar a versão certa para cada pessoa.
 */
export function languageAlternates(locale: Locale, route = "/") {
  const languages: Record<string, string> = Object.fromEntries(
    LOCALES.map((option) => [HTML_LANG[option], localePath(option, route)]),
  );
  languages["x-default"] = localePath(DEFAULT_LOCALE, route);
  return { canonical: localePath(locale, route), languages };
}
