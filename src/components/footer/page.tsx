"use client";

import { useGitHubUserContext } from "@/context/github-user-context";
import { Github, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";
import NextLink from "next/link";

// Componente SocialButton (mantido igual)
function SocialButton({
  href,
  icon: Icon,
  gradientFrom,
  gradientTo,
}: {
  href: string;
  icon: typeof Github;
  gradientFrom: string;
  gradientTo: string;
}) {
  return (
    <NextLink href={href} target="_blank" className="group">
      <div className="relative" suppressHydrationWarning>
        <div
          className={`absolute inset-0 bg-linear-to-r ${gradientFrom} ${gradientTo} rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300 -z-10`}
          suppressHydrationWarning
        />
        <div
          className="relative bg-black rounded-full p-2 xs:p-2.5 sm:p-3"
          suppressHydrationWarning
        >
          <Icon
            size={24}
            className="xs:w-8 xs:h-8 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform duration-200"
            color="white"
          />
        </div>
      </div>
    </NextLink>
  );
}

interface GitHubUser {
  created_at: string;
  name?: string;
  bio?: string;
  location?: string;
  public_repos?: number;
  public_gists?: number;
  followers?: number;
  following?: number;
  avatar_url?: string;
}

export default function Footer() {
  const { githubData, loading } = useGitHubUserContext();

  return (
    <footer
      className="footer sm:footer-horizontal bg-black text-white border-t border-gray-800 p-4 px-4 md:px-20 items-center pb-24 md:pb-4 max-sm:flex-col max-sm:gap-4"
      suppressHydrationWarning
    >
      {/* Lado esquerdo: logo e informações do GitHub */}
      <aside className="flex items-center gap-3 max-xs:flex-col max-xs:text-center">
        <Image
          src="/favicon.svg"
          alt="Logo Odilon"
          width={40}
          height={40}
          className="rounded-lg shrink-0"
          priority
        />
        <div>
          <span className="font-medium text-lg block">Odilon</span>
          {loading ? (
            <div className="text-xs text-gray-500 animate-pulse">
              Carregando dados do GitHub...
            </div>
          ) : githubData?.created_at ? (
            <div className="text-xs text-gray-400">
              Desenvolvedor desde{" "}
              <span className="text-blue-400 font-semibold whitespace-nowrap">
                {new Date(githubData.created_at).toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          ) : (
            <div className="text-xs text-gray-500">
              Dados do GitHub indisponíveis
            </div>
          )}
        </div>
      </aside>

      {/* Lado direito: ícones sociais com tooltip */}
      <nav className="flex gap-4 md:place-self-center md:justify-self-end max-xs:gap-3">
        <div
          className="tooltip max-sm:tooltip-bottom sm:tooltip-top"
          data-tip="GitHub"
        >
          <SocialButton
            href="https://github.com/odilonskt"
            icon={Github}
            gradientFrom="from-gray-500"
            gradientTo="to-gray-700"
          />
        </div>
        <div
          className="tooltip max-sm:tooltip-bottom sm:tooltip-top"
          data-tip="LinkedIn"
        >
          <SocialButton
            href="https://linkedin.com/in/odilon-dev"
            icon={Linkedin}
            gradientFrom="from-blue-500"
            gradientTo="to-blue-700"
          />
        </div>
        <div
          className="tooltip max-sm:tooltip-bottom sm:tooltip-top"
          data-tip="Instagram"
        >
          <SocialButton
            href="https://www.instagram.com/odilon_skt/"
            icon={Instagram}
            gradientFrom="from-pink-500"
            gradientTo="to-purple-600"
          />
        </div>
      </nav>
    </footer>
  );
}
