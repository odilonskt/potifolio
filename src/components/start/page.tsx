"use client";
import { useGitHubUser } from "@/hooks/useGitHubUser";
import { Download, Github, Linkedin } from "@deemlol/next-icons";
import { Mail } from "lucide-react";
import Image from "next/image";
import { default as Link, default as NextLink } from "next/link";

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
    <div className="flex items-center justify-center shrink-0 relative group w-32 h-32 xs:w-40 xs:h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80">
      <div
        className="absolute inset-0 bg-linear-to-r from-blue-500 via-purple-600 to-green-500 rounded-2xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-300 -z-10"
        suppressHydrationWarning
      />

      {hasExtraImages ? (
        <figure className="hover-gallery relative w-32 h-32 xs:w-40 xs:h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80">
          <Image
            src="/perfil.svg"
            alt="Foto de perfil de Odilon - Desenvolvedor Full-Stack"
            width={450}
            height={450}
            priority
            className="rounded-xl object-cover shadow-2xl border-3 xs:border-4 border-gray-800 w-full h-full"
          />
          <Image
            src="/perfil-3.jpeg"
            alt="Odilon trabalhando em projeto"
            width={450}
            height={450}
            className="rounded-xl object-cover shadow-2xl border-3 xs:border-4 border-gray-800 w-full h-full"
          />
          <Image
            src="/perfil-4.jpeg"
            alt="Odilon em reunião ou apresentação"
            width={450}
            height={450}
            className="rounded-xl object-cover shadow-2xl border-3 xs:border-4 border-gray-800 w-full h-full"
          />
        </figure>
      ) : (
        <div className="relative w-32 h-32 xs:w-40 xs:h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80">
          <Image
            src="/perfil.svg"
            alt="Foto de perfil de Odilon - Desenvolvedor Full-Stack"
            width={450}
            height={450}
            priority
            className="rounded-xl w-full h-full object-cover shadow-2xl border-3 xs:border-4 border-gray-800"
          />
        </div>
      )}
    </div>
  );
}

// Skeleton para a foto de perfil (ajustado)
function ProfileImageSkeleton() {
  return (
    <div
      className="flex items-center justify-center shrink-0 relative group w-32 h-32 xs:w-40 xs:h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80"
      suppressHydrationWarning
    >
      <div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-600/20 to-green-500/20 rounded-2xl blur-2xl opacity-50 -z-10 animate-pulse"
        suppressHydrationWarning
      />
      <div className="rounded-2xl w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 border-3 xs:border-4 border-gray-800 animate-shimmer" />
    </div>
  );
}

// Adicionando animação shimmer global
const shimmerStyle = `
  @keyframes shimmer {
    0%, 100% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite;
    background: linear-gradient(90deg, #1f2937 25%, #374151 50%, #1f2937 75%);
    background-size: 1000px 100%;
  }
`;

// Componente: Cabeçalho (Nome e Título)
function Header() {
  return (
    <div className="space-y-2 xs:space-y-3 sm:space-y-4">
      <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-7xl font-black text-white leading-tight drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
        Odilon de Campos
      </h1>
      <div className="h-1 xs:h-1.5 w-16 xs:w-20 bg-linear-to-r from-blue-400 to-green-400 rounded-full mx-auto lg:mx-0" />
      <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold bg-linear-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
        Full-Stack Developer
      </h2>
    </div>
  );
}

// Skeleton para o cabeçalho
function HeaderSkeleton() {
  return (
    <div
      className="space-y-2 xs:space-y-3 sm:space-y-4 w-full"
      suppressHydrationWarning
    >
      <div className="h-10 xs:h-12 sm:h-16 md:h-20 lg:h-20 w-48 xs:w-56 sm:w-72 md:w-96 lg:w-96 mx-auto lg:mx-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg animate-shimmer" />
      <div
        className="h-1 xs:h-1.5 w-16 xs:w-20 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full mx-auto lg:mx-0 animate-shimmer"
        style={{ animationDelay: "0.1s" }}
      />
      <div
        className="h-5 xs:h-6 sm:h-8 md:h-10 lg:h-10 w-32 xs:w-40 sm:w-56 md:w-64 lg:w-64 mx-auto lg:mx-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg animate-shimmer"
        style={{ animationDelay: "0.2s" }}
      />
    </div>
  );
}

// Componente: Bio e Localização
function BioSection({ location }: { location?: string }) {
  return (
    <div className="space-y-2 xs:space-y-3 sm:space-y-4 w-full px-0">
      <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-xl text-gray-300 max-w-3xl leading-relaxed">
        Criando soluções digitais inovadoras com tecnologias modernas.
        Apaixonado por código limpo, performance e experiência do usuário.
      </p>
      {location && location.trim() && (
        <p className="text-xs xs:text-sm sm:text-base text-gray-400 flex items-center justify-center lg:justify-start gap-2">
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
    <div
      className="space-y-2 xs:space-y-3 sm:space-y-4 w-full px-0"
      suppressHydrationWarning
    >
      <div className="space-y-2">
        <div className="h-5 xs:h-6 sm:h-7 w-full max-w-2xl bg-gradient-to-r from-gray-800 to-gray-900 rounded animate-shimmer" />
        <div
          className="h-5 xs:h-6 sm:h-7 w-5/6 mx-auto lg:mx-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded animate-shimmer"
          style={{ animationDelay: "0.1s" }}
        />
        <div
          className="h-5 xs:h-6 sm:h-7 w-4/6 mx-auto lg:mx-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded animate-shimmer"
          style={{ animationDelay: "0.2s" }}
        />
      </div>
      <div className="flex items-center justify-center lg:justify-start gap-2 pt-2">
        <div className="w-4 h-4 xs:w-5 xs:h-5 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full animate-shimmer" />
        <div
          className="h-4 xs:h-5 w-24 xs:w-28 bg-gradient-to-r from-gray-800 to-gray-900 rounded animate-shimmer"
          style={{ animationDelay: "0.1s" }}
        />
      </div>
    </div>
  );
}

// Componente: Card de Estatística
function StatCard({ stat }: { stat: StatItem }) {
  return (
    <div className="bg-linear-to-br from-gray-900 to-gray-950 border border-gray-800 hover:border-gray-700 rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 group">
      <div
        className={`text-2xl xs:text-3xl sm:text-4xl font-black bg-linear-to-r ${stat.color} bg-clip-text text-transparent mb-2 xs:mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}
      >
        {stat.value}
      </div>
      <p className="text-xs xs:text-sm text-gray-400 font-medium line-clamp-2">
        {stat.label}
      </p>
    </div>
  );
}

// Skeleton para Card de Estatística
function StatCardSkeleton() {
  return (
    <div
      className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-5"
      suppressHydrationWarning
    >
      <div className="h-8 xs:h-10 sm:h-12 w-12 xs:w-16 sm:w-20 mb-2 xs:mb-3 sm:mb-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded animate-shimmer" />
      <div
        className="h-3 xs:h-4 w-16 xs:w-20 bg-gradient-to-r from-gray-800 to-gray-900 rounded animate-shimmer"
        style={{ animationDelay: "0.1s" }}
      />
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
      <div
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 w-full mt-3 xs:mt-4 sm:mt-6 md:mt-8"
        suppressHydrationWarning
      >
        {[...Array(4)].map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (stats.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 w-full mt-3 xs:mt-4 sm:mt-6 md:mt-8">
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
    <div className="flex flex-col xs:flex-row items-center justify-center lg:justify-start gap-3 xs:gap-4 sm:gap-5 md:gap-6 mt-4 xs:mt-6 sm:mt-8 md:mt-10 w-full">
      <div className="flex gap-4">
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
      <Link
        href="https://docs.google.com/document/d/1p8Dg2LF-acbwpfGUGaTkE2P543XlWjN9Bu5pX3V18Ts/edit?usp=sharing"
        target="_blank"
        className="flex gap-2 items-center text-xs xs:text-sm font-bold px-4 xs:px-6 sm:px-8 py-2 xs:py-3 sm:py-4 bg-linear-to-r from-green-600 to-blue-600 hover:from-blue-600 hover:to-green-600 text-black rounded-lg xs:rounded-xl border-0 shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 active:scale-95 w-full xs:w-auto justify-center whitespace-nowrap tooltip tooltip-bottom"
        data-tip="Baixar currículo"
      >
        <Download size={16} className="xs:w-5 xs:h-5 sm:w-5 sm:h-5" />
        <span>Currículo</span>
      </Link>
    </div>
  );
}

// Skeleton para Botões de Ação
function ActionButtonsSkeleton() {
  return (
    <div
      className="flex flex-col xs:flex-row items-center justify-center lg:justify-start gap-3 xs:gap-4 sm:gap-5 md:gap-6 mt-4 xs:mt-6 sm:mt-8 md:mt-10 w-full"
      suppressHydrationWarning
    >
      <div className="flex gap-4">
        <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full animate-shimmer" />
        <div
          className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full animate-shimmer"
          style={{ animationDelay: "0.1s" }}
        />
        <div
          className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full animate-shimmer"
          style={{ animationDelay: "0.2s" }}
        />
      </div>

      <div className="h-10 xs:h-12 sm:h-14 w-full xs:w-auto px-4 xs:px-6 sm:px-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg xs:rounded-xl animate-shimmer" />
    </div>
  );
}

// Componente Principal
export default function Start({ id }: StartProps) {
  const { githubData, loading } = useGitHubUser("odilonskt");

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
    <>
      <style>{shimmerStyle}</style>
      <main
        id={id}
        className="text-white w-full bg-black h-screen overflow-hidden relative"
      >
        {/* Decorative Elements */}
        <div className="hidden lg:block absolute top-1/4 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <div className="hidden lg:block absolute bottom-1/4 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen px-3 xs:px-4 sm:px-6 md:px-8 lg:px-12 py-12 xs:py-16 sm:py-20 md:pt-48 lg:pt-0 gap-6 xs:gap-8 sm:gap-12 md:gap-14 lg:gap-16">
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
    </>
  );
}
