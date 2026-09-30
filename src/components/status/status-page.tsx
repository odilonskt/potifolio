import { cn } from "@/lib/utils";

/**
 * Página de status HTTP (404, 500...). O código é o elemento de destaque;
 * o título (h1) diz o que aconteceu e a descrição diz o que fazer.
 */
export function StatusPage({
  code,
  codeLabel,
  title,
  description,
  children,
  className,
}: {
  code: number;
  /** Como o leitor de tela lê o código ("Erro 404") */
  codeLabel: string;
  title: string;
  description: string;
  /** Ações (links/botões) */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      id="conteudo"
      className={cn("flex min-h-dvh items-center justify-center bg-background px-4 py-24", className)}
    >
      <div className="flex max-w-lg flex-col items-center gap-6 text-center">
        {/* Código lido como "Erro 404" por leitores de tela; os dígitos animam uma vez na entrada */}
        <p className="status-code text-8xl font-bold tracking-tighter text-foreground tabular-nums sm:text-9xl" aria-label={codeLabel}>
          {String(code)
            .split("")
            .map((digit, index) => (
              <span key={index} aria-hidden="true" style={{ animationDelay: `${index * 80}ms` }}>
                {digit}
              </span>
            ))}
        </p>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-balance text-foreground">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {children && <div className="flex flex-wrap items-center justify-center gap-3">{children}</div>}
      </div>
    </main>
  );
}
