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

const GITHUB_USERNAME = "odilonskt";

const customImages: Record<string, string> = {
  // No Next.js, arquivos na pasta public são servidos da raiz
  // Use "/nome-da-imagem.png" em vez de "/public/nome-da-imagem.png"
  // "CRUD-M2": "/CRUD-M2.png",
  "calculadora-em-POO": "/calculadora-em-POO.png",
  portfolio: "/portfolio.png",
  "M4-API-Futebol": "/M4-API-Futebol.png",
  portifolio: "/portfolio.png",
};

const getGithubSocialImage = (username: string, repoName: string) => {
  return `https://opengraph.githubassets.com/1/${username}/${repoName}`;
};

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
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const response = await fetch(
          `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12`
        );
        if (!response.ok) throw new Error("Falha ao carregar repositórios");
        const data: Repository[] = await response.json();
        setRepos(data);

        const languagePromises = data.map(async (repo) => {
          try {
            const langResponse = await fetch(
              `https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/languages`
            );
            if (langResponse.ok) {
              const langData = await langResponse.json();
              return { id: repo.id, languages: langData };
            }
          } catch {
            return { id: repo.id, languages: {} };
          }
          return { id: repo.id, languages: {} };
        });

        const languageResults = await Promise.all(languagePromises);
        const languageMap: Record<number, LanguageBreakdown> = {};
        languageResults.forEach((result) => {
          if (result) languageMap[result.id] = result.languages;
        });
        setLanguages(languageMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
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
      <div className="text-center py-12 text-red-400 ">
        <p>Erro: {error}</p>
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
                  <Skeleton className="h-5 w-32 bg-zinc-900" />
                  <Skeleton className="h-4 w-full bg-zinc-900" />
                </div>
              </Card>
            ))
          : repos.map((repo) => {
              const langPercentages = getLanguagePercentages(
                languages[repo.id] || {}
              );
              const imageUrl =
                customImages[repo.name] ||
                getGithubSocialImage(GITHUB_USERNAME, repo.name);

              return (
                <Card
                  key={repo.id}
                  className="bg-zinc-950 border-zinc-900 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all overflow-hidden group"
                >
                  <div className="relative h-40 w-full bg-zinc-900 overflow-hidden">
                    <Image
                      src={imageUrl || "/placeholder.svg"}
                      alt={repo.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>

                  <CardContent className="p-4 space-y-3 skeleton">
                    <div className="flex items-center gap-2">
                      <Image
                        src={repo.owner.avatar_url || "/placeholder.svg"}
                        alt={repo.owner.login}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                      <span className="font-medium text-zinc-100 truncate">
                        {repo.name}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-400 line-clamp-2 min-h-[2.5rem]">
                      {repo.description || "Sem descrição"}
                    </p>

                    {langPercentages.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex h-2 rounded-full overflow-hidden bg-zinc-900">
                          {langPercentages.map((lang, i) => (
                            <div
                              key={i}
                              style={{
                                width: `${lang.percentage}%`,
                                backgroundColor: lang.color,
                              }}
                              className="h-full"
                            />
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                          {langPercentages.slice(0, 3).map((lang, i) => (
                            <span
                              key={i}
                              className="flex items-center gap-1 text-zinc-400"
                            >
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: lang.color }}
                              />
                              {lang.language} {lang.percentage}%
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        asChild
                        size="sm"
                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border-0"
                      >
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MdOpenInNew className="h-3.5 w-3.5 mr-1.5" />
                          Repositório
                        </a>
                      </Button>
                      {repo.homepage && (
                        <Button
                          asChild
                          size="sm"
                          className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white border-0 shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                        >
                          <a
                            href={repo.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MdRocket className="h-3.5 w-3.5 mr-1.5" />
                            Deploy
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>
    </div>
  );
}
