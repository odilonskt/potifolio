"use client";

import { Box, Code, Folder, Home, Info, Mail, Newspaper, Route } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { cn } from "@/lib/utils";

// Âncoras com "/" na frente funcionam tanto na home quanto em /blog
const MENU_ITEMS = [
  { label: "Início", href: "/#start", icon: Home, mobile: true },
  { label: "Sobre", href: "/#meio", icon: Info, mobile: true },
  { label: "Trajetória", href: "/#Trajetoria", icon: Route, mobile: true },
  { label: "Tecnologias", href: "/#Tecnologia", icon: Code, mobile: false },
  { label: "Destaque", href: "/#Destaque", icon: Box, mobile: false },
  { label: "Projetos", href: "/#Projeto", icon: Folder, mobile: true },
  { label: "Blog", href: "/blog", icon: Newspaper, mobile: true },
  { label: "Contato", href: "/#Contato", icon: Mail, mobile: true },
];

// No celular cabem 6 itens com área de toque confortável (≥ 44px)
const MOBILE_ITEMS = MENU_ITEMS.filter((item) => item.mobile);

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export default function ResponsiveNav() {
  const pathname = usePathname();
  const isCurrent = (href: string) => href === "/blog" && pathname.startsWith("/blog");

  return (
    <>
      {/* ========== DESKTOP ========== */}
      <header className="fixed inset-x-0 top-3 z-50 hidden justify-center px-4 md:flex">
        <nav
          aria-label="Navegação principal"
          className="flex items-center gap-1 rounded-full border border-border bg-background/80 p-1.5 shadow-sm backdrop-blur-md"
        >
          <ul className="flex items-center gap-0.5">
            {MENU_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                  className={cn(
                    "block rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:px-4",
                    "aria-[current=page]:bg-foreground aria-[current=page]:text-background",
                    focusRing,
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />
          <AnimatedThemeToggler
            className={cn(
              "flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&_svg]:size-4",
              focusRing,
            )}
          />
        </nav>
      </header>

      {/* ========== CELULAR ========== */}
      <AnimatedThemeToggler
        className={cn(
          "fixed top-3 right-3 z-50 flex size-11 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-sm backdrop-blur-md md:hidden [&_svg]:size-5",
          focusRing,
        )}
      />

      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <ul className="grid grid-cols-6">
          {MOBILE_ITEMS.map(({ label, href, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={isCurrent(href) ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-muted-foreground transition-colors hover:text-foreground",
                  "aria-[current=page]:text-foreground",
                  focusRing,
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span className="w-full truncate text-center text-[11px]">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
