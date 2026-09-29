"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Tema claro/escuro. Começa pela preferência do sistema operacional (acessibilidade)
 * e lembra a escolha do usuário. Aplica a classe "dark" (Tailwind/shadcn) e o
 * atributo data-theme (daisyUI) no <html>.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute={["class", "data-theme"]}
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
