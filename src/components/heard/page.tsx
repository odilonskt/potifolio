"use client";

import { Box, Code, Folder, Home, Info, Mail, Newspaper, Route } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useLocale, useMessages } from "@/lib/i18n/client";
import { localePath, stripLocale } from "@/lib/i18n/config";
import { common } from "@/lib/i18n/messages/common";
import { cn } from "@/lib/utils";

// Âncoras com "/" na frente funcionam tanto na home quanto em /blog
const MENU_ITEMS = [
  { key: "home", href: "/#start", icon: Home, mobile: true },
  { key: "about", href: "/#meio", icon: Info, mobile: true },
  { key: "journey", href: "/#Trajetoria", icon: Route, mobile: true },
  { key: "technologies", href: "/#Tecnologia", icon: Code, mobile: false },
  { key: "highlight", href: "/#Destaque", icon: Box, mobile: false },
  { key: "projects", href: "/#Projeto", icon: Folder, mobile: true },
  { key: "blog", href: "/blog", icon: Newspaper, mobile: true },
  { key: "contact", href: "/#Contato", icon: Mail, mobile: true },
] as const;

// No celular cabem 6 itens com área de toque confortável (≥ 44px)
const MOBILE_ITEMS = MENU_ITEMS.filter((item) => item.mobile);

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export default function ResponsiveNav() {
  const locale = useLocale();
  const t = useMessages(common);
  const route = stripLocale(usePathname());
  const isCurrent = (href: string) => href === "/blog" && route.startsWith("/blog");

  return (
    <>
      {/* ========== DESKTOP ========== */}
      <header className="fixed inset-x-0 top-3 z-50 hidden justify-center px-4 md:flex print:hidden">
        <nav
          aria-label={t.nav.label}
          className="flex items-center gap-1 rounded-full border border-border bg-background/80 p-1.5 shadow-sm backdrop-blur-md"
        >
          <ul className="flex items-center gap-0.5">
            {MENU_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={localePath(locale, item.href)}
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                  className={cn(
                    "block rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:px-4",
                    "aria-[current=page]:bg-foreground aria-[current=page]:text-background",
                    focusRing,
                  )}
                >
                  {t.nav[item.key]}
                </Link>
              </li>
            ))}
          </ul>
          <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />
          <LanguageSwitcher className="h-9 px-2.5" />
          <AnimatedThemeToggler
            className={cn(
              "flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&_svg]:size-4",
              focusRing,
            )}
          />
        </nav>
      </header>

      {/* ========== CELULAR ========== */}
      <div className="fixed top-3 right-3 z-50 flex items-center gap-2 md:hidden print:hidden">
        <LanguageSwitcher
          showLabel
          className="h-11 border border-border bg-background/80 px-3 text-foreground shadow-sm backdrop-blur-md"
        />
        <AnimatedThemeToggler
          className={cn(
            "flex size-11 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-sm backdrop-blur-md [&_svg]:size-5",
            focusRing,
          )}
        />
      </div>

      <nav
        aria-label={t.nav.label}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden print:hidden"
      >
        <ul className="grid grid-cols-6">
          {MOBILE_ITEMS.map(({ key, href, icon: Icon }) => (
            <li key={href}>
              <Link
                href={localePath(locale, href)}
                aria-current={isCurrent(href) ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-muted-foreground transition-colors hover:text-foreground",
                  "aria-[current=page]:text-foreground",
                  focusRing,
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span className="w-full truncate text-center text-[11px]">{t.nav[key]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
