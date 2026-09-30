"use client"; // Error boundaries precisam ser Client Components

import { Home, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { StatusPage } from "@/components/status/status-page";
import { Button } from "@/components/ui/button";
import { useLocale, useMessages } from "@/lib/i18n/client";
import { localePath } from "@/lib/i18n/config";
import { common } from "@/lib/i18n/messages/common";

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
  const locale = useLocale();
  const t = useMessages(common).status;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage code={500} codeLabel={t.errorCode(500)} title={t.errorTitle} description={t.errorDescription}>
      <Button onClick={() => retry()}>
        <RotateCcw data-icon="inline-start" aria-hidden="true" />
        {t.retry}
      </Button>
      <Button asChild variant="outline">
        <Link href={localePath(locale)}>
          <Home data-icon="inline-start" aria-hidden="true" />
          {t.goHome}
        </Link>
      </Button>
      {error.digest && (
        <p className="w-full text-xs text-muted-foreground">
          {t.errorDigest} <code className="font-mono">{error.digest}</code>
        </p>
      )}
    </StatusPage>
  );
}
