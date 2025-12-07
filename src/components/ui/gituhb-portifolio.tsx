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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  default_branch: string;
  has_pages?: boolean;
}

interface Languages {
  [key: string]: number;
}

interface ApiError {
  status: number;
  message: string;
  documentation_url?: string;
}

interface GitHubFile {
  name: string;
  path: string;
  type: string;
  download_url: string | null;
}

// Componente ReadmeViewer atualizado
interface ReadmeViewerProps {
  repo: Repo;
  username: string;
}

function ReadmeViewer({ repo, username }: ReadmeViewerProps) {
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReadme = async () => {
      try {
        setLoading(true);
        setError(null);

        // Tentar diferentes nomes de README
        const readmeNames = [
          "README.md",
          "readme.md",
          "Readme.md",
          "README.MD",
          "README",
        ];

        for (const name of readmeNames) {
          const readmeUrl = `https://raw.githubusercontent.com/${username}/${repo.name}/${repo.default_branch}/${name}`;

          try {
            const response = await fetch(readmeUrl);
            if (response.ok) {
              const content = await response.text();
              setReadmeContent(content);
              setLoading(false);
              return;
            }
          } catch (err) {
            continue;
          }
        }

        // Se não encontrar README
        setError("README não encontrado para este repositório.");
        setReadmeContent(
          `# ${repo.name}\n\n${repo.description || "Sem descrição disponível."}`
        );
      } catch (err) {
        console.error("Error fetching README:", err);
        setError("Erro ao carregar README.");
        setReadmeContent(
          `# ${repo.name}\n\n${repo.description || "Sem descrição disponível."}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReadme();
  }, [repo, username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8 text-cyan-500" />
        <span className="ml-2">Carregando README...</span>
      </div>
    );
  }

  if (error && !readmeContent) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="prose prose-invert max-w-none p-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mb-4 text-cyan-400">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold mb-3 text-cyan-300">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-bold mb-2 text-cyan-200">{children}</h3>
          ),
          p: ({ children }) => <p className="mb-4 text-gray-300">{children}</p>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              {children}
            </a>
          ),
          code: ({ children, className }) => {
            const isInline = !className?.includes("language-");
            return isInline ? (
              <code className="bg-gray-800 text-cyan-300 px-1 py-0.5 rounded text-sm">
                {children}
              </code>
            ) : (
              <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto my-4">
                <code className={className}>{children}</code>
              </pre>
            );
          },
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-4 text-gray-300">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-4 text-gray-300">{children}</ol>
          ),
          li: ({ children }) => <li className="mb-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-cyan-500 pl-4 italic my-4 text-gray-400">
              {children}
            </blockquote>
          ),
          // CORREÇÃO AQUI: Definir tipo explícito para src e tratar Blob
          img: ({ src, alt }: { src?: string | Blob; alt?: string }) => {
            // Se não tiver src, usar placeholder
            if (!src) {
              return (
                <div className="my-4">
                  <Image
                    src="/placeholder.png"
                    alt={alt || "Imagem do README"}
                    width={800}
                    height={400}
                    className="rounded-lg max-w-full h-auto"
                  />
                </div>
              );
            }

            // Converter Blob para string URL se necessário
            let srcString: string;
            if (typeof src === "string") {
              srcString = src;
            } else {
              // Se for Blob, criar URL temporária
              srcString = URL.createObjectURL(src);
            }

            // Se for uma imagem relativa, converter para URL absoluta
            let imageUrl = srcString;
            if (
              srcString &&
              !srcString.startsWith("http") &&
              !srcString.startsWith("data:")
            ) {
              imageUrl = `https://raw.githubusercontent.com/${username}/${repo.name}/${repo.default_branch}/${srcString}`;
            }

            const isSvg =
              imageUrl?.includes(".svg") || imageUrl?.includes("image/svg+xml");

            return (
              <div className="my-4">
                <Image
                  src={imageUrl || "/placeholder.png"}
                  alt={alt || "Imagem do README"}
                  width={800}
                  height={400}
                  className="rounded-lg max-w-full h-auto"
                  unoptimized={isSvg}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                  onLoad={() => {
                    // Limpar URL temporária se for Blob
                    if (typeof src !== "string") {
                      URL.revokeObjectURL(srcString);
                    }
                  }}
                />
              </div>
            );
          },
        }}
      >
        {readmeContent ||
          `# ${repo.name}\n\n${
            repo.description || "Sem descrição disponível."
          }`}
      </ReactMarkdown>
    </div>
  );
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
  username: string;
}

function RepoCard({
  repo,
  viewMode,
  index,
  onSelectRepo,
  repoLanguages,
  username,
}: RepoCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Estado para imagem do projeto
  const [projectImage, setProjectImage] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);

  useEffect(() => {
    const fetchRepoImage = async () => {
      try {
        // Estratégia 1: Verificar por arquivos de imagem específicos na raiz
        const imageExtensions = [
          ".png",
          ".jpg",
          ".jpeg",
          ".gif",
          ".webp",
          ".svg",
        ];
        const imageNames = [
          "screenshot",
          "preview",
          "demo",
          "example",
          "banner",
          "cover",
          "thumbnail",
          "logo",
          "project",
          "app",
          "home",
          "main",
          repo.name.toLowerCase().replace(/[-_]/g, ""),
        ];

        // Verificar por arquivos de imagem específicos primeiro
        for (const name of imageNames) {
          for (const ext of imageExtensions) {
            const potentialImage = `${name}${ext}`;
            const imageUrl = `https://raw.githubusercontent.com/${username}/${repo.name}/${repo.default_branch}/${potentialImage}`;

            try {
              const response = await fetch(imageUrl, { method: "HEAD" });
              if (response.ok) {
                setProjectImage(imageUrl);
                setLoadingImage(false);
                return;
              }
            } catch (error) {
              continue;
            }
          }
        }

        // Estratégia 2: Buscar README e extrair imagens
        const readmeUrl = `https://raw.githubusercontent.com/${username}/${repo.name}/${repo.default_branch}/README.md`;
        const readmeResponse = await fetch(readmeUrl);

        if (readmeResponse.ok) {
          const readmeContent = await readmeResponse.text();
          const imageRegex = /!\[.*?\]\((.*?)\)/g;
          const matches = Array.from(readmeContent.matchAll(imageRegex));

          for (const match of matches) {
            const imgUrl = match[1];
            // Verificar se é uma URL absoluta
            if (imgUrl.startsWith("http")) {
              setProjectImage(imgUrl);
              setLoadingImage(false);
              return;
            } else if (!imgUrl.startsWith("data:")) {
              // URL relativa - construir URL completa
              const baseUrl = `https://raw.githubusercontent.com/${username}/${repo.name}/${repo.default_branch}/`;
              try {
                const fullImageUrl = new URL(imgUrl, baseUrl).href;
                const response = await fetch(fullImageUrl, { method: "HEAD" });
                if (response.ok) {
                  setProjectImage(fullImageUrl);
                  setLoadingImage(false);
                  return;
                }
              } catch (error) {
                continue;
              }
            }
          }
        }

        // Estratégia 3: Buscar lista de arquivos no repositório
        const filesResponse = await fetch(
          `https://api.github.com/repos/${username}/${repo.name}/contents/`
        );

        if (filesResponse.ok) {
          const files: GitHubFile[] = await filesResponse.json();

          // Procurar por imagens na raiz
          const imageFile = files.find((file) =>
            imageExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
          );

          if (imageFile?.download_url) {
            setProjectImage(imageFile.download_url);
            setLoadingImage(false);
            return;
          }
        }

        // Fallback: Imagem baseada na linguagem/tópicos
        const fallbackImage = getFallbackImage(repo);
        setProjectImage(fallbackImage);
      } catch (error) {
        console.error(`Error fetching image for ${repo.name}:`, error);
        const fallbackImage = getFallbackImage(repo);
        setProjectImage(fallbackImage);
      } finally {
        setLoadingImage(false);
      }
    };

    fetchRepoImage();
  }, [repo, username]);

  // Função para gerar imagem de fallback
  const getFallbackImage = (repoData: Repo): string => {
    // Mapeamento de cores para linguagens
    const languageColors: Record<string, string> = {
      JavaScript: "rgb(247, 223, 30)",
      TypeScript: "rgb(49, 120, 198)",
      HTML: "rgb(227, 76, 38)",
      CSS: "rgb(86, 61, 124)",
      Python: "rgb(53, 114, 165)",
      Java: "rgb(176, 114, 25)",
      "C++": "rgb(243, 75, 125)",
      Go: "rgb(0, 173, 216)",
      Rust: "rgb(222, 165, 132)",
      PHP: "rgb(136, 146, 190)",
      Ruby: "rgb(204, 52, 45)",
      Shell: "rgb(137, 224, 81)",
      Vue: "rgb(65, 184, 131)",
      Dart: "rgb(0, 180, 171)",
      Swift: "rgb(255, 172, 69)",
      Kotlin: "rgb(127, 82, 255)",
    };

    const language = repoData.language || "Code";
    const bgColor = languageColors[language] || "rgb(75, 85, 99)";

    // Criar SVG personalizado com as informações do projeto
    const svgContent = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <!-- Fundo gradiente -->
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <rect width="400" height="300" fill="url(#grad1)" rx="8"/>
        <rect width="400" height="80" fill="#111827" rx="8"/>
        
        <!-- Ícone do projeto baseado na linguagem -->
        <g transform="translate(20, 100)">
          <rect width="80" height="80" rx="12" fill="${bgColor}"/>
          <text x="40" y="45" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="24">
            ${language.charAt(0).toUpperCase()}
          </text>
        </g>
        
        <!-- Nome do projeto -->
        <text x="120" y="130" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="18">
          ${
            repoData.name.length > 20
              ? repoData.name.substring(0, 20) + "..."
              : repoData.name
          }
        </text>
        
        <!-- Linguagem -->
        <text x="120" y="160" fill="#9ca3af" font-family="Arial, sans-serif" font-size="14">
          ${language}
        </text>
        
        <!-- Stats -->
        <g transform="translate(120, 185)">
          <!-- Stars -->
          <circle cx="8" cy="8" r="6" fill="#fbbf24"/>
          <text x="25" y="12" fill="white" font-family="Arial, sans-serif" font-size="11">
            ${repoData.stargazers_count}
          </text>
          
          <!-- Forks -->
          <circle cx="65" cy="8" r="6" fill="#60a5fa"/>
          <text x="82" y="12" fill="white" font-family="Arial, sans-serif" font-size="11">
            ${repoData.forks_count}
          </text>
        </g>
        
        <!-- Tópicos (se existirem) -->
        <g transform="translate(20, 220)">
          ${
            repoData.topics
              ?.slice(0, 3)
              .map(
                (topic, i) => `
            <rect x="${
              i * 80
            }" y="0" width="70" height="24" rx="12" fill="#1f2937"/>
            <text x="${
              i * 80 + 35
            }" y="15" text-anchor="middle" fill="#3b82f6" font-family="Arial, sans-serif" font-size="10" font-weight="bold">
              ${topic.length > 8 ? topic.substring(0, 8) + "..." : topic}
            </text>
          `
              )
              .join("") || ""
          }
        </g>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  };

  // Função para verificar se a imagem é SVG
  const isSvgImage = (url: string | null): boolean => {
    if (!url) return false;
    return (
      url.includes(".svg") ||
      url.includes("image/svg+xml") ||
      url.startsWith("data:image/svg")
    );
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
        {/* Imagem do Projeto */}
        <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-gray-900">
          {loadingImage ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner className="h-8 w-8 text-cyan-500" />
            </div>
          ) : projectImage ? (
            <>
              <Image
                src={projectImage}
                alt={repo.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized={isSvgImage(projectImage)}
                onError={(e) => {
                  // Se a imagem falhar ao carregar, usar fallback
                  const fallback = getFallbackImage(repo);
                  setProjectImage(fallback);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <span className="text-sm text-gray-500">
                  Carregando imagem...
                </span>
              </div>
            </div>
          )}

          {/* Badge de linguagem sobre a imagem */}
          {repo.language && (
            <div className="absolute top-3 left-3 z-10">
              <Badge
                variant="outline"
                className="bg-black/80 text-white border-white/40 backdrop-blur-sm hover:bg-black/90"
              >
                {repo.language}
              </Badge>
            </div>
          )}

          {/* Ícone de visualização */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Title & Description */}
        <div className="flex-grow">
          <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-500 transition-colors line-clamp-1">
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
                className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-auto pt-4 border-t border-gray-800">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {repo.stargazers_count}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="h-3 w-3" />
              {repo.forks_count}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="text-xs">
              Atualizado {formatDate(repo.updated_at)}
            </span>
          </div>

          <div className="flex gap-2">
            {/* Operador ternário para mostrar apenas um botão */}
            {repo.homepage ? (
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
            ) : repo.has_pages ? (
              <Button
                size="sm"
                variant="default"
                className="gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    `https://${username}.github.io/${repo.name}`,
                    "_blank"
                  );
                }}
              >
                <Globe className="h-3 w-3" />
                Pages
              </Button>
            ) : null}

            {/* Botão GitHub (sempre visível) */}
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
              Code
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
          <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gray-900">
            {projectImage && !loadingImage ? (
              <Image
                src={projectImage}
                alt={repo.name}
                fill
                className="object-cover"
                sizes="192px"
                unoptimized={isSvgImage(projectImage)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
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

        // Usar Promise.all para buscar todas as linguagens em paralelo
        const languagePromises = reposArray.map(async (repo) => {
          try {
            const response = await fetch(repo.languages_url);
            if (response.ok) {
              const data = await response.json();
              languages[repo.name] = data;
            } else {
              languages[repo.name] = repo.language
                ? { [repo.language]: 100 }
                : {};
            }
          } catch (error) {
            console.error(`Error fetching languages for ${repo.name}:`, error);
            languages[repo.name] = repo.language
              ? { [repo.language]: 100 }
              : {};
          }
        });

        await Promise.all(languagePromises);
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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Spinner className="h-12 w-12 text-cyan-500" />
        <p className="text-muted-foreground animate-pulse">
          Carregando projetos do GitHub...
        </p>
      </div>
    );
  }

  if (error) {
    console.error("GithubPortfolio Error:", error);

    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
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
                    em alguns minutos.
                  </p>
                </div>
              )}

              {isUserNotFound && (
                <div className="text-left mt-2">
                  <p className="font-semibold">Usuário não encontrado:</p>
                  <p className="text-sm mt-1">
                    O usuário {username} não foi encontrado no GitHub.
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center max-w-md">
          <Alert className="mb-4">
            <AlertTitle>Nenhum repositório encontrado</AlertTitle>
            <AlertDescription>
              O usuário {username} não possui repositórios públicos.
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
      <div className="container mx-auto px-4 py-8">
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
              Atualizar
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="p-4 text-center bg-gray-900/50 border-gray-800">
            <div className="text-2xl font-bold text-cyan-500">
              {reposArray.length}
            </div>
            <div className="text-sm text-gray-400">Projetos</div>
          </Card>
          <Card className="p-4 text-center bg-gray-900/50 border-gray-800">
            <div className="text-2xl font-bold text-green-500">
              {Object.keys(languages).length}
            </div>
            <div className="text-sm text-gray-400">Linguagens</div>
          </Card>
          <Card className="p-4 text-center bg-gray-900/50 border-gray-800">
            <div className="text-2xl font-bold text-yellow-500">
              {reposArray.reduce((sum, repo) => sum + repo.stargazers_count, 0)}
            </div>
            <div className="text-sm text-gray-400">Stars</div>
          </Card>
          <Card className="p-4 text-center bg-gray-900/50 border-gray-800">
            <div className="text-2xl font-bold text-purple-500">
              {reposArray.filter((repo) => repo.homepage).length}
            </div>
            <div className="text-sm text-gray-400">Deploys</div>
          </Card>
        </motion.div>

        <Separator className="my-8 bg-gray-800" />

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
                  username={username}
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
                      ? "Tente remover o filtro de linguagem."
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
              {selectedRepo && (
                <ReadmeViewer repo={selectedRepo} username={username} />
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
