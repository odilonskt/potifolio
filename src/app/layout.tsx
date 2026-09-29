import Footer from "@/components/footer/page";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { GitHubUserProvider } from "@/context/github-user-context";
import { env } from "@/lib/env";
import { getGitHubUser } from "@/lib/github";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import type React from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Odilon - Portfólio",
  description:
    "Portfólio de Odilon, desenvolvedor full-stack apaixonado por criar soluções inovadoras e impactantes. Explore meus projetos, habilidades e experiência para conhecer meu trabalho e minha jornada na área de desenvolvimento.",
  generator: "Next.js",
  // <CHANGE> Removed icon.svg reference that was causing 404 errors
  icons: {
    icon: "/favicon.svg", // ✅ caminho para o favicon
    shortcut: "/favicon.svg", // opcional, para navegadores que usam shortcut icon
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let githubUser = null;
  try {
    githubUser = await getGitHubUser(env.GITHUB_USERNAME);
  } catch (error) {
    console.error("Error fetching GitHub user in layout:", error);
  }
  return (
    // suppressHydrationWarning: o next-themes ajusta class/data-theme do <html> antes da hidratação
    <html lang="pt-BR" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-dvh flex-col bg-background text-foreground`}
      >
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Pular para o conteúdo
        </a>
        <ThemeProvider>
          <GitHubUserProvider initialData={githubUser}>
            <div className="flex-1">{children}</div>
            <Footer />
          </GitHubUserProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
