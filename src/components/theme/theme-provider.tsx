"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/** Chave nova: descarta escolhas antigas gravadas, todo mundo recomeça pelo sistema. */
export const THEME_STORAGE_KEY = "tema";

/**
 * Tema claro/escuro. Segue a preferência do sistema operacional (acessibilidade)
 * até o usuário escolher outro; voltar ao tema do sistema volta a segui-lo. Aplica a classe "dark" (Tailwind/shadcn) e o
 * atributo data-theme (daisyUI) no <html>.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute={["class", "data-theme"]}
      defaultTheme="system"
      enableSystem
      storageKey={THEME_STORAGE_KEY}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
