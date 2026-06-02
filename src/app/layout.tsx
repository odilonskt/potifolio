import Footer from "@/components/footer/page";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GitHubUserProvider } from "@/context/github-user-context";
import { getGitHubUser } from "@/lib/github";
import { env } from "@/lib/env";

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
    <html lang="pt-BR" className="scroll-smooth dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100`}
      >
        <GitHubUserProvider initialData={githubUser}>
          {children}
          <Footer />
        </GitHubUserProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
