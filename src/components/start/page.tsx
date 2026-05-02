"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useGitHubUser } from "@/hooks/useGitHubUser";
import { cn } from "@/lib/utils";
import { Github, Linkedin } from "@deemlol/next-icons";
import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Aurora from "../ui/Aurora";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StartProps {
  id: string;
}

interface StatItem {
  label: string;
  value: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GITHUB_USERNAME = "odilonskt";
const LINKEDIN_URL = "https://www.linkedin.com/in/odilon-dev/";
const GITHUB_URL = `https://github.com/${GITHUB_USERNAME}`;
const CURRICULO_URL =
  "https://docs.google.com/document/d/1p8Dg2LF-acbwpfGUGaTkE2P543XlWjN9Bu5pX3V18Ts/edit?usp=sharing";
const EMAIL = "odilon123c@gmail.com";

const BIO_TEXT =
  "Criando soluções digitais com tecnologias modernas. Apaixonado por código limpo, performance e experiência do usuário.";

const AURORA_COLORS: [string, string, string] = [
  "#0ea5e9",
  "#6366f1",
  "#22c55e",
];

const SOCIAL_LINKS = [
  {
    href: LINKEDIN_URL,
    icon: Linkedin,
    label: "Acessar perfil no LinkedIn (abre em nova aba)",
    glow: "hover:shadow-blue-500/40",
  },
  {
    href: GITHUB_URL,
    icon: Github,
    label: "Acessar perfil no GitHub (abre em nova aba)",
    glow: "hover:shadow-slate-400/30",
  },
] as const;

// ─── Rainbow Button CSS ───────────────────────────────────────────────────────

const rainbowStyle = `
  @keyframes rainbow-shift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .rainbow-btn::before {
    content: '';
    position: absolute;
    inset: -1.5px;
    border-radius: 12px;
    background: linear-gradient(270deg, #0ea5e9, #6366f1, #22c55e, #f59e0b, #0ea5e9);
    background-size: 300% 300%;
    animation: rainbow-shift 5s ease infinite;
    z-index: -1;
  }
`;

// ─── Download Icon ────────────────────────────────────────────────────────────

const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// ─── Sub-components com skeleton colorido ─────────────────────────────────────

function ProfileImageSkeleton() {
  return (
    <Skeleton
      className={cn(
        "shrink-0 w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-2xl",
        "bg-zinc-900",
      )}
    />
  );
}

function HeaderSkeleton() {
  return (
    <div className="space-y-2 w-full">
      <Skeleton className={cn("h-3 w-20 mx-auto lg:mx-0", "bg-zinc-900")} />
      <Skeleton
        className={cn(
          "h-10 sm:h-14 md:h-16 w-64 sm:w-80 mx-auto lg:mx-0",
          "bg-zinc-900",
        )}
      />
      <Skeleton className={cn("h-5 w-40 mx-auto lg:mx-0", "bg-zinc-900")} />
    </div>
  );
}

function BioSkeleton() {
  return (
    <div className="space-y-2 w-full">
      <Skeleton className={cn("h-4 w-full max-w-lg", "bg-zinc-900")} />
      <Skeleton
        className={cn("h-4 w-4/5 max-w-lg mx-auto lg:mx-0", "bg-zinc-900")}
      />
      <Skeleton
        className={cn("h-3 w-24 mx-auto lg:mx-0 mt-1", "bg-zinc-900")}
      />
    </div>
  );
}

function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl border border-white/5 space-y-2">
          <Skeleton className={cn("h-7 w-10", "bg-zinc-900")} />
          <Skeleton className={cn("h-3 w-16", "bg-zinc-900")} />
        </div>
      ))}
    </div>
  );
}

function ActionButtonsSkeleton() {
  return (
    <div
      className="flex flex-wrap items-center justify-center lg:justify-start gap-3 w-full"
      aria-hidden="true"
    >
      <div className="flex gap-2">
        <Skeleton className={cn("w-10 h-10 rounded-full", "bg-zinc-900")} />
        <Skeleton className={cn("w-10 h-10 rounded-full", "bg-zinc-900")} />
        <Skeleton className={cn("w-10 h-10 rounded-full", "bg-zinc-900")} />
      </div>
      <Skeleton className={cn("h-9 w-28 rounded-xl", "bg-zinc-900")} />
    </div>
  );
}

// ─── Componentes que não mudaram (ProfileImage, Header, Bio, StatsCard, etc.) ──
// (mantenha os originais sem skeleton, apenas importe os skeletons acima)

function ProfileImage() {
  const images = ["/perfil.svg", "/perfil-3.jpeg", "/perfil-4.jpeg"];

  return (
    <div className="relative shrink-0 w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 group">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-indigo-500/20 rounded-2xl blur-xl -z-10 group-hover:from-sky-500/30 group-hover:to-indigo-500/30 transition-all duration-500" />
      <figure className="hover-gallery relative w-full h-full">
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={`Foto de perfil de Odilon ${i + 1}`}
            width={400}
            height={400}
            priority={i === 0}
            className="rounded-2xl object-cover w-full h-full border border-white/10"
          />
        ))}
      </figure>
    </div>
  );
}

function Header() {
  return (
    <header className="space-y-2">
      <p className="text-xs tracking-[0.3em] text-slate-500 uppercase">
        Portfólio
      </p>
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight">
        Odilon de Campos
      </h1>
      <h2 className="text-base sm:text-lg text-slate-400 font-normal">
        Full-Stack Developer
      </h2>
    </header>
  );
}

function Bio({ location }: { location?: string }) {
  return (
    <div className="space-y-2 w-full">
      <p className="text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed">
        {BIO_TEXT}
      </p>
      {location?.trim() && (
        <p className="text-xs text-slate-500 flex items-center justify-center lg:justify-start gap-1.5">
          <span aria-hidden>📍</span>
          <span>{location}</span>
        </p>
      )}
    </div>
  );
}

function StatCard({ label, value }: StatItem) {
  return (
    <div className="flex flex-col gap-0.5 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <span className="text-2xl font-bold text-white tabular-nums">
        {value}
      </span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

function StatsGrid({
  stats,
  loading,
}: {
  stats: StatItem[];
  loading: boolean;
}) {
  return loading ? (
    <StatsGridSkeleton />
  ) : (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}

function SocialButton({
  href,
  icon: Icon,
  label,
  glow,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  glow: string;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "flex items-center justify-center w-10 h-10 rounded-full",
        "border border-white/10 bg-white/[0.03]",
        "hover:border-white/20 hover:bg-white/[0.07]",
        "transition-all duration-200 hover:scale-105 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
        `hover:shadow-md ${glow}`,
      )}
    >
      <Icon size={16} color="white" aria-hidden />
    </Link>
  );
}

function EmailButton() {
  const copyEmail = () => navigator.clipboard.writeText(EMAIL);

  return (
    <button
      onClick={copyEmail}
      aria-label="Copiar endereço de e-mail"
      className={cn(
        "flex items-center justify-center w-10 h-10 rounded-full",
        "border border-white/10 bg-white/[0.03]",
        "hover:border-white/20 hover:bg-white/[0.07]",
        "transition-all duration-200 hover:scale-105 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
        "hover:shadow-md hover:shadow-rose-500/30",
      )}
    >
      <Mail size={16} color="white" aria-hidden />
    </button>
  );
}

function RainbowButton() {
  return (
    <>
      <style>{rainbowStyle}</style>
      <Link
        href={CURRICULO_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Baixar currículo (abre em nova aba)"
        className={cn(
          "rainbow-btn relative inline-flex items-center gap-2",
          "px-5 py-2.5 rounded-xl text-xs font-semibold text-white",
          "bg-slate-950 transition-all duration-200",
          "hover:scale-105 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
        )}
      >
        <DownloadIcon />
        <span>Currículo</span>
      </Link>
    </>
  );
}

function ActionButtons({ loading }: { loading: boolean }) {
  if (loading) return <ActionButtonsSkeleton />;
  return (
    <nav
      aria-label="Links sociais e currículo"
      className="flex flex-wrap items-center justify-center lg:justify-start gap-3 w-full"
    >
      <div className="flex gap-2" role="list">
        {SOCIAL_LINKS.map(({ href, icon, label, glow }) => (
          <div key={href} role="listitem">
            <SocialButton href={href} icon={icon} label={label} glow={glow} />
          </div>
        ))}
        <div role="listitem">
          <EmailButton />
        </div>
      </div>

      <RainbowButton />
    </nav>
  );
}

// ─── Data helpers ─────────────────────────────────────────────────────────────

function buildStats(data: {
  public_repos: number;
  followers: number;
  following: number;
  public_gists: number;
}): StatItem[] {
  return [
    { label: "Repositórios", value: data.public_repos },
    { label: "Seguidores", value: data.followers },
    { label: "Seguindo", value: data.following },
    { label: "Gists", value: data.public_gists },
  ];
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Start({ id }: StartProps) {
  const { githubData, loading } = useGitHubUser(GITHUB_USERNAME);
  const stats = githubData ? buildStats(githubData) : [];

  return (
    <main
      id={id}
      className="relative w-full min-h-screen bg-slate-950 overflow-hidden text-white"
    >
      {/* Aurora background */}
      <div className="absolute inset-0 -z-10 opacity-40">
        <Aurora
          colorStops={AURORA_COLORS}
          blend={0.4}
          amplitude={0.8}
          speed={0.3}
        />
      </div>

      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_#020617_100%)]" />

      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-6 sm:px-10 lg:px-16 py-20 lg:min-h-screen">
        {loading ? <ProfileImageSkeleton /> : <ProfileImage />}

        <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-5 max-w-xl w-full">
          {loading ? (
            <>
              <HeaderSkeleton />
              <BioSkeleton />
              <StatsGrid stats={[]} loading />
              <ActionButtons loading />
            </>
          ) : (
            <>
              <Header />
              <Bio location={githubData?.location} />
              <StatsGrid stats={stats} loading={false} />
              <ActionButtons loading={false} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
