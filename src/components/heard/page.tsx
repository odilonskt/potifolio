"use client";

import { Box, Code, Folder, Home, Info, Mail, Newspaper, Route } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Âncoras com "/" na frente funcionam tanto na home quanto em /blog
const menuItems = [
  { label: "Intro", href: "/#start", icon: Home },
  { label: "Sobre", href: "/#meio", icon: Info },
  { label: "Trajetória", href: "/#Trajetoria", icon: Route },
  { label: "Tech", href: "/#Tecnologia", icon: Code },
  { label: "3D", href: "/#Destaque", icon: Box },
  { label: "Projeto", href: "/#Projeto", icon: Folder },
  { label: "Blog", href: "/blog", icon: Newspaper },
  { label: "Contato", href: "/#Contato", icon: Mail },
];

export default function ResponsiveNav() {
  const pathname = usePathname();
  const isCurrent = (href: string) => href === "/blog" && pathname.startsWith("/blog");

  return (
    <>
      {/* ========== DOCK MOBILE (COM NEON) ========== */}
      <nav aria-label="Navegação principal" className="fixed bottom-0 left-0 z-50 w-full md:hidden">
        {/* Neon glow por trás da dock */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-t-2xl blur-xl bg-gradient-to-r from-cyan-400 via-purple-500 to-green-400 opacity-70"
          suppressHydrationWarning
        />
        {/* Dock com fundo semi-transparente e blur */}
        <div className="dock bg-neutral/90 text-neutral-content backdrop-blur-sm relative">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isCurrent(item.href) ? "page" : undefined}
                className="flex min-w-0 flex-col items-center justify-center gap-1 focus-visible:outline-2 focus-visible:outline-cyan-400"
              >
                <Icon className="size-[1.2em]" aria-hidden="true" />
                <span className="dock-label truncate text-[10px] xs:text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ========== HEADER DESKTOP (COM NEON) ========== */}
      <header className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-[90%] md:w-[85%] max-w-5xl hidden md:block">
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full blur-xl bg-gradient-to-r from-cyan-400 via-purple-500 to-green-400 opacity-70"
          suppressHydrationWarning
        />
        <nav
          aria-label="Navegação principal"
          className="navbar bg-neutral-900/90 text-white rounded-full shadow-xl border border-neutral-800 backdrop-blur-md relative"
        >
          <ul className="menu menu-horizontal gap-1 lg:gap-2 mx-auto">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                  className="btn btn-ghost btn-sm lg:btn-md text-white hover:text-black hover:bg-cyan-400 aria-[current=page]:bg-cyan-400 aria-[current=page]:text-black transition-all duration-300 rounded-full focus-visible:outline-2 focus-visible:outline-cyan-400"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </>
  );
}
