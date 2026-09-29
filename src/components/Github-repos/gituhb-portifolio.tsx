"use client";

import { AlertCircle, ExternalLink, Rocket } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Repository {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null; // Adicionado homepage da API do GitHub
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

interface LanguageBreakdown {
  [key: string]: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms
const REQUEST_TIMEOUT = 8000; // ms
const API_BASE_URL = "/api/github";

interface FetchError {
  status: number;
  message: string;
  retryable: boolean;
}

const handleHttpError = (status: number): FetchError => {
  switch (status) {
    case 401:
      return {
        status,
        message: "Autenticação necessária para acessar dados do GitHub",
        retryable: false,
      };
    case 403:
      return {
        status,
        message:
          "Limite de requisições do GitHub excedido. Tente novamente em alguns minutos.",
        retryable: true,
      };
    case 404:
      return {
        status,
        message: "Repositório ou usuário não encontrado",
        retryable: false,
      };
    case 429:
      return {
        status,
        message: "Muitas requisições. Aguarde antes de tentar novamente.",
        retryable: true,
      };
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        status,
        message: "Servidor do GitHub indisponível. Tente novamente mais tarde.",
        retryable: true,
      };
    default:
      return {
        status,
        message: `Erro ao carregar dados (Error ${status})`,
        retryable: true,
      };
  }
};

const fetchWithRetry = async (
  url: string,
  retries = MAX_RETRIES,
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = handleHttpError(response.status);
      if (error.retryable && retries > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1)),
        );
        return fetchWithRetry(url, retries - 1);
      }
      throw new Error(error.message);
    }

    return response;
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof Error) {
      if (err.name === "AbortError") {
        if (retries > 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1)),
          );
          return fetchWithRetry(url, retries - 1);
        }
        throw new Error(
          "Requisição expirou. Verifica sua conexão com a internet.",
        );
      }
      throw err;
    }

    throw new Error("Erro de rede ao carregar repositórios");
  }
};

// Prints dos projetos (em /public). Sem print, o card mostra só o texto.
const PROJECT_IMAGES: Record<string, string> = {
  "calculadora-em-POO": "/calculadora-em-POO.png",
  portfolio: "/portfolio.png",
  portifolio: "/portfolio.png",
  "M4-API-Futebol": "/M4-API-Futebol.png",
};

// Cores oficiais das linguagens no GitHub (dado, não decoração)
const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Ruby: "#701516",
  Go: "#00ADD8",
  Rust: "#dea584",
  PHP: "#4F5D95",
  Shell: "#89e051",
};
const DEFAULT_LANGUAGE_COLOR = "#6366f1";

const INITIAL_VISIBLE = 6;

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

type LanguageShare = { language: string; percentage: number; color: string };

function toLanguageShares(breakdown: LanguageBreakdown = {}): LanguageShare[] {
  const total = Object.values(breakdown).reduce((sum, bytes) => sum + bytes, 0);
  if (total === 0) return [];
  return Object.entries(breakdown).map(([language, bytes]) => ({
    language,
    percentage: Math.round((bytes / total) * 100),
    color: LANGUAGE_COLORS[language] ?? DEFAULT_LANGUAGE_COLOR,
  }));
}

function LanguageBar({ shares }: { shares: LanguageShare[] }) {
  if (shares.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        {shares.map((share) => (
          <span key={share.language} style={{ width: `${share.percentage}%`, backgroundColor: share.color }} />
        ))}
      </div>
      <ul aria-label="Linguagens" className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
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

function RepoCard({ repo, shares }: { repo: Repository; shares: LanguageShare[] }) {
  const image = PROJECT_IMAGES[repo.name];
  const titleId = `repo-${repo.id}-title`;

  return (
    <article aria-labelledby={titleId} className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      {image && (
        <Image
          src={image}
          alt={`Tela do projeto ${repo.name}`}
          width={640}
          height={360}
          sizes="(min-width: 1024px) 320px, (min-width: 768px) 50vw, 100vw"
          className="aspect-video w-full border-b border-border object-cover"
        />
      )}

      <div className="flex flex-1 flex-col gap-4 p-5">
        <header className="flex flex-col gap-1">
          <h3 id={titleId} className="font-semibold break-words text-foreground">
            {repo.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            Atualizado em <time dateTime={repo.updated_at}>{dateFormatter.format(new Date(repo.updated_at))}</time>
          </p>
        </header>

        <p className="line-clamp-3 text-sm text-muted-foreground">{repo.description || "Sem descrição."}</p>

        <LanguageBar shares={shares} />

        <div className="mt-auto flex gap-2 pt-1">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink data-icon="inline-start" aria-hidden="true" />
              Código<span className="sr-only"> de {repo.name} (abre em nova aba)</span>
            </a>
          </Button>
          {repo.homepage && (
            <Button asChild variant="secondary" size="sm" className="flex-1">
              <a href={repo.homepage} target="_blank" rel="noopener noreferrer">
                <Rocket data-icon="inline-start" aria-hidden="true" />
                Ver online<span className="sr-only"> {repo.name} (abre em nova aba)</span>
              </a>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

function RepoGridSkeleton() {
  return (
    <div role="status" aria-label="Carregando projetos" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: INITIAL_VISIBLE }).map((_, index) => (
        <div key={index} className="flex flex-col gap-3 rounded-2xl border border-border p-5">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  );
}

export default function GithubRepos() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [languages, setLanguages] = useState<Record<number, LanguageBreakdown>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const response = await fetchWithRetry(`${API_BASE_URL}/repos`);
        const data: Repository[] = await response.json();
        setRepos(data);

        const results = await Promise.allSettled(
          data.map(async (repo) => {
            const langResponse = await fetchWithRetry(
              `${API_BASE_URL}/languages?repo=${encodeURIComponent(repo.name)}`,
              2,
            );
            return { id: repo.id, languages: (await langResponse.json()) as LanguageBreakdown };
          }),
        );

        const languageMap: Record<number, LanguageBreakdown> = {};
        for (const result of results) {
          if (result.status === "fulfilled") languageMap[result.value.id] = result.value.languages;
        }
        setLanguages(languageMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido ao carregar repositórios");
      } finally {
        setLoading(false);
      }
    }
    fetchRepos();
  }, []);

  if (loading) return <RepoGridSkeleton />;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle aria-hidden="true" />
        <AlertTitle>Não foi possível carregar os projetos</AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-3">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const visible = showAll ? repos : repos.slice(0, INITIAL_VISIBLE);

  return (
    <div className="flex flex-col items-center gap-8">
      <ul id="lista-projetos" className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((repo) => (
          <li key={repo.id}>
            <RepoCard repo={repo} shares={toLanguageShares(languages[repo.id])} />
          </li>
        ))}
      </ul>

      {repos.length > INITIAL_VISIBLE && (
        <Button
          variant="outline"
          onClick={() => setShowAll((value) => !value)}
          aria-expanded={showAll}
          aria-controls="lista-projetos"
        >
          {showAll ? "Mostrar menos" : `Ver todos os ${repos.length} projetos`}
        </Button>
      )}
    </div>
  );
}
