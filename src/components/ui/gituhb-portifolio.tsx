"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ReadmeViewer } from "@/components/ui/readme-viewer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  BookOpen,
  ExternalLink,
  Filter,
  GitFork,
  Globe,
  Grid3X3,
  Image as ImageIcon,
  LayoutList,
  RefreshCw,
  Star,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  GitForks_count: number;
  watchers_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  languages_url: string;
}

interface Languages {
  [key: string]: number;
}

interface ApiError {
  status: number;
  message: string;
  documentation_url?: string;
}

// Função fetcher com tipo específico
const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url);

  if (!res.ok) {
    const errorData: ApiError = await res.json().catch(() => ({
      status: res.status,
      message: `HTTP ${res.status}: ${res.statusText}`,
    }));

    throw new Error(
      `API Error ${errorData.status}: ${errorData.message || res.statusText}`
    );
  }

  return res.json() as Promise<T>;
};

// Adicione um tipo para a resposta da API de repositórios
interface RepoApiResponse extends Repo {
  message?: string;
  documentation_url?: string;
}

// Componente de barra de progresso para linguagens
interface LanguageBarProps {
  languages: Record<string, number>;
  repoName: string;
}

function LanguageBar({ languages, repoName }: LanguageBarProps) {
  const total = Object.values(languages).reduce((sum, val) => sum + val, 0);
  const sortedLanguages = Object.entries(languages).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Linguagens</span>
        <span className="font-medium">{repoName}</span>
      </div>

      {/* Barra de progresso composta */}
      <div className="flex h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {sortedLanguages.map(([lang, bytes]) => {
          const percentage = (bytes / total) * 100;
          const colors: Record<string, string> = {
            JavaScript: "bg-yellow-400",
            TypeScript: "bg-blue-500",
            HTML: "bg-red-500",
            CSS: "bg-purple-500",
            Python: "bg-green-500",
            Java: "bg-orange-500",
            "C++": "bg-pink-500",
            Go: "bg-cyan-500",
            Rust: "bg-orange-600",
            PHP: "bg-indigo-500",
            Ruby: "bg-red-600",
            Shell: "bg-green-400",
            Vue: "bg-emerald-500",
            Dart: "bg-blue-400",
            Swift: "bg-orange-400",
            Kotlin: "bg-purple-600",
            Default: "bg-gray-400",
          };

          return (
            <div
              key={lang}
              className="h-full"
              style={{ width: `${percentage}%` }}
              title={`${lang}: ${percentage.toFixed(1)}%`}
            >
              <div className={`h-full ${colors[lang] || colors.Default}`} />
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-2 mt-2">
        {sortedLanguages.slice(0, 3).map(([lang, bytes]) => {
          const percentage = (bytes / total) * 100;
          const colors: Record<string, string> = {
            JavaScript: "bg-yellow-400",
            TypeScript: "bg-blue-500",
            HTML: "bg-red-500",
            CSS: "bg-purple-500",
            Python: "bg-green-500",
            Default: "bg-gray-400",
          };

          return (
            <div key={lang} className="flex items-center gap-1">
              <div
                className={`w-3 h-3 rounded-full ${
                  colors[lang] || colors.Default
                }`}
              />
              <span className="text-xs font-medium">{lang}</span>
              <span className="text-xs text-muted-foreground">
                ({percentage.toFixed(0)}%)
              </span>
            </div>
          );
        })}
        {sortedLanguages.length > 3 && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span className="text-xs text-muted-foreground">
              +{sortedLanguages.length - 3} outras
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente RepoCard atualizado
interface RepoCardProps {
  repo: Repo;
  viewMode: string;
  index: number;
  onSelectRepo: (repo: Repo) => void;
  repoLanguages: Record<string, number>;
  repoImage?: string; // URL da imagem do projeto
}

function RepoCard({
  repo,
  viewMode,
  index,
  onSelectRepo,
  repoLanguages,
  repoImage,
}: RepoCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // URL da imagem padrão baseada no nome ou linguagem do projeto
  const getProjectImage = () => {
    if (repoImage) return repoImage;

    // Mapeamento de imagens baseadas em tópicos ou linguagens
    const imageMap: Record<string, string> = {
      react:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h-300&fit=crop",
      node: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop",
      typescript:
        "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop",
      javascript:
        "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop",
      python:
        "https://images.unsplash.com/photo-1526379879527-8559ecfcaec7?w=400&h=300&fit=crop",
      nextjs:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop",
      web: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop",
      api: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop",
      mobile:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
      ui: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop",
      ux: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop",
    };

    // Verifica se algum tópico corresponde a uma imagem
    for (const topic of repo.topics || []) {
      if (imageMap[topic.toLowerCase()]) {
        return imageMap[topic.toLowerCase()];
      }
    }

    // Verifica pela linguagem principal
    if (repo.language && imageMap[repo.language.toLowerCase()]) {
      return imageMap[repo.language.toLowerCase()];
    }

    // Imagem padrão baseada no ID do repositório
    const defaultImages = [
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1526379879527-8559ecfcaec7?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop",
    ];

    return defaultImages[repo.id % defaultImages.length];
  };

  const projectImage = getProjectImage();

  const cardContent = (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-500/30 cursor-pointer ${
        viewMode === "list" ? "p-6" : "p-5 h-full"
      }`}
      onClick={() => onSelectRepo(repo)}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="h-full flex flex-col"
      >
        {/* Imagem do Projeto */}
        <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
          <Image
            src={projectImage}
            alt={repo.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badge de linguagem sobre a imagem */}
          {repo.language && (
            <div className="absolute top-3 left-3">
              <Badge
                variant="outline"
                className="bg-black/70 text-white border-white/30 backdrop-blur-sm"
              >
                {repo.language}
              </Badge>
            </div>
          )}

          {/* Ícone de visualização */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ImageIcon className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Title & Description */}
        <div className="flex-grow">
          <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-500 transition-colors">
            {repo.name}
          </h3>
          {repo.description && (
            <p className="text-muted-foreground mb-4 line-clamp-2">
              {repo.description}
            </p>
          )}
        </div>

        {/* Barra de porcentagem de linguagens */}
        {Object.keys(repoLanguages).length > 0 && (
          <div className="mb-4">
            <LanguageBar languages={repoLanguages} repoName={repo.name} />
          </div>
        )}

        {/* Topics */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {repo.topics.slice(0, 3).map((topic) => (
              <Badge
                key={topic}
                variant="secondary"
                className="text-xs bg-gray-100 dark:bg-gray-800"
              >
                {topic}
              </Badge>
            ))}
            {repo.topics.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{repo.topics.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer com botões de ação */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-auto pt-4 border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {repo.stargazers_count}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="h-3 w-3" />
              {repo.GitForks_count}
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Atualizado {formatDate(repo.updated_at)}</span>
          </div>

          <div className="flex gap-2">
            {/* Botão Deploy (se homepage existir) */}
            {repo.homepage && (
              <Button
                size="sm"
                variant="default"
                className="gap-2 bg-green-600 hover:bg-green-700"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(repo.homepage!, "_blank");
                }}
              >
                <Globe className="h-3 w-3" />
                Deploy
              </Button>
            )}

            {/* Botão GitHub */}
            <Button
              size="sm"
              variant="outline"
              className="gap-2 border-cyan-500/30 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-500/10"
              onClick={(e) => {
                e.stopPropagation();
                window.open(repo.html_url, "_blank");
              }}
            >
              <ExternalLink className="h-3 w-3" />
              GitHub
            </Button>
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </motion.div>
    </Card>
  );

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex gap-4"
      >
        {/* Imagem na visualização lista */}
        <div className="hidden md:block w-48 flex-shrink-0">
          <div className="relative h-32 w-full rounded-lg overflow-hidden">
            <Image
              src={projectImage}
              alt={repo.name}
              fill
              className="object-cover"
              sizes="192px"
            />
          </div>
        </div>

        <div className="flex-grow">{cardContent}</div>
      </motion.div>
    );
  }

  return cardContent;
}

export function GithubPortfolio({ username }: { username: string }) {
  const [viewMode, setViewMode] = useState<string>("grid");
  const [filterLanguage, setFilterLanguage] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [languagesData, setLanguagesData] = useState<
    Record<string, Record<string, number>>
  >({});

  // Buscar repositórios
  const {
    data: repos,
    error,
    isLoading,
    mutate,
  } = useSWR<RepoApiResponse[]>(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onErrorRetry: () => {
        return;
      },
    }
  );

  // Garantir que repos é sempre um array
  const reposArray = useMemo(
    () => (Array.isArray(repos) ? repos : []),
    [repos]
  );

  // Buscar linguagens para cada repositório
  useEffect(() => {
    if (reposArray.length > 0) {
      const fetchAllLanguages = async () => {
        const languages: Record<string, Record<string, number>> = {};

        for (const repo of reposArray) {
          try {
            const response = await fetch(repo.languages_url);
            if (response.ok) {
              const data = await response.json();
              languages[repo.name] = data;
            }
          } catch (error) {
            console.error(`Error fetching languages for ${repo.name}:`, error);
            languages[repo.name] = repo.language
              ? { [repo.language]: 100 }
              : {};
          }
        }

        setLanguagesData(languages);
      };

      fetchAllLanguages();
    }
  }, [reposArray]);

  // Função para tratar retentativa
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    mutate();
  };

  // Debug
  useEffect(() => {
    console.log("GithubPortfolio Debug:", {
      isLoading,
      error,
      reposCount: reposArray.length,
      repos: reposArray.slice(0, 2),
      retryCount,
      languagesDataCount: Object.keys(languagesData).length,
    });
  }, [isLoading, error, reposArray, retryCount, languagesData]);

  // Verificar se é um erro de rate limit
  const isRateLimitError =
    error?.message?.includes("403") ||
    error?.message?.toLowerCase().includes("rate limit");

  // Verificar se usuário não foi encontrado
  const isUserNotFound =
    error?.message?.includes("404") ||
    error?.message?.toLowerCase().includes("not found");

  // Verificar se é erro de autenticação
  const isAuthError =
    error?.message?.includes("401") ||
    error?.message?.toLowerCase().includes("unauthorized");

  const languages = reposArray.reduce(
    (acc: Record<string, number>, repo: Repo) => {
      if (repo.language) {
        acc[repo.language] = (acc[repo.language] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const filteredRepos = filterLanguage
    ? reposArray.filter((repo: Repo) => repo.language === filterLanguage)
    : reposArray;

  if (isLoading && retryCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Spinner className="h-12 w-12 text-cyan-500" />
        <p className="text-muted-foreground animate-pulse">
          Carregando projetos...
        </p>
      </div>
    );
  }

  if (error) {
    console.error("GithubPortfolio Error:", error);

    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="p-8 text-center max-w-md w-full">
          <div className="mb-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          </div>

          <Alert variant="destructive" className="mb-4">
            <AlertTitle className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Erro ao carregar repositórios
            </AlertTitle>
            <AlertDescription>
              {isRateLimitError && (
                <div className="text-left mt-2">
                  <p className="font-semibold">Rate Limit Excedido:</p>
                  <p className="text-sm mt-1">
                    A API do GitHub tem limite de requisições. Tente novamente
                    em alguns minutos ou adicione um token de acesso.
                  </p>
                </div>
              )}

              {isUserNotFound && (
                <div className="text-left mt-2">
                  <p className="font-semibold">Usuário não encontrado:</p>
                  <p className="text-sm mt-1">
                    O usuário {username} não foi encontrado no GitHub. Verifique
                    se o nome de usuário está correto.
                  </p>
                </div>
              )}

              {isAuthError && (
                <div className="text-left mt-2">
                  <p className="font-semibold">Erro de Autenticação:</p>
                  <p className="text-sm mt-1">
                    Problema com as credenciais de acesso à API do GitHub.
                  </p>
                </div>
              )}

              {!isRateLimitError && !isUserNotFound && !isAuthError && (
                <div className="text-left mt-2">
                  <p className="font-semibold">Detalhes do erro:</p>
                  <p className="text-sm mt-1 font-mono bg-black/20 p-2 rounded">
                    {error.message}
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isRateLimitError
                ? "A API do GitHub tem limite de 60 requisições por hora para usuários não autenticados."
                : "Verifique sua conexão com a internet ou tente novamente."}
            </p>

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={handleRetry} variant="default" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente {retryCount > 0 && `(${retryCount})`}
              </Button>

              <Button variant="outline" asChild>
                <a
                  href="https://docs.github.com/en/rest"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Documentação da API
                </a>
              </Button>
            </div>

            {retryCount > 2 && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Muitas tentativas falhas</AlertTitle>
                <AlertDescription>
                  Recomendamos esperar alguns minutos antes de tentar novamente.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Se não há repositórios após carregar (mas não é erro)
  if (!isLoading && reposArray.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center max-w-md">
          <Alert className="mb-4">
            <AlertTitle>Nenhum repositório encontrado</AlertTitle>
            <AlertDescription>
              O usuário {username} não possui repositórios públicos ou a conta
              está vazia.
            </AlertDescription>
          </Alert>
          <Button variant="outline" onClick={handleRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Verificar Novamente
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative"></div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <span className="bg-linear-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                {username}
              </span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Portfólio de projetos do GitHub com estatísticas detalhadas
          </p>
        </motion.header>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-cyan-500">
              {reposArray.length}
            </div>
            <div className="text-sm text-muted-foreground">Projetos</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {Object.keys(languages).length}
            </div>
            <div className="text-sm text-muted-foreground">Linguagens</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {reposArray.reduce((sum, repo) => sum + repo.stargazers_count, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Stars</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">
              {reposArray.filter((repo) => repo.homepage).length}
            </div>
            <div className="text-sm text-muted-foreground">Deploys</div>
          </Card>
        </motion.div>

        <Separator className="my-8" />

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(v) => v && setViewMode(v)}
            >
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <Grid3X3 className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <LayoutList className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                >
                  <Filter className="h-4 w-4" />
                  {filterLanguage || "Filtrar Linguagem"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <ScrollArea className="h-48">
                  <div className="space-y-1">
                    <Button
                      variant={filterLanguage === null ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setFilterLanguage(null)}
                    >
                      Todas as Linguagens
                    </Button>
                    {languages &&
                      (Object.entries(languages) as [string, number][])
                        .sort((a, b) => b[1] - a[1])
                        .map(([lang, count]) => (
                          <Button
                            key={lang}
                            variant={
                              filterLanguage === lang ? "secondary" : "ghost"
                            }
                            size="sm"
                            className="w-full justify-between"
                            onClick={() => setFilterLanguage(lang)}
                          >
                            <span>{lang}</span>
                            <Badge variant="secondary" className="ml-2">
                              {count}
                            </Badge>
                          </Button>
                        ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Atualizar Dados
            </Button>
          </div>
        </motion.div>

        {/* Repos Grid/List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-6"
            }
          >
            {filteredRepos && filteredRepos.length > 0 ? (
              filteredRepos.map((repo: Repo, index: number) => (
                <RepoCard
                  key={repo.id}
                  repo={repo}
                  viewMode={viewMode}
                  index={index}
                  onSelectRepo={setSelectedRepo}
                  repoLanguages={languagesData[repo.name] || {}}
                  // Você pode passar uma imagem específica para cada repositório aqui
                  // repoImage="https://sua-imagem.com/projeto.jpg"
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Alert>
                  <AlertTitle>
                    {filterLanguage
                      ? `Nenhum repositório encontrado para ${filterLanguage}`
                      : "Nenhum repositório encontrado"}
                  </AlertTitle>
                  <AlertDescription>
                    {filterLanguage
                      ? "Tente remover o filtro de linguagem ou verificar se há repositórios com esta linguagem."
                      : "Verifique se o usuário possui repositórios públicos."}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Readme Modal */}
        <Dialog
          open={!!selectedRepo}
          onOpenChange={() => setSelectedRepo(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {selectedRepo?.name} - README
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[70vh]">
              {selectedRepo && <ReadmeViewer repo={selectedRepo} />}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
