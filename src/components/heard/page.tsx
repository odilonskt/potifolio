"use client";

import { Box, Code, Folder, Home, Info, Mail, Newspaper, Route } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

// Âncoras com "/" na frente funcionam tanto na home quanto em /blog
const menuItems = [
  { label: "Intro", href: "/#start", icon: Home, mobile: true },
  { label: "Sobre", href: "/#meio", icon: Info, mobile: true },
  { label: "Trajetória", href: "/#Trajetoria", icon: Route, mobile: true },
  { label: "Tech", href: "/#Tecnologia", icon: Code, mobile: false },
  { label: "3D", href: "/#Destaque", icon: Box, mobile: false },
  { label: "Projeto", href: "/#Projeto", icon: Folder, mobile: true },
  { label: "Blog", href: "/blog", icon: Newspaper, mobile: true },
  { label: "Contato", href: "/#Contato", icon: Mail, mobile: true },
];

// No celular cabem 6 itens com alvo de toque confortável; Tech e 3D ficam só na rolagem
const mobileItems = menuItems.filter((item) => item.mobile);

export default function ResponsiveNav() {
  const pathname = usePathname();
  const isCurrent = (href: string) => href === "/blog" && pathname.startsWith("/blog");

  return (
    <>
      {/* ========== TEMA (CELULAR) ========== */}
      <AnimatedThemeToggler
        className="fixed top-3 right-3 z-50 flex size-11 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-md backdrop-blur md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:size-5"
      />

      {/* ========== DOCK MOBILE (COM NEON) ========== */}
      <nav aria-label="Navegação principal" className="fixed bottom-0 left-0 z-50 w-full md:hidden">
        {/* Neon glow por trás da dock */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-t-2xl blur-xl bg-gradient-to-r from-cyan-400 via-purple-500 to-green-400 opacity-70"
          suppressHydrationWarning
        />
        {/* Dock com fundo semi-transparente e blur */}
        <div className="dock relative bg-neutral-900/90 text-white backdrop-blur-sm">
          {mobileItems.map((item) => {
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
            <li className="ml-1 flex items-center">
              <AnimatedThemeToggler className="flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-cyan-400 [&_svg]:size-5" />
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}
