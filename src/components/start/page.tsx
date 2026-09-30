import { Github, Linkedin } from "@deemlol/next-icons";
import { FileText, Send } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { PROFILE, PROFILE_TEXT, SOCIAL_LINKS } from "@/lib/content/profile";
import { localePath } from "@/lib/i18n/config";
import { common } from "@/lib/i18n/messages/common";
import { home } from "@/lib/i18n/messages/home";
import { getLocale } from "@/lib/i18n/server";
import { getPublishedResume } from "@/lib/content/repository";
import { env } from "@/lib/env";
import { getGitHubUser, type GitHubUser } from "@/lib/github";


const SOCIAL_ICONS = { GitHub: Github, LinkedIn: Linkedin } as const;

async function loadGitHubUser(): Promise<GitHubUser | null> {
  try {
    // Mesma requisição do layout: o fetch é deduplicado e cacheado pelo Next
    return await getGitHubUser(env.GITHUB_USERNAME);
  } catch {
    return null;
  }
}

function Stats({ user, t }: { user: GitHubUser; t: (typeof home)["pt"]["hero"] }) {
  const stats = [
    { label: t.repos, value: user.public_repos },
    { label: t.followers, value: user.followers },
    { label: t.following, value: user.following },
  ];

  return (
    <dl aria-label={t.statsLabel} className="flex flex-wrap justify-center gap-x-8 gap-y-3 lg:justify-start">
      {stats.map((stat) => (
        // dt vem antes no DOM (leitores de tela leem "repositórios, 20"); visualmente o número vem primeiro
        <div key={stat.label} className="flex flex-col-reverse">
          <dt className="text-sm text-muted-foreground">{stat.label}</dt>
          <dd className="text-2xl font-semibold tabular-nums text-foreground">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Portrait({ alt }: { alt: string }) {
  return (
    // Galeria do daisyUI: passar o mouse alterna entre as fotos
    <figure className="hover-gallery size-44 shrink-0 overflow-hidden rounded-3xl border border-border sm:size-56 md:size-64">
      {PROFILE.photos.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt={index === 0 ? alt : ""}
          width={512}
          height={512}
          priority={index === 0}
          sizes="(min-width: 768px) 256px, 224px"
          className="size-full object-cover"
        />
      ))}
    </figure>
  );
}

export default async function Start({ id }: { id: string }) {
  const locale = await getLocale();
  const t = home[locale].hero;
  const text = PROFILE_TEXT[locale];
  const [user, resume] = await Promise.all([loadGitHubUser(), getPublishedResume()]);
  // Currículo publicado no painel substitui o documento externo
  const resumeHref = resume ? localePath(locale, "/curriculo") : PROFILE.resumeUrl;
  const newTab = common[locale].newTab;

  return (
    <section id={id} aria-labelledby="hero-titulo" className="scroll-mt-24">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-5xl flex-col items-center justify-center gap-10 px-4 pt-24 pb-16 sm:px-6 lg:flex-row lg:gap-16">
        <Portrait alt={t.photoAlt(PROFILE.name)} />

        <div className="flex max-w-xl flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <div className="flex flex-col gap-3">
            <h1 id="hero-titulo" className="text-4xl font-bold tracking-tight text-balance text-foreground sm:text-6xl">
              {PROFILE.name}
            </h1>
            <p className="text-lg text-brand sm:text-xl">{text.role}</p>
          </div>

          <p className="max-w-prose text-base leading-relaxed text-muted-foreground">{text.bio}</p>

          {user && <Stats user={user} t={t} />}

          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Button asChild>
              <a href={resumeHref} target="_blank" rel="noopener noreferrer">
                <FileText data-icon="inline-start" aria-hidden="true" />
                {t.seeResume}
                <span className="sr-only"> {newTab}</span>
              </a>
            </Button>

            {SOCIAL_LINKS.filter((link) => link.name in SOCIAL_ICONS).map((link) => {
              const Icon = SOCIAL_ICONS[link.name as keyof typeof SOCIAL_ICONS];
              return (
                <Button key={link.name} variant="outline" size="icon" asChild>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`${link.name} ${newTab}`}>
                    <Icon size={18} aria-hidden="true" />
                  </a>
                </Button>
              );
            })}

            {/* Contato pelo formulário: o e-mail pessoal não fica exposto na página */}
            <Button variant="outline" asChild>
              <a href="#Contato">
                <Send data-icon="inline-start" aria-hidden="true" />
                {t.sendMessage}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
