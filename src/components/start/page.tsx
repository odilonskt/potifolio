"use client";
import { Download, Github, Linkedin } from "@deemlol/next-icons";
import { Mail } from "lucide-react";
import Image from "next/image";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface StartProps {
  id: string;
}

interface GitHubUser {
  name: string;
  bio: string;
  location: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  avatar_url: string;
}

interface StatItem {
  label: string;
  value: number;
  icon: string;
  color: string;
}

/// Componente: Foto de Perfil
function ProfileImage() {
  const hasExtraImages = true; // Mude para false se não tiver as imagens extras

  return (
    <div className="flex items-center justify-center shrink-0 relative group w-full lg:w-auto">
      <div className="absolute inset-0 bg-linear-to-r from-blue-500 via-purple-600 to-green-500 rounded-2xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

      {hasExtraImages ? (
        // Versão com hover-gallery
        <figure className="hover-gallery relative w-24 h-24 xs:w-28 xs:h-28 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72">
          <Image
            src="/perfil.svg"
            alt="Foto de perfil de Odilon - Desenvolvedor Full-Stack"
            width={450}
            height={450}
            priority={true}
            className="rounded-xl object-cover shadow-2xl border-3 xs:border-4 border-gray-800"
          />
          <Image
            src="/perfil-3.jpeg"
            alt="Odilon trabalhando em projeto"
            width={450}
            height={450}
            className="rounded-xl object-cover shadow-2xl border-3 xs:border-4 border-gray-800"
          />
          <Image
            src="/perfil-4.jpeg"
            alt="Odilon em reunião ou apresentação"
            width={450}
            height={450}
            className="rounded-xl object-cover shadow-2xl border-3 xs:border-4 border-gray-800"
          />

          {/* Indicador de que é uma galeria */}
        </figure>
      ) : (
        // Versão simples sem hover-gallery (fallback)
        <div className="relative">
          <Image
            src="/perfil.svg"
            alt="Foto de perfil de Odilon - Desenvolvedor Full-Stack"
            width={450}
            height={450}
            priority={true}
            className="  rounded-xl w-24 h-24 xs:w-28 xs:h-28 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 object-cover shadow-2xl border-3 xs:border-4 border-gray-800"
          />
        </div>
      )}
    </div>
  );
}

// Skeleton para a foto de perfil
function ProfileImageSkeleton() {
  return (
    <div className="flex items-center justify-center shrink-0 relative group w-full lg:w-auto">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-600/20 to-green-500/20 rounded-2xl blur-2xl opacity-50 -z-10" />
      <div className="rounded-xl w-24 h-24 xs:w-28 xs:h-28 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 bg-gradient-to-br from-gray-800 to-gray-900 border-3 xs:border-4 border-gray-800 animate-pulse" />
    </div>
  );
}

// Componente: Cabeçalho (Nome e Título)
function Header() {
  return (
    <div className="space-y-2 xs:space-y-2.5 sm:space-y-3">
      <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
        Odilon de Campos
      </h1>
      <div className="h-1 xs:h-1.5 w-16 xs:w-20 bg-linear-to-r from-blue-400 to-green-400 rounded-full mx-auto lg:mx-0" />
      <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-linear-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
        Full-Stack Developer
      </h2>
    </div>
  );
}

// Skeleton para o cabeçalho
function HeaderSkeleton() {
  return (
    <div className="space-y-2 xs:space-y-2.5 sm:space-y-3 w-full">
      <div className="h-8 xs:h-9 sm:h-11 md:h-14 lg:h-16 xl:h-20 w-48 xs:w-56 sm:w-64 md:w-72 lg:w-80 mx-auto lg:mx-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg animate-pulse" />
      <div className="h-1 xs:h-1.5 w-16 xs:w-20 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full mx-auto lg:mx-0 animate-pulse" />
      <div className="h-6 xs:h-7 sm:h-8 md:h-10 lg:h-12 w-32 xs:w-36 sm:w-40 md:w-48 lg:w-56 mx-auto lg:mx-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg animate-pulse" />
    </div>
  );
}

// Componente: Bio e Localização
function BioSection({ location }: { location?: string }) {
  return (
    <div className="space-y-1.5 xs:space-y-2 sm:space-y-2.5 w-full px-1 xs:px-0">
      <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 max-w-2xl leading-relaxed">
        Criando soluções digitais inovadoras com tecnologias modernas.
        Apaixonado por código limpo, performance e experiência do usuário.
      </p>
      {location && (
        <p className="text-xs xs:text-sm sm:text-base text-gray-400 flex items-center justify-center lg:justify-start gap-1.5 xs:gap-2">
          <span>📍</span>
          <span>{location}</span>
        </p>
      )}
    </div>
  );
}

// Skeleton para Bio e Localização
function BioSectionSkeleton() {
  return (
    <div className="space-y-1.5 xs:space-y-2 sm:space-y-2.5 w-full px-1 xs:px-0">
      <div className="space-y-1">
        <div className="h-3 xs:h-3.5 sm:h-4 w-full bg-gradient-to-r from-gray-800 to-gray-900 rounded animate-pulse" />
        <div className="h-3 xs:h-3.5 sm:h-4 w-5/6 mx-auto lg:mx-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded animate-pulse" />
        <div className="h-3 xs:h-3.5 sm:h-4 w-4/6 mx-auto lg:mx-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded animate-pulse" />
      </div>
      <div className="flex items-center justify-center lg:justify-start gap-1.5 xs:gap-2 pt-2">
        <div className="w-4 h-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full animate-pulse" />
        <div className="h-4 w-24 bg-gradient-to-r from-gray-800 to-gray-900 rounded animate-pulse" />
      </div>
    </div>
  );
}

// Componente: Card de Estatística
function StatCard({ stat }: { stat: StatItem }) {
  return (
    <div className="bg-linear-to-br from-gray-900 to-gray-950 border border-gray-800 hover:border-gray-700 rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 group ">
      <div
        className={`text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black bg-linear-to-r ${stat.color} bg-clip-text text-transparent mb-1 xs:mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform`}
      >
        {stat.value}
      </div>
      <p className="text-xs text-gray-400 font-medium line-clamp-2">
        {stat.label}
      </p>
    </div>
  );
}

// Skeleton para Card de Estatística
function StatCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-5">
      <div className="h-8 xs:h-9 sm:h-10 md:h-12 w-12 xs:w-14 sm:w-16 mb-1 xs:mb-1.5 sm:mb-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded animate-pulse" />
      <div className="h-3 xs:h-3.5 w-16 xs:w-20 bg-gradient-to-r from-gray-800 to-gray-900 rounded animate-pulse" />
    </div>
  );
}

// Componente: Grid de Estatísticas
function StatsGrid({
  stats,
  loading,
}: {
  stats: StatItem[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 w-full mt-2 xs:mt-3 sm:mt-4 md:mt-6">
        {[...Array(4)].map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (stats.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 w-full mt-2 xs:mt-3 sm:mt-4 md:mt-6">
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}

// Componente: Botão de Social
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
      <div className="relative">
        <div
          className={`absolute inset-0 bg-linear-to-r ${gradientFrom} ${gradientTo} rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300 -z-10`}
        />
        <div className="relative bg-black rounded-full p-2 xs:p-2.5 sm:p-3">
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

// Componente: Botão de Ação com Ícone (para email)
function ActionIconButton({
  onClick,
  icon: Icon,
  gradientFrom,
  gradientTo,
  label,
}: {
  onClick: () => void;
  icon: typeof Mail;
  gradientFrom: string;
  gradientTo: string;
  label: string;
}) {
  return (
    <button onClick={onClick} className="group" aria-label={label}>
      <div className="relative">
        <div
          className={`absolute inset-0 bg-linear-to-r ${gradientFrom} ${gradientTo} rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300 -z-10`}
        />
        <div className="relative bg-black rounded-full p-2 xs:p-2.5 sm:p-3">
          <Icon
            size={24}
            className="xs:w-8 xs:h-8 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform duration-200"
            color="white"
          />
        </div>
      </div>
    </button>
  );
}
// Componente: Botões de Ação
function ActionButtons({ onDownload }: { onDownload: () => void }) {
  const EMAIL = "odilon123c@gmail.com";

  const copyEmail = async () => {
    await navigator.clipboard.writeText(EMAIL);
  };

  return (
    <div className="flex flex-col xs:flex-row items-center justify-center lg:justify-start gap-3 xs:gap-4 sm:gap-5 md:gap-6 mt-4 xs:mt-5 sm:mt-6 md:mt-8 w-full">
      <div className="flex gap-4 ">
        <div className="tooltip" data-tip="LinkedIn">
          <SocialButton
            href="https://www.linkedin.com/in/odilon-dev/"
            icon={Linkedin}
            gradientFrom="from-blue-600"
            gradientTo="to-blue-500"
            data-tip="click!"
          />
        </div>
        <div className="tooltip" data-tip="GitHub">
          <SocialButton
            href="https://github.com/odilonskt"
            icon={Github}
            gradientFrom="from-gray-700"
            gradientTo="to-gray-600"
            data-tip="click!"
          />
        </div>
        <div className="tooltip" data-tip="Copiar email">
          <ActionIconButton
            onClick={copyEmail}
            icon={Mail}
            gradientFrom="from-red-600"
            gradientTo="to-red-500"
            label="Copiar email"
            data-tip="click!"
          />
        </div>
      </div>
      <div>
        <Button
          onClick={onDownload}
          className="flex gap-1 xs:gap-1.5 sm:gap-2 items-center text-xs xs:text-xs sm:text-sm font-bold px-3 xs:px-4 sm:px-6 py-2 xs:py-2 sm:py-3 bg-linear-to-r from-green-600 to-blue-600 hover:from-blue-600 hover:to-green-600 text-black rounded-lg xs:rounded-xl border-0 shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 active:scale-95 w-full xs:w-auto justify-center whitespace-nowrap  tooltip  tooltip-bottom"
          data-tip="Baixar currículo"
        >
          <Download size={16} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
          <span>Currículo</span>
        </Button>
      </div>
    </div>
  );
}

// Skeleton para Botões de Ação
function ActionButtonsSkeleton() {
  return (
    <div className="flex flex-col xs:flex-row items-center justify-center lg:justify-start gap-3 xs:gap-4 sm:gap-5 md:gap-6 mt-4 xs:mt-5 sm:mt-6 md:mt-8 w-full">
      <div className="flex gap-4">
        <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full animate-pulse" />
        <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full animate-pulse" />
        <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full animate-pulse" />
      </div>

      <div className="h-10 xs:h-11 sm:h-12 w-full xs:w-32 sm:w-36 md:w-40 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg xs:rounded-xl animate-pulse" />
    </div>
  );
}

// Componente Principal
export default function Start({ id }: StartProps) {
  const [githubData, setGithubData] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        const response = await fetch("https://api.github.com/users/odilonskt");
        if (response.ok) {
          const data = await response.json();
          setGithubData(data);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do GitHub:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubData();
  }, []);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/odilon.pdf";
    link.download = "odilon.pdf";
    link.click();
  };

  const stats: StatItem[] = githubData
    ? [
        {
          label: "Repositórios",
          value: githubData.public_repos,
          icon: "📦",
          color: "from-white to-blue-600",
        },
        {
          label: "Seguidores",
          value: githubData.followers,
          icon: "👥",
          color: "from-white to-blue-600",
        },
        {
          label: "Seguindo",
          value: githubData.following,
          icon: "🔗",
          color: "from-white to-blue-600",
        },
        {
          label: "Gists",
          value: githubData.public_gists,
          icon: "💾",
          color: "from-white to-blue-600",
        },
      ]
    : [];

  return (
    <main
      id={id}
      className="text-white w-full bg-black min-h-screen overflow-x-hidden relative "
    >
      {/* Decorative Elements */}
      <div className="hidden md:block absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 " />
      <div className="hidden md:block absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />
      <div className="block md:hidden absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl -z-10" />
      <div className="block md:hidden absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl -z-10" />

      <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen px-3 xs:px-4 sm:px-6 md:px-8 lg:px-12 xl:px-8 py-8 xs:py-10 sm:py-12 md:py-16 lg:py-0 gap-6 xs:gap-8 sm:gap-10 md:gap-12 lg:gap-16">
        {/* Perfil */}
        {loading ? <ProfileImageSkeleton /> : <ProfileImage />}

        {/* Conteúdo Principal */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4 xs:gap-5 sm:gap-6 md:gap-7 lg:gap-8 max-w-3xl w-full">
          {loading ? (
            <>
              <HeaderSkeleton />
              <BioSectionSkeleton />
              <StatsGrid stats={[]} loading={loading} />
              <ActionButtonsSkeleton />
            </>
          ) : (
            <>
              <Header />
              <BioSection location={githubData?.location} />
              <StatsGrid stats={stats} loading={loading} />
              <ActionButtons onDownload={handleDownload} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
