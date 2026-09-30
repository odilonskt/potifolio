"use client"; // Error boundaries precisam ser Client Components

import "./globals.css";

import { useEffect, useSyncExternalStore } from "react";

import { StatusPage } from "@/components/status/status-page";
import { THEME_STORAGE_KEY } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { DEFAULT_LOCALE, HTML_LANG, isLocale, localePath, type Locale } from "@/lib/i18n/config";
import { common } from "@/lib/i18n/messages/common";

const subscribeNoop = () => () => {};

/** Fora do layout não há LocaleProvider: o idioma vem do primeiro segmento da URL */
function localeFromUrl(): Locale {
  const first = window.location.pathname.split("/")[1];
  return isLocale(first) ? first : DEFAULT_LOCALE;
}

/**
 * Falha no próprio layout raiz. Substitui o documento inteiro, então precisa de
 * <html>/<body> próprios e aplica o tema salvo (o ThemeProvider não roda aqui).
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const locale = useSyncExternalStore(subscribeNoop, localeFromUrl, () => DEFAULT_LOCALE);
  const t = common[locale].status;

  useEffect(() => {
    console.error(error);
    let theme: string | null = null;
    try {
      theme = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      // Armazenamento bloqueado: segue a preferência do sistema
    }
    const dark =
      theme === "dark" || ((!theme || theme === "system") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }, [error]);

  return (
    <html lang={HTML_LANG[locale]} suppressHydrationWarning>
      <body className="antialiased">
        <title>{`${t.errorCode(500)} | Odilon`}</title>
        <StatusPage code={500} codeLabel={t.errorCode(500)} title={t.globalErrorTitle} description={t.globalErrorDescription}>
          <Button onClick={() => retry()}>{t.retry}</Button>
          {/* <a> em vez de <Link>: o roteador pode estar indisponível aqui */}
          <Button asChild variant="outline">
            <a href={localePath(locale)}>{t.goHome}</a>
          </Button>
          {error.digest && (
            <p className="w-full text-xs text-muted-foreground">
              {t.errorDigest} <code className="font-mono">{error.digest}</code>
            </p>
          )}
        </StatusPage>
      </body>
    </html>
  );
}
