"use client";

import { Github, Instagram, Linkedin } from "lucide-react";
import { usePathname } from "next/navigation";

import { BrandMark } from "@/components/brand-mark";
import { useGitHubUserContext } from "@/context/github-user-context";
import { PROFILE, SOCIAL_LINKS, type SocialName } from "@/lib/content/profile";
import { useLocale } from "@/lib/i18n/client";
import { HTML_LANG, stripLocale } from "@/lib/i18n/config";
import { common } from "@/lib/i18n/messages/common";

const ICONS: Record<SocialName, typeof Github> = {
  GitHub: Github,
  LinkedIn: Linkedin,
  Instagram: Instagram,
};

// Área administrativa tem layout próprio, sem o rodapé público
const HIDDEN_ON = ["/dashboard", "/login"];


export default function Footer() {
  const { githubData } = useGitHubUserContext();
  const locale = useLocale();
  const t = common[locale].footer;
  const route = stripLocale(usePathname());
  if (HIDDEN_ON.some((prefix) => route.startsWith(prefix))) return null;
  const monthYear = new Intl.DateTimeFormat(HTML_LANG[locale], { month: "long", year: "numeric" });

  return (
    // pb extra no celular: espaço para a barra de navegação fixa
    <footer className="border-t border-border bg-background pb-24 md:pb-0 print:hidden">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <BrandMark />
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{PROFILE.name}</span>
            {githubData?.created_at && (
              <span className="text-sm text-muted-foreground">
                {t.codingSince}{" "}
                <time dateTime={githubData.created_at}>{monthYear.format(new Date(githubData.created_at))}</time>
              </span>
            )}
          </div>
        </div>

        <nav aria-label={t.socialLabel}>
          <ul className="flex gap-2">
            {SOCIAL_LINKS.map(({ name, href }) => {
              const Icon = ICONS[name];
              return (
                <li key={name}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${name} (${t.opensInNewTab})`}
                    title={name}
                    className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
