"use client";

import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Markdown, type ImageResolver } from "@/components/blog/markdown";
import { Spinner } from "@/components/ui/spinner";

interface Repo {
  html_url: string;
  name: string;
}

// Hosts liberados em next.config.ts (images.remotePatterns). Imagens deles passam pelo
// otimizador do Next (/_next/image): quem busca no GitHub é o servidor, não o navegador,
// então o IP do visitante não chega ao GitHub. Outros hosts não são carregados.
const PROXIED_HOSTS = [
  "raw.githubusercontent.com",
  "user-images.githubusercontent.com",
  "private-user-images.githubusercontent.com",
  "avatars.githubusercontent.com",
  "camo.githubusercontent.com",
  "opengraph.githubassets.com",
];

function createReadmeImageResolver(owner: string, repo: string): ImageResolver {
  return (src) => {
    let url: URL;
    try {
      // Caminhos relativos do README apontam para arquivos do próprio repositório
      url = new URL(src, `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/`);
    } catch {
      return null;
    }

    // Links "github.com/<owner>/<repo>/blob/<ref>/<arquivo>" viram o arquivo bruto
    if (url.hostname === "github.com") {
      const match = url.pathname.match(/^\/([^/]+)\/([^/]+)\/(?:blob|raw)\/(.+)$/);
      if (!match) return null;
      url = new URL(`https://raw.githubusercontent.com/${match[1]}/${match[2]}/${match[3]}`);
    }

    if (url.protocol !== "https:" || !PROXIED_HOSTS.includes(url.hostname)) return null;
    // SVG (ex.: badges) não passa no otimizador; não carregamos para não expor o IP
    if (url.pathname.toLowerCase().endsWith(".svg")) return null;

    return `/_next/image?url=${encodeURIComponent(url.toString())}&w=1080&q=75`;
  };
}

export function ReadmeViewer({ repo }: { repo: Repo }) {
  const [readme, setReadme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [owner, repoName] = repo.html_url.replace("https://github.com/", "").split("/");

  useEffect(() => {
    const controller = new AbortController();

    const fetchReadme = async () => {
      setLoading(true);
      setError(null);

      try {
        // Proxy do próprio site: o navegador nunca chama api.github.com
        const response = await fetch(
          `/api/github/readme?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repoName)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("README não encontrado");
        }

        setReadme(await response.text());
      } catch {
        if (!controller.signal.aborted) {
          setError("README não disponível para este repositório");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchReadme();
    return () => controller.abort();
  }, [owner, repoName]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4" role="status">
        <Spinner className="h-8 w-8 text-cyan-500" />
        <p className="text-muted-foreground">Carregando README...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-muted-foreground" role="alert">
        <AlertCircle className="h-12 w-12" aria-hidden="true" />
        <p>{error}</p>
      </div>
    );
  }

  // Renderização segura: HTML do README não é interpretado (sem XSS)
  return (
    <Markdown
      content={readme ?? ""}
      className="p-4"
      resolveImage={createReadmeImageResolver(owner, repoName)}
    />
  );
}
