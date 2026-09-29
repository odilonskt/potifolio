import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

// Segurança: sem rehype-raw, HTML dentro do Markdown é exibido como texto (sem XSS),
// e o urlTransform padrão do react-markdown bloqueia javascript:, data: etc.

/**
 * Recebe o src original e devolve a URL a usar, ou null para não carregar a imagem
 * (nesse caso mostramos o texto alternativo).
 */
export type ImageResolver = (src: string) => string | null;

function buildComponents(resolveImage?: ImageResolver): Components {
  return {
    a({ href, children, ...props }) {
      const isExternal = href?.startsWith("http");
      return (
        <a
          href={href}
          {...props}
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
        >
          {children}
          {isExternal && <span className="sr-only"> (abre em nova aba)</span>}
        </a>
      );
    },
    img({ src, alt }) {
      if (typeof src !== "string") return null;
      const resolved = resolveImage ? resolveImage(src) : src;
      if (!resolved) {
        return alt ? <span className="text-muted-foreground">[{alt}]</span> : null;
      }
      return (
        // eslint-disable-next-line @next/next/no-img-element -- imagens de conteúdo com dimensões desconhecidas
        <img
          src={resolved}
          alt={alt ?? ""}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="rounded-xl border border-border"
        />
      );
    },
    // Títulos do conteúdo começam em h2: o h1 é o título da página
    h1: ({ children }) => <h2>{children}</h2>,
  };
}

const defaultComponents = buildComponents();

export function Markdown({
  content,
  className,
  resolveImage,
}: {
  content: string;
  className?: string;
  resolveImage?: ImageResolver;
}) {
  return (
    <div
      className={cn(
        "prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-headings:font-semibold prose-a:text-brand prose-a:underline-offset-4 prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-border",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={resolveImage ? buildComponents(resolveImage) : defaultComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
