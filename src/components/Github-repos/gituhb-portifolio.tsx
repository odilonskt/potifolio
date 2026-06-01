"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MdOpenInNew, MdRocket } from "react-icons/md";

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
  owner: {
    avatar_url: string;
    login: string;
  };
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

const customImages: Record<string, string> = {
  "calculadora-em-POO": "/calculadora-em-POO.png",
  portfolio: "/portfolio.png",
  "M4-API-Futebol": "/M4-API-Futebol.png",
  portifolio: "/portfolio.png",
};

const fallbackPreviewImage = "/favicon.svg ";
const fallbackAvatarImage = "/perfil.svg";

const languageColors: Record<string, string> = {
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
  Default: "#6366f1",
};

export default function GithubRepos() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [languages, setLanguages] = useState<Record<number, LanguageBreakdown>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const response = await fetchWithRetry(`${API_BASE_URL}/repos`);
        const data: Repository[] = await response.json();
        setRepos(data);

        const languagePromises = data.map(async (repo) => {
          try {
            const langResponse = await fetchWithRetry(
              `${API_BASE_URL}/languages?repo=${repo.name}`,
              2,
            );
            const langData = await langResponse.json();
            return { id: repo.id, languages: langData };
          } catch (err) {
            console.warn(`Failed to fetch languages for ${repo.name}:`, err);
            return { id: repo.id, languages: {} };
          }
        });

        const languageResults = await Promise.allSettled(languagePromises);
        const languageMap: Record<number, LanguageBreakdown> = {};
        languageResults.forEach((result) => {
          if (result.status === "fulfilled" && result.value) {
            languageMap[result.value.id] = result.value.languages;
          }
        });
        setLanguages(languageMap);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Erro desconhecido ao carregar repositórios";
        setError(errorMessage);
        console.error("Error fetching repos:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRepos();
  }, []);

  const getLanguagePercentages = (repoLanguages: LanguageBreakdown) => {
    const total = Object.values(repoLanguages).reduce((a, b) => a + b, 0);
    if (total === 0) return [];
    return Object.entries(repoLanguages).map(([lang, bytes]) => ({
      language: lang,
      percentage: Math.round((bytes / total) * 100),
      color: languageColors[lang] || languageColors.Default,
    }));
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-block rounded-lg bg-red-500/10 border border-red-500/30 p-4 max-w-md">
          <p className="text-red-400 font-medium mb-2">
            ⚠️ Erro ao carregar repositórios
          </p>
          <p className="text-red-300/80 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-sm transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="  max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-zinc-950 border-zinc-900">
                <Skeleton className="h-40 w-full bg-zinc-900" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-32 bg-zinc-900bg-zinc-900" />
                  <Skeleton className="h-4 w-full bg-zinc-900" />
                </div>
              </Card>
            ))
          : repos.map((repo) => {
              const langPercentages = getLanguagePercentages(
                languages[repo.id] || {},
              );
              const imageUrl = customImages[repo.name] || fallbackPreviewImage;

              return (
                <article
                  key={repo.id}
                  className="group bg-black border border-zinc-800 rounded-lg overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-white/20"
                  aria-labelledby={`repo-${repo.id}-title`}
                >
                  <div className="relative h-40 sm:h-44 md:h-48 lg:h-56 w-full bg-zinc-900 overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={`Preview do repositório ${repo.name}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>

                  <CardContent className="p-4 space-y-3 text-white">
                    <header className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={repo.owner.avatar_url || fallbackAvatarImage}
                          alt={`Avatar de ${repo.owner.login}`}
                          width={32}
                          height={32}
                          className="rounded-full flex-shrink-0"
                        />
                        <h3
                          id={`repo-${repo.id}-title`}
                          className="font-semibold text-sm truncate"
                        >
                          {repo.name}
                        </h3>
                      </div>
                      <time
                        dateTime={repo.updated_at}
                        className="text-xs text-zinc-400"
                        aria-label={`Última atualização ${new Date(
                          repo.updated_at,
                        ).toLocaleDateString()}`}
                      >
                        {new Date(repo.updated_at).toLocaleDateString()}
                      </time>
                    </header>

                    <p className="text-sm text-zinc-300 line-clamp-2 min-h-[2.5rem]">
                      {repo.description || "Sem descrição"}
                    </p>

                    {langPercentages.length > 0 && (
                      <div className="space-y-2">
                        <div
                          className="flex h-2 rounded-full overflow-hidden bg-zinc-900"
                          role="img"
                          aria-label={`Linguagens: ${langPercentages
                            .map((l) => `${l.language} ${l.percentage}%`)
                            .join(", ")}`}
                        >
                          {langPercentages.map((lang, i) => (
                            <div
                              key={i}
                              style={{
                                width: `${lang.percentage}%`,
                                backgroundColor: lang.color,
                              }}
                              className="h-full"
                              aria-hidden
                            />
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {langPercentages.slice(0, 3).map((lang, i) => (
                            <span
                              key={i}
                              className="flex items-center gap-2 text-zinc-300"
                            >
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: lang.color }}
                                aria-hidden
                              />
                              <span className="sr-only">Linguagem: </span>
                              {lang.language}{" "}
                              <span className="text-zinc-400">
                                {lang.percentage}%
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        asChild
                        size="sm"
                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                      >
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Abrir repositório ${repo.name}`}
                        >
                          <MdOpenInNew
                            className="h-4 w-4 mr-2 inline"
                            aria-hidden
                          />
                          <span>Repositório</span>
                        </a>
                      </Button>
                      {repo.homepage && (
                        <Button
                          asChild
                          size="sm"
                          className="flex-1 bg-white/5 hover:bg-white/10 text-white border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                        >
                          <a
                            href={repo.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Abrir deploy do ${repo.name}`}
                          >
                            <MdRocket
                              className="h-4 w-4 mr-2 inline"
                              aria-hidden
                            />
                            <span>Deploy</span>
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </article>
              );
            })}
      </div>
    </div>
  );
}
