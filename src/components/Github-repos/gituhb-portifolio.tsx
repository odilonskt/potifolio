"use client";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCallback, useEffect, useMemo, useState } from "react";

// Shadcn UI Components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Icons
import {
  Cat,
  CheckCircle,
  ChevronRight,
  Code,
  Code2,
  Cpu,
  ExternalLink,
  Eye,
  FileCode,
  Filter,
  GitFork,
  Globe,
  LayoutGrid,
  List,
  Lock,
  RefreshCw,
  Search,
  Settings,
  SortAsc,
  SortDesc,
  Sparkles,
  Star,
  XCircle,
  Zap,
} from "lucide-react";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  size: number;
  default_branch: string;
  open_issues_count: number;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  visibility: string;
  archived: boolean;
  disabled: boolean;
  has_wiki?: boolean;
  has_pages?: boolean;
  license?: {
    key: string;
    name: string;
    spdx_id: string;
  } | null;
}

interface LanguageStats {
  [key: string]: number;
}

interface RepoStats {
  totalStars: number;
  totalForks: number;
  totalSize: number;
  languages: Map<string, number>;
}

const Cat_USERNAME = "odilonskt";

const fetchRepos = async (): Promise<Repository[]> => {
  const { data } = await axios.get(
    `https://api.Cat.com/users/${Cat_USERNAME}/repos`,
    {
      params: {
        sort: "updated",
        per_page: 100,
      },
      headers: {
        Accept: "application/vnd.Cat.v3+json",
      },
    }
  );
  return data;
};

const fetchLanguageStats = async (repoName: string): Promise<LanguageStats> => {
  try {
    const { data } = await axios.get(
      `https://api.Cat.com/repos/${Cat_USERNAME}/${repoName}/languages`,
      {
        headers: {
          Accept: "application/vnd.Cat.v3+json",
        },
      }
    );
    return data;
  } catch (error) {
    console.error(`Error fetching languages for ${repoName}:`, error);
    return {};
  }
};

// Componente Toast personalizado
const Toast = ({
  message,
  description,
  type = "success",
  onClose,
}: {
  message: string;
  description?: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const typeConfig = {
    success: {
      icon: <CheckCircle className="h-5 w-5" />,
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      iconColor: "text-green-600",
    },
    error: {
      icon: <XCircle className="h-5 w-5" />,
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      iconColor: "text-red-600",
    },
    info: {
      icon: <Sparkles className="h-5 w-5" />,
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      iconColor: "text-blue-600",
    },
  };

  const config = typeConfig[type];

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm animate-in slide-in-from-right">
      <Card className={`${config.bg} ${config.border} shadow-lg`}>
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-1 rounded-full ${config.iconColor} bg-opacity-20`}
            >
              {config.icon}
            </div>
            <div className="flex-1">
              <p className={`font-medium ${config.text}`}>{message}</p>
              {description && (
                <p className={`text-sm ${config.text} opacity-80 mt-1`}>
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className={`${config.text} opacity-60 hover:opacity-100`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente Skeleton aprimorado
const RepoSkeleton = () => (
  <Card className="w-full animate-pulse">
    <CardHeader className="space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-3 w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
    </CardContent>
  </Card>
);

// Componente para mostrar estatísticas de linguagem com cores
const LanguageProgress = ({
  language,
  percentage,
}: {
  language: string;
  percentage: number;
}) => {
  const getLanguageColor = (lang: string) => {
    const colors: { [key: string]: string } = {
      JavaScript: "bg-yellow-500",
      TypeScript: "bg-blue-600",
      Python: "bg-green-600",
      Java: "bg-red-500",
      "C++": "bg-pink-600",
      Go: "bg-cyan-500",
      Rust: "bg-orange-600",
      Ruby: "bg-red-600",
      PHP: "bg-purple-500",
      CSS: "bg-blue-400",
      HTML: "bg-orange-500",
      Swift: "bg-orange-400",
      Kotlin: "bg-purple-600",
      Dart: "bg-blue-400",
      Shell: "bg-green-400",
      "C#": "bg-green-700",
      Vue: "bg-green-400",
      React: "bg-cyan-400",
      Default: "bg-gray-400",
    };
    return colors[lang] || colors.Default;
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${getLanguageColor(language)}`}
          />
          <span className="font-medium">{language}</span>
        </div>
        <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
      </div>
      <Progress value={percentage} className="h-1.5" />
    </div>
  );
};
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export default function CatReposWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <CatRepos />
    </QueryClientProvider>
  );
}
function CatRepos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"stars" | "updated" | "name">("updated");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showArchived, setShowArchived] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [languageStats, setLanguageStats] = useState<{
    [repoName: string]: LanguageStats;
  }>({});
  const [loadingStats, setLoadingStats] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<
    Array<{
      id: number;
      message: string;
      description?: string;
      type: "success" | "error" | "info";
    }>
  >([]);

  const {
    data: repos = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["repos", Cat_USERNAME],
    queryFn: fetchRepos,
    staleTime: 5 * 60 * 1000,
  });

  const showToast = useCallback(
    (
      message: string,
      description?: string,
      type: "success" | "error" | "info" = "success"
    ) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, description, type }]);
      return id;
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Mostrar toast em caso de erro
  useEffect(() => {
    if (isError) {
      showToast(
        "Erro ao carregar repositórios",
        "Verifique sua conexão ou tente novamente.",
        "error"
      );
    }
  }, [isError, showToast]);

  // Calcular estatísticas gerais
  const repoStats = useMemo((): RepoStats => {
    const stats: RepoStats = {
      totalStars: 0,
      totalForks: 0,
      totalSize: 0,
      languages: new Map(),
    };

    repos.forEach((repo) => {
      stats.totalStars += repo.stargazers_count;
      stats.totalForks += repo.forks_count;
      stats.totalSize += repo.size;

      if (repo.language) {
        stats.languages.set(
          repo.language,
          (stats.languages.get(repo.language) || 0) + 1
        );
      }
    });

    return stats;
  }, [repos]);

  // Filtros e ordenação
  const filteredAndSortedRepos = useMemo(() => {
    const filtered = repos.filter((repo) => {
      const matchesSearch =
        searchTerm === "" ||
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.topics?.some((topic) =>
          topic.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesLanguage =
        selectedLanguage === "all" || repo.language === selectedLanguage;

      const matchesArchived = showArchived ? true : !repo.archived;

      return matchesSearch && matchesLanguage && matchesArchived;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "stars":
          comparison = a.stargazers_count - b.stargazers_count;
          break;
        case "updated":
          comparison =
            new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [repos, searchTerm, selectedLanguage, sortBy, sortOrder, showArchived]);

  // Paginação
  const totalPages = Math.ceil(filteredAndSortedRepos.length / itemsPerPage);
  const paginatedRepos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedRepos.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedRepos, currentPage, itemsPerPage]);

  // Extrair linguagens únicas para filtro
  const uniqueLanguages = useMemo(() => {
    const languages = Array.from(
      new Set(repos.map((repo) => repo.language).filter(Boolean))
    ).sort() as string[];
    return ["all", ...languages];
  }, [repos]);

  // Buscar estatísticas de linguagem para cada repositório (lazy loading)
  const loadLanguageStats = useCallback(
    async (repoName: string) => {
      if (languageStats[repoName] || loadingStats.has(repoName)) return;

      setLoadingStats((prev) => new Set(prev).add(repoName));
      try {
        const stats = await fetchLanguageStats(repoName);
        setLanguageStats((prev) => ({
          ...prev,
          [repoName]: stats,
        }));
      } catch (error) {
        console.error(`Failed to load language stats for ${repoName}:`, error);
      } finally {
        setLoadingStats((prev) => {
          const newSet = new Set(prev);
          newSet.delete(repoName);
          return newSet;
        });
      }
    },
    [languageStats, loadingStats]
  );

  const handleRepoClick = (repo: Repository) => {
    showToast(`Abrindo ${repo.name}`, "Redirecionando para o Cat...");
    setTimeout(() => {
      window.open(repo.html_url, "_blank", "noopener,noreferrer");
    }, 1000);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const calculateLanguagePercentages = (
    stats: LanguageStats
  ): { language: string; percentage: number }[] => {
    const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
    if (total === 0) return [];

    return Object.entries(stats)
      .map(([language, bytes]) => ({
        language,
        percentage: (bytes / total) * 100,
      }))
      .sort((a, b) => b.percentage - a.percentage);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedLanguage("all");
    setSortBy("updated");
    setSortOrder("desc");
    setShowArchived(false);
    setCurrentPage(1);
    showToast("Filtros resetados", undefined, "info");
  };

  const handleRefresh = () => {
    refetch();
    showToast("Repositórios atualizados", "Dados mais recentes carregados.");
  };

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Erro ao carregar
            </CardTitle>
            <CardDescription>
              Não foi possível carregar os repositórios do Cat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>Erro de conexão</AlertTitle>
              <AlertDescription>
                {error instanceof Error
                  ? error.message
                  : "Verifique sua conexão com a internet."}
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={() => refetch()} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Recarregar página
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 md:p-6">
      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          description={toast.description}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <div className="max-w-7xl mx-auto">
        {/* Header com estatísticas */}
        <Card className="mb-6 border shadow-sm bg-gradient-to-r from-white to-gray-50/50">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Avatar className="h-14 w-14 cursor-pointer border-2 border-white shadow-md">
                      <AvatarImage
                        src={`https://Cat.com/${Cat_USERNAME}.png`}
                        alt={Cat_USERNAME}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white">
                        {Cat_USERNAME.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex justify-between space-x-4">
                      <Avatar>
                        <AvatarImage
                          src={`https://Cat.com/${Cat_USERNAME}.png`}
                        />
                        <AvatarFallback>OD</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">
                          @{Cat_USERNAME}
                        </h4>
                        <p className="text-sm">
                          Visualizando {repos.length} repositórios públicos
                        </p>
                        <div className="flex items-center pt-2">
                          <span className="text-xs text-muted-foreground">
                            Dados da API do Cat
                          </span>
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {Cat_USERNAME}
                  </h1>
                  <p className="text-muted-foreground">
                    Repositórios do Cat • {repos.length} projetos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading}
                      >
                        <RefreshCw
                          className={`h-4 w-4 mr-2 ${
                            isLoading ? "animate-spin" : ""
                          }`}
                        />
                        Atualizar
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Buscar dados atualizados</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      Configurações de visualização
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center justify-between">
                      <span>Mostrar arquivados</span>
                      <Switch
                        checked={showArchived}
                        onCheckedChange={setShowArchived}
                        className="scale-75"
                      />
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setItemsPerPage(9)}>
                      9 itens por página
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setItemsPerPage(12)}>
                      12 itens por página
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setItemsPerPage(18)}>
                      18 itens por página
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          {/* Stats Cards */}
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50/80 to-blue-100/30 border-blue-200/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Stars
                      </p>
                      <p className="text-2xl font-bold">
                        {repoStats.totalStars.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Star className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50/80 to-green-100/30 border-green-200/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Forks
                      </p>
                      <p className="text-2xl font-bold">
                        {repoStats.totalForks.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <GitFork className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50/80 to-purple-100/30 border-purple-200/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Size
                      </p>
                      <p className="text-2xl font-bold">
                        {formatBytes(repoStats.totalSize * 1024)}
                      </p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Code2 className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50/80 to-orange-100/30 border-orange-200/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Linguagens
                      </p>
                      <p className="text-2xl font-bold">
                        {repoStats.languages.size}
                      </p>
                    </div>
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Cpu className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Filtros e Busca Avançada */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search" className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Buscar repositórios
                  </Label>
                  <Input
                    id="search"
                    placeholder="Nome, descrição, tópicos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Linguagem
                  </Label>
                  <Select
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as linguagens" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueLanguages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang === "all" ? "Todas as linguagens" : lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Ordenar por
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={sortBy}
                      onValueChange={(v: "stars" | "updated" | "name") =>
                        setSortBy(v)
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stars">Stars</SelectItem>
                        <SelectItem value="updated">Atualizado</SelectItem>
                        <SelectItem value="name">Nome</SelectItem>
                      </SelectContent>
                    </Select>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                            }
                          >
                            {sortOrder === "asc" ? (
                              <SortAsc className="h-4 w-4" />
                            ) : (
                              <SortDesc className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {sortOrder === "asc" ? "Crescente" : "Decrescente"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="archived"
                      checked={showArchived}
                      onCheckedChange={setShowArchived}
                    />
                    <Label htmlFor="archived" className="cursor-pointer">
                      Mostrar arquivados (
                      {repos.filter((r) => r.archived).length})
                    </Label>
                  </div>

                  <Badge variant="outline" className="gap-1">
                    <Zap className="h-3 w-3" />
                    {filteredAndSortedRepos.length} encontrados
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Limpar filtros
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Repositórios */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Repositórios</h2>
            <Tabs defaultValue="grid" className="w-auto">
              <TabsList>
                <TabsTrigger value="grid">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="list">
                  <List className="h-4 w-4 mr-2" />
                  Lista
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(itemsPerPage)].map((_, i) => (
                <RepoSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <TabsContent value="grid" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedRepos.map((repo) => (
                    <Card
                      key={repo.id}
                      className="group hover:shadow-lg transition-all duration-300 border hover:border-primary/30 bg-white/50 backdrop-blur-sm"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1 flex-1">
                            <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger className="text-left">
                                    {repo.name}
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{repo.full_name}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </CardTitle>
                            <CardDescription className="line-clamp-2 text-sm">
                              {repo.description || "Sem descrição"}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={
                              repo.archived
                                ? "secondary"
                                : repo.visibility === "public"
                                ? "default"
                                : "outline"
                            }
                            className="capitalize shrink-0"
                          >
                            {repo.visibility === "public" ? (
                              <Globe className="h-3 w-3 mr-1" />
                            ) : (
                              <Lock className="h-3 w-3 mr-1" />
                            )}
                            {repo.archived ? "Arquivado" : repo.visibility}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Linguagem Principal */}
                        {repo.language && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-medium">
                                Linguagem Principal
                              </span>
                              <Badge
                                variant="secondary"
                                className="font-normal"
                              >
                                {repo.language}
                              </Badge>
                            </div>
                          </div>
                        )}

                        {/* Distribuição de Linguagens */}
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="languages" className="border-0">
                            <AccordionTrigger
                              className="py-2 text-sm hover:no-underline"
                              onClick={() => loadLanguageStats(repo.name)}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="flex items-center gap-2">
                                  <Cpu className="h-4 w-4" />
                                  Distribuição de Tecnologias
                                  {loadingStats.has(repo.name) && (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  )}
                                </span>
                                {languageStats[repo.name] && (
                                  <Badge variant="outline" className="text-xs">
                                    {
                                      Object.keys(languageStats[repo.name])
                                        .length
                                    }{" "}
                                    langs
                                  </Badge>
                                )}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              {languageStats[repo.name] ? (
                                <div className="space-y-3 pt-2">
                                  {calculateLanguagePercentages(
                                    languageStats[repo.name]
                                  ).map(({ language, percentage }) => (
                                    <LanguageProgress
                                      key={language}
                                      language={language}
                                      percentage={percentage}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4 text-muted-foreground text-sm">
                                  Clique para carregar estatísticas
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>

                        {/* Tags/Tópicos */}
                        {repo.topics && repo.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {repo.topics.slice(0, 3).map((topic) => (
                              <Badge
                                key={topic}
                                variant="secondary"
                                className="text-xs px-2 py-0.5"
                              >
                                {topic}
                              </Badge>
                            ))}
                            {repo.topics.length > 3 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      +{repo.topics.length - 3}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                      {repo.topics.slice(3).map((topic) => (
                                        <Badge
                                          key={topic}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {topic}
                                        </Badge>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="font-semibold">
                                {repo.stargazers_count}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Stars
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <GitFork className="h-4 w-4 text-green-500" />
                              <span className="font-semibold">
                                {repo.forks_count}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Forks
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Eye className="h-4 w-4 text-blue-500" />
                              <span className="font-semibold">
                                {repo.watchers_count}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Watchers
                            </p>
                          </div>
                        </div>
                      </CardContent>

                      <Separator />

                      <CardFooter className="pt-4">
                        <div className="flex justify-between items-center w-full">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-xs text-muted-foreground">
                                  Atualizado{" "}
                                  {formatDistanceToNow(
                                    new Date(repo.updated_at),
                                    {
                                      addSuffix: true,
                                      locale: ptBR,
                                    }
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Criado em{" "}
                                  {new Date(repo.created_at).toLocaleDateString(
                                    "pt-BR"
                                  )}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Detalhes
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <FileCode className="h-5 w-5" />
                                  {repo.name}
                                </DialogTitle>
                                <DialogDescription>
                                  {repo.description ||
                                    "Repositório sem descrição"}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-3">
                                  <h4 className="font-medium">
                                    Informações do Projeto
                                  </h4>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">
                                        Branch padrão:
                                      </span>
                                      <span className="ml-2 font-medium">
                                        {repo.default_branch}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Issues abertas:
                                      </span>
                                      <span className="ml-2 font-medium">
                                        {repo.open_issues_count}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Tamanho:
                                      </span>
                                      <span className="ml-2 font-medium">
                                        {formatBytes(repo.size * 1024)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Criado em:
                                      </span>
                                      <span className="ml-2 font-medium">
                                        {new Date(
                                          repo.created_at
                                        ).toLocaleDateString("pt-BR")}
                                      </span>
                                    </div>
                                    {repo.license && (
                                      <div className="col-span-2">
                                        <span className="text-muted-foreground">
                                          Licença:
                                        </span>
                                        <span className="ml-2 font-medium">
                                          {repo.license.name}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleRepoClick(repo)}
                                    className="flex-1"
                                  >
                                    <Cat className="mr-2 h-4 w-4" />
                                    Abrir no (GitHub)
                                  </Button>
                                  <Button variant="outline" size="icon">
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="list" className="mt-0">
                <Card>
                  <ScrollArea className="h-[600px]">
                    <div className="p-6 space-y-3">
                      {paginatedRepos.map((repo) => (
                        <Card
                          key={repo.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                  <FileCode className="h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <h3 className="font-semibold">
                                      {repo.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                      {repo.description}
                                    </p>
                                  </div>
                                  <Badge variant="outline">
                                    {repo.language || "N/A"}
                                  </Badge>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Star className="h-4 w-4" />
                                      {repo.stargazers_count}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <GitFork className="h-4 w-4" />
                                      {repo.forks_count}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                onClick={() => handleRepoClick(repo)}
                                size="sm"
                                variant="ghost"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </TabsContent>
            </>
          )}

          {/* Paginação */}
          {!isLoading && filteredAndSortedRepos.length > 0 && (
            <div className="flex justify-center pt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredAndSortedRepos.length === 0 && (
            <Card className="text-center py-12 border-dashed">
              <CardContent>
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <FileCode className="h-12 w-12 text-primary/60" />
                  </div>
                  <h3 className="text-xl font-semibold">
                    Nenhum repositório encontrado
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Tente ajustar seus filtros de busca ou limpe os filtros para
                    ver todos os repositórios.
                  </p>
                  <Button
                    onClick={resetFilters}
                    variant="outline"
                    className="mt-2"
                  >
                    Limpar todos os filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
