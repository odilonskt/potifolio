"use client";

import { ReadmeViewer } from "@/components/readme-viewer";
import { TechBadge } from "@/components/tech-badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ExternalLink,
  Filter,
  GitFork,
  Github,
  Grid3X3,
  LayoutList,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";

interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function GithubPortfolio({ username }: { username: string }) {
  const [viewMode, setViewMode] = useState<string>("grid");
  const [filterLanguage, setFilterLanguage] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);

  const {
    data: repos,
    error,
    isLoading,
  } = useSWR<Repo[]>(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
    fetcher
  );

  const languages = repos?.reduce((acc, repo) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const filteredRepos = filterLanguage
    ? repos?.filter((repo) => repo.language === filterLanguage)
    : repos;

  if (isLoading) {
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <p className="text-destructive">Erro ao carregar repositórios</p>
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
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent"></span>
            </h1>
          </div>
          <p className="text-muted-foreground">
            Explore os projetos do @{username}
          </p>
        </motion.header>

        {/* Stats Carousel */}

        {/* Language Chart */}

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
                    Object.entries(languages)
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
            {filteredRepos?.map((repo, index) => (
              <RepoCard
                key={repo.id}
                repo={repo}
                viewMode={viewMode}
                index={index}
                onSelectRepo={setSelectedRepo}
              />
            ))}
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

function RepoCard({
  repo,
  viewMode,
  index,
  onSelectRepo,
}: {
  repo: Repo;
  viewMode: string;
  index: number;
  onSelectRepo: (repo: Repo) => void;
}) {
  const [languages, setLanguages] = useState<Languages | null>(null);

  useEffect(() => {
    fetch(repo.languages_url)
      .then((res) => res.json())
      .then(setLanguages)
      .catch(() => {});
  }, [repo.languages_url]);

  const totalBytes = languages
    ? Object.values(languages).reduce((a, b) => a + b, 0)
    : 0;

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card className="hover:border-cyan-500/50 transition-all duration-300 group">
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate group-hover:text-cyan-400 transition-colors">
                  {repo.name}
                </h3>
                {repo.language && <TechBadge tech={repo.language} />}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {repo.description || "Sem descrição"}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4" /> {repo.stargazers_count}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="h-4 w-4" /> {repo.forks_count}
              </span>
            </div>
            <div className="flex gap-2">
              <ActionButtons repo={repo} onSelectRepo={onSelectRepo} />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Card className="h-full flex flex-col overflow-hidden hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 group">
        <CardHeader className="p-0">
          <AspectRatio ratio={16 / 9}>
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <img
                src={`https://opengraph.githubassets.com/1/${repo.html_url.replace(
                  "https://github.com/",
                  ""
                )}`}
                alt={repo.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Github className="h-16 w-16 text-muted-foreground/30" />
              </div>
            </div>
          </AspectRatio>
        </CardHeader>
        <CardContent className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg truncate group-hover:text-cyan-400 transition-colors">
              {repo.name}
            </h3>
            {repo.language && <TechBadge tech={repo.language} />}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {repo.description || "Sem descrição disponível"}
          </p>

          {/* Tech Tags */}
          {repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {repo.topics.slice(0, 4).map((topic) => (
                <Badge key={topic} variant="outline" className="text-xs">
                  {topic}
                </Badge>
              ))}
              {repo.topics.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{repo.topics.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Language Stats */}
          {languages && totalBytes > 0 && (
            <div className="space-y-2">
              <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                {Object.entries(languages)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([lang, bytes], i) => (
                    <Tooltip key={lang}>
                      <TooltipTrigger asChild>
                        <div
                          className="h-full transition-all hover:brightness-110"
                          style={{
                            width: `${(bytes / totalBytes) * 100}%`,
                            backgroundColor: getLanguageColor(lang),
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {lang}: {((bytes / totalBytes) * 100).toFixed(1)}%
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {Object.entries(languages)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([lang, bytes]) => (
                    <span key={lang} className="flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getLanguageColor(lang) }}
                      />
                      {lang} {((bytes / totalBytes) * 100).toFixed(0)}%
                    </span>
                  ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 border-t border-border/50 mt-auto">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 hover:text-cyan-400 transition-colors cursor-default">
                    <Star className="h-4 w-4" /> {repo.stargazers_count}
                  </span>
                </TooltipTrigger>
                <TooltipContent>Stars</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 hover:text-purple-400 transition-colors cursor-default">
                    <GitFork className="h-4 w-4" /> {repo.forks_count}
                  </span>
                </TooltipTrigger>
                <TooltipContent>Forks</TooltipContent>
              </Tooltip>
            </div>
            <ActionButtons repo={repo} onSelectRepo={onSelectRepo} />
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

function ActionButtons({
  repo,
  onSelectRepo,
}: {
  repo: Repo;
  onSelectRepo: (repo: Repo) => void;
}) {
  return (
    <div className="flex gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-cyan-400 hover:bg-cyan-400/10"
            onClick={() => onSelectRepo(repo)}
          >
            <BookOpen className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Ver README</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-foreground hover:bg-foreground/10"
            asChild
          >
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" />
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Ver Repositório</TooltipContent>
      </Tooltip>

      {repo.homepage && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:text-green-400 hover:bg-green-400/10"
              asChild
            >
              <a href={repo.homepage} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ver Deploy</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    TypeScript: "#3178c6",
    JavaScript: "#f1e05a",
    Python: "#3572A5",
    Java: "#b07219",
    "C++": "#f34b7d",
    C: "#555555",
    "C#": "#178600",
    Go: "#00ADD8",
    Rust: "#dea584",
    Ruby: "#701516",
    PHP: "#4F5D95",
    Swift: "#ffac45",
    Kotlin: "#A97BFF",
    Dart: "#00B4AB",
    HTML: "#e34c26",
    CSS: "#563d7c",
    SCSS: "#c6538c",
    Vue: "#41b883",
    Shell: "#89e051",
    Dockerfile: "#384d54",
  };
  return colors[language] || "#6e7681";
}
