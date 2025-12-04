"use client";

import { Button } from "@/components/ui/button";
import { GithubIcon, LinkedinIcon } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-slate-950 border-b border-cyan-500/20 backdrop-blur-md sticky top-0 z-50">
      {/* Neon top line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-cyan-500 via-purple-600 to-green-500 opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Name */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-cyan-500 to-purple-500 rounded-lg blur opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-slate-950 rounded-lg px-3 py-2">
                <span className="font-bold text-lg text-cyan-400 neon-text">
                  Odilon
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Início", href: "#start" },
              { label: "Sobre", href: "#meio" },
              { label: "Tecnologias", href: "#Tecnologia" },
              { label: "Projetos", href: "#Projeto" },
              { label: "Contato", href: "#Contato" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-cyan-400 transition-colors duration-300 relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-cyan-400 to-purple-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              asChild
              className="border-cyan-500/50 hover:border-cyan-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all duration-300"
            >
              <Link
                href="https://github.com/odilonskt"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GithubIcon className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              asChild
              className="border-purple-500/50 hover:border-purple-400 hover:text-purple-400 hover:bg-purple-400/10 transition-all duration-300"
            >
              <Link
                href="https://linkedin.com/in/odilon-santos"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedinIcon className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
