"use client";

import { FileText, FolderKanban, Inbox, Newspaper, Route } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useLocale } from "@/lib/i18n/client";
import { localePath, stripLocale } from "@/lib/i18n/config";
import { dashboard } from "@/lib/i18n/messages/dashboard";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", key: "contacts", icon: Inbox },
  { href: "/dashboard/trajetoria", key: "journey", icon: Route },
  { href: "/dashboard/projetos", key: "projects", icon: FolderKanban },
  { href: "/dashboard/blog", key: "blog", icon: Newspaper },
  { href: "/dashboard/curriculo", key: "resume", icon: FileText },
] as const;

export function DashboardNav() {
  const locale = useLocale();
  const t = dashboard[locale].nav;
  const pathname = stripLocale(usePathname());

  return (
    <nav aria-label={t.label} className="-mx-1 overflow-x-auto">
      <ul className="flex gap-1 px-1">
        {LINKS.map(({ href, key, icon: Icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={localePath(locale, href)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  "aria-[current=page]:bg-muted aria-[current=page]:text-foreground",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {t[key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
