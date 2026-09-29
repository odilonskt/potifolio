"use client"; // Error boundaries precisam ser Client Components

import { Home, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { StatusPage } from "@/components/status/status-page";
import { Button } from "@/components/ui/button";

/**
 * Erro inesperado (status 500) em qualquer página abaixo do layout raiz.
 * A mensagem técnica nunca é exibida: só o "digest", que casa com o log do servidor.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      code={500}
      title="Algo deu errado"
      description="Um erro inesperado impediu esta página de carregar. Tente de novo em alguns segundos."
    >
      <Button onClick={() => retry()}>
        <RotateCcw data-icon="inline-start" aria-hidden="true" />
        Tentar de novo
      </Button>
      <Button asChild variant="outline">
        <Link href="/">
          <Home data-icon="inline-start" aria-hidden="true" />
          Ir para o início
        </Link>
      </Button>
      {error.digest && (
        <p className="w-full text-xs text-muted-foreground">
          Código do erro: <code className="font-mono">{error.digest}</code>
        </p>
      )}
    </StatusPage>
  );
}
