"use client";

import { createContext, useContext } from "react";

import { DEFAULT_LOCALE, type Locale } from "./config";
import type { Messages } from "./messages";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** Mensagens de um módulo no idioma atual (Client Components). */
export function useMessages<T>(messages: Messages<T>): T {
  return messages[useLocale()];
}
