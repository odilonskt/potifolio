"use client";

import { Home, Info, Code, Box, Folder, Mail } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Intro: Home,
  Sobre: Info,
  Tech: Code,
  "3D": Box,
  Projeto: Folder,
  Contato: Mail,
};

const menuItems = [
  { label: "Intro", href: "#start" },
  { label: "Sobre", href: "#meio" },
  { label: "Tech", href: "#Tecnologia" },
  { label: "3D", href: "#Destaque" },
  { label: "Projeto", href: "#Projeto" },
  { label: "Contato", href: "#Contato" },
];

export default function ResponsiveNav() {
  return (
    <>
      {/* ========== DOCK MOBILE (COM NEON) ========== */}
      <div className="fixed bottom-0 left-0 z-50 w-full md:hidden">
        {/* Neon glow por trás da dock */}
        <div
          className="absolute inset-0 rounded-t-2xl blur-xl bg-gradient-to-r from-cyan-400 via-purple-500 to-green-400 opacity-70"
          suppressHydrationWarning
        />
        {/* Dock com fundo semi-transparente e blur */}
        <div className="dock bg-neutral/90 text-neutral-content backdrop-blur-sm relative">
          {menuItems.map((item) => {
            const Icon = iconMap[item.label];
            return (
              <a
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1"
              >
                {Icon && <Icon className="size-[1.2em]" />}
                <span className="dock-label text-xs">{item.label}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* ========== HEADER DESKTOP (COM NEON) ========== */}
      <header className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-[90%] md:w-[85%] max-w-4xl hidden md:block">
        <div
          className="absolute inset-0 rounded-full blur-xl bg-gradient-to-r from-cyan-400 via-purple-500 to-green-400 opacity-70"
          suppressHydrationWarning
        />
        <nav className="navbar bg-neutral-900/90 text-white rounded-full shadow-xl border border-neutral-800 backdrop-blur-md relative">
          <ul className="menu menu-horizontal gap-1 sm:gap-2 md:gap-3 mx-auto">
            {menuItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="btn btn-ghost btn-xs sm:btn-sm md:btn-md text-white hover:text-black hover:bg-cyan-400 transition-all duration-300 rounded-full"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </>
  );
}
