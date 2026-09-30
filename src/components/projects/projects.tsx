import { AlertCircle, ExternalLink, Rocket } from "lucide-react";
import Image from "next/image";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getPublishedProjects } from "@/lib/content/repository";
import { localize } from "@/lib/content/translations";
import { getPortfolioRepos, type LanguageShare, type PortfolioRepo } from "@/lib/github";
import { HTML_LANG, type Locale } from "@/lib/i18n/config";
import { home } from "@/lib/i18n/messages/home";
import { getLocale } from "@/lib/i18n/server";

type ProjectMessages = (typeof home)["pt"]["projects"];

import { ProjectCard } from "./project-card";
import { ProjectsToggle } from "./projects-toggle";

// Prints dos projetos (em /public). Sem print, o card mostra só o texto.
const PROJECT_IMAGES: Record<string, string> = {
  "calculadora-em-POO": "/calculadora-em-POO.png",
  portfolio: "/portfolio.png",
  portifolio: "/portfolio.png",
  "M4-API-Futebol": "/M4-API-Futebol.png",
};

const INITIAL_VISIBLE = 6;

const formatDate = (iso: string, locale: Locale) =>
  new Intl.DateTimeFormat(HTML_LANG[locale], { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));

function LanguageBar({ shares, label }: { shares: LanguageShare[]; label: string }) {
  if (shares.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        {shares.map((share) => (
          <span key={share.language} style={{ width: `${share.percentage}%`, backgroundColor: share.color }} />
        ))}
      </div>
      <ul aria-label={label} className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {shares.slice(0, 3).map((share) => (
          <li key={share.language} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: share.color }} aria-hidden="true" />
            <span className="text-foreground/80">{share.language}</span> {share.percentage}%
          </li>
        ))}
      </ul>
    </div>
  );
}

function RepoCard({
  repo,
  headingLevel: Heading,
  t,
  locale,
}: {
  repo: PortfolioRepo;
  headingLevel: "h3" | "h4";
  t: ProjectMessages;
  locale: Locale;
}) {
  const image = PROJECT_IMAGES[repo.name];
  const titleId = `repo-${repo.id}-title`;

  return (
    <article aria-labelledby={titleId} className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      {image && (
        <Image
          src={image}
          alt={t.screenshotAlt(repo.name)}
          width={640}
          height={360}
          sizes="(min-width: 1024px) 320px, (min-width: 768px) 50vw, 100vw"
          className="aspect-video w-full border-b border-border object-cover"
        />
      )}

      <div className="flex flex-1 flex-col gap-4 p-5">
        <header className="flex flex-col gap-1">
          <Heading id={titleId} className="font-semibold break-words text-foreground">
            {repo.name}
          </Heading>
          <p className="text-xs text-muted-foreground">
            {t.updatedAt} <time dateTime={repo.updatedAt}>{formatDate(repo.updatedAt, locale)}</time>
          </p>
        </header>

        <p className="line-clamp-3 text-sm text-muted-foreground">{repo.description || t.noDescription}</p>

        <LanguageBar shares={repo.languages} label={t.languages} />

        <div className="mt-auto flex gap-2 pt-1">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <a href={repo.htmlUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink data-icon="inline-start" aria-hidden="true" />
              {t.code}
              <span className="sr-only"> {t.codeOf(repo.name)}</span>
            </a>
          </Button>
          {repo.homepage && (
            <Button asChild variant="secondary" size="sm" className="flex-1">
              <a href={repo.homepage} target="_blank" rel="noopener noreferrer">
                <Rocket data-icon="inline-start" aria-hidden="true" />
                {t.live}
                <span className="sr-only"> {t.liveOf(repo.name)}</span>
              </a>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

function GitHubUnavailable({ t }: { t: ProjectMessages }) {
  return (
    <Alert variant="destructive">
      <AlertCircle aria-hidden="true" />
      <AlertTitle>{t.githubErrorTitle}</AlertTitle>
      <AlertDescription>{t.githubErrorDescription}</AlertDescription>
    </Alert>
  );
}

async function loadRepos(): Promise<PortfolioRepo[] | null> {
  try {
    return await getPortfolioRepos();
  } catch (error) {
    console.error("Erro ao carregar repositórios:", error);
    return null;
  }
}

function RepoList({
  repos,
  headingLevel,
  t,
  locale,
}: {
  repos: PortfolioRepo[];
  headingLevel: "h3" | "h4";
  t: ProjectMessages;
  locale: Locale;
}) {
  return (
    <ProjectsToggle total={repos.length} initialVisible={INITIAL_VISIBLE}>
      {repos.map((repo) => (
        <li key={repo.id}>
          <RepoCard repo={repo} headingLevel={headingLevel} t={t} locale={locale} />
        </li>
      ))}
    </ProjectsToggle>
  );
}

/**
 * Projetos cadastrados no painel primeiro; depois os repositórios do GitHub.
 * Tudo renderizado no servidor, com cache (1h ou até salvar no painel).
 */
export default async function Projects() {
  const locale = await getLocale();
  const t = home[locale].projects;
  const [published, repos] = await Promise.all([getPublishedProjects(), loadRepos()]);
  const projects = published.map((project) => localize(project, locale));

  // Sem projetos cadastrados: a seção mostra só o GitHub, como antes
  if (projects.length === 0) {
    return repos ? <RepoList repos={repos} headingLevel="h3" t={t} locale={locale} /> : <GitHubUnavailable t={t} />;
  }

  return (
    <div className="flex flex-col gap-12">
      <ul className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <li key={project.id}>
            <ProjectCard project={project} t={t} />
          </li>
        ))}
      </ul>

      <section aria-labelledby="mais-no-github" className="flex flex-col gap-6">
        <h3 id="mais-no-github" className="text-xl font-semibold text-foreground">
          {t.moreOnGitHub}
        </h3>
        {repos ? <RepoList repos={repos} headingLevel="h4" t={t} locale={locale} /> : <GitHubUnavailable t={t} />}
      </section>
    </div>
  );
}
