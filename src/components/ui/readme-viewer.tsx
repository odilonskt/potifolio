"use client";

import { Spinner } from "@/components/ui/spinner";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface Repo {
  html_url: string;
  name: string;
}

export function ReadmeViewer({ repo }: { repo: Repo }) {
  const [readme, setReadme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReadme = async () => {
      setLoading(true);
      setError(null);

      const repoPath = repo.html_url.replace("https://github.com/", "");

      try {
        const response = await fetch(
          `https://api.github.com/repos/${repoPath}/readme`
        );

        if (!response.ok) {
          throw new Error("README não encontrado");
        }

        const data = await response.json();
        const content = atob(data.content);

        if (data.name.toLowerCase().endsWith(".html")) {
          setReadme(content);
        } else {
          const htmlContent = convertMarkdownToHtml(content);
          setReadme(htmlContent);
        }
      } catch (err) {
        setError("README não disponível para este repositório");
      } finally {
        setLoading(false);
      }
    };

    fetchReadme();
  }, [repo]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Spinner className="h-8 w-8 text-cyan-500" />
        <p className="text-muted-foreground">Carregando README...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-muted-foreground">
        <AlertCircle className="h-12 w-12" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="readme-content prose prose-invert max-w-none p-4">
      <style jsx global>{`
        .readme-content {
          color: hsl(var(--foreground));
        }
        .readme-content h1,
        .readme-content h2,
        .readme-content h3,
        .readme-content h4,
        .readme-content h5,
        .readme-content h6 {
          color: hsl(var(--foreground));
          border-bottom: 1px solid hsl(var(--border));
          padding-bottom: 0.5rem;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }
        .readme-content h1 {
          font-size: 2rem;
        }
        .readme-content h2 {
          font-size: 1.5rem;
        }
        .readme-content h3 {
          font-size: 1.25rem;
        }
        .readme-content p {
          margin: 1rem 0;
          line-height: 1.7;
        }
        .readme-content a {
          color: #22d3ee;
          text-decoration: none;
        }
        .readme-content a:hover {
          text-decoration: underline;
        }
        .readme-content code {
          background: hsl(var(--muted));
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }
        .readme-content pre {
          background: hsl(var(--muted));
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }
        .readme-content pre code {
          background: none;
          padding: 0;
        }
        .readme-content ul,
        .readme-content ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        .readme-content li {
          margin: 0.5rem 0;
        }
        .readme-content blockquote {
          border-left: 4px solid #22d3ee;
          padding-left: 1rem;
          margin: 1rem 0;
          color: hsl(var(--muted-foreground));
        }
        .readme-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
        }
        .readme-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        .readme-content th,
        .readme-content td {
          border: 1px solid hsl(var(--border));
          padding: 0.5rem;
        }
        .readme-content th {
          background: hsl(var(--muted));
        }
        .readme-content hr {
          border: none;
          border-top: 1px solid hsl(var(--border));
          margin: 2rem 0;
        }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: readme || "" }} />
    </div>
  );
}

function convertMarkdownToHtml(markdown: string): string {
  let html = markdown
    .replace(/^######\s+(.*)$/gm, "<h6>$1</h6>")
    .replace(/^#####\s+(.*)$/gm, "<h5>$1</h5>")
    .replace(/^####\s+(.*)$/gm, "<h4>$1</h4>")
    .replace(/^###\s+(.*)$/gm, "<h3>$1</h3>")
    .replace(/^##\s+(.*)$/gm, "<h2>$1</h2>")
    .replace(/^#\s+(.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/```(\w+)?\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(
      /\[([^\]]+)\]$$([^)]+)$$/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    .replace(/!\[([^\]]*)\]$$([^)]+)$$/g, '<img src="$2" alt="$1" />')
    .replace(/^>\s+(.*)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^[*-]\s+(.*)$/gm, "<li>$1</li>")
    .replace(/^---$/gm, "<hr />")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br />");

  html = `<p>${html}</p>`;
  html = html.replace(/(<li>[\s\S]*?<\/li>)+/g, (match) => `<ul>${match}</ul>`);
  return html;
}
