"use client";

import { Inbox, Newspaper, Route } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Contatos", icon: Inbox },
  { href: "/dashboard/trajetoria", label: "Trajetória", icon: Route },
  { href: "/dashboard/blog", label: "Blog", icon: Newspaper },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Seções do painel" className="border-b border-border bg-card/60 backdrop-blur">
      <ul className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 py-2 sm:px-6">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring",
                  active && "bg-secondary text-foreground"
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
