import Footer from "@/components/footer/page";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { GitHubUserProvider } from "@/context/github-user-context";
import { env } from "@/lib/env";
import { getGitHubUser } from "@/lib/github";
import { LocaleProvider } from "@/lib/i18n/client";
import { HTML_LANG, languageAlternates, LOCALES, OG_LOCALE } from "@/lib/i18n/config";
import { common } from "@/lib/i18n/messages/common";
import { getLocale } from "@/lib/i18n/server";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import type React from "react";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// As três versões de cada página são geradas no build
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = common[locale];
  return {
    title: t.meta.title,
    description: t.meta.description,
    generator: "Next.js",
    alternates: languageAlternates(locale),
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((option) => option !== locale).map((option) => OG_LOCALE[option]),
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  const t = common[locale];
  let githubUser = null;
  try {
    githubUser = await getGitHubUser(env.GITHUB_USERNAME);
  } catch (error) {
    console.error("Error fetching GitHub user in layout:", error);
  }
  return (
    // suppressHydrationWarning: o next-themes ajusta class/data-theme do <html> antes da hidratação
    <html lang={HTML_LANG[locale]} className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-dvh flex-col bg-background text-foreground`}
      >
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          {t.skipToContent}
        </a>
        <LocaleProvider locale={locale}>
        <ThemeProvider>
          <GitHubUserProvider initialData={githubUser}>
            <div className="flex-1">{children}</div>
            <Footer />
          </GitHubUserProvider>
        </ThemeProvider>
        </LocaleProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
