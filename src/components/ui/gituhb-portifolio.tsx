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
  Grid3X3,
  LayoutList,
  RefreshCw,
  Star,
  Watch,
} from "lucide-react";
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

// Componente RepoCard
interface RepoCardProps {
  repo: Repo;
  viewMode: string;
  index: number;
  onSelectRepo: (repo: Repo) => void;
}

function RepoCard({ repo, viewMode, index, onSelectRepo }: RepoCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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
        {/* Language Badge */}
        {repo.language && (
          <div className="mb-4 flex justify-between items-start">
            <Badge
              variant="outline"
              className="bg-cyan-500/10 text-cyan-500 border-cyan-500/30"
            >
              {repo.language}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {repo.stargazers_count}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="h-3 w-3" />
                {repo.GitForks_count}
              </span>
            </div>
          </div>
        )}

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

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-auto pt-4 border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Watch className="h-3 w-3" />
              {repo.watchers_count}
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Atualizado {formatDate(repo.updated_at)}</span>
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="gap-2 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-500/10"
            onClick={(e) => {
              e.stopPropagation();
              window.open(repo.html_url, "_blank");
            }}
          >
            <ExternalLink className="h-3 w-3" />
            GitHub
          </Button>
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
      >
        {cardContent}
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
    });
  }, [isLoading, error, reposArray, retryCount]);

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
        </motion.header>

        {/* Stats Info */}
        {isLoading && retryCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <Alert>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertTitle>Recarregando dados...</AlertTitle>
              <AlertDescription>
                Tentativa {retryCount + 1} - Buscando repositórios atualizados
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <Separator className="my-8" />

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8"
        >
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
              Atualizar
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                >
                  <Filter className="h-4 w-4" />
                  {filterLanguage || "Filtrar"}
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
                      Todos
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
                : "flex flex-col gap-4"
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
