import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

// Segurança: sem rehype-raw, HTML dentro do Markdown é exibido como texto (sem XSS),
// e o urlTransform padrão do react-markdown bloqueia javascript:, data: etc.
const components: Components = {
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
    // eslint-disable-next-line @next/next/no-img-element -- imagens externas arbitrárias do autor
    return <img src={src} alt={alt ?? ""} loading="lazy" decoding="async" className="rounded-xl border border-border" />;
  },
  // Títulos do post começam em h2: o h1 é o título da página
  h1: ({ children }) => <h2>{children}</h2>,
};

export function Markdown({ content, className }: { content: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose prose-invert prose-slate max-w-none prose-headings:scroll-mt-24 prose-headings:font-semibold prose-a:text-sky-300 prose-a:underline-offset-4 prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-border",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
