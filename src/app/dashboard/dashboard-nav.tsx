"use client";

import { FileText, FolderKanban, Inbox, Newspaper, Route } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Contatos", icon: Inbox },
  { href: "/dashboard/trajetoria", label: "Trajetória", icon: Route },
  { href: "/dashboard/projetos", label: "Projetos", icon: FolderKanban },
  { href: "/dashboard/blog", label: "Blog", icon: Newspaper },
  { href: "/dashboard/curriculo", label: "Currículo", icon: FileText },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Seções do painel" className="-mx-1 overflow-x-auto">
      <ul className="flex gap-1 px-1">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  "aria-[current=page]:bg-muted aria-[current=page]:text-foreground",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
