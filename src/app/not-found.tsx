import { Home, Newspaper } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { StatusPage } from "@/components/status/status-page";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Página não encontrada | Odilon",
  robots: { index: false },
};

// Next.js responde com status 404 ao renderizar esta página
export default function NotFound() {
  return (
    <StatusPage
      code={404}
      title="Página não encontrada"
      description="O endereço pode ter mudado ou a página foi removida. Confira o link ou volte para o início."
    >
      <Button asChild>
        <Link href="/">
          <Home data-icon="inline-start" aria-hidden="true" />
          Ir para o início
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/blog">
          <Newspaper data-icon="inline-start" aria-hidden="true" />
          Ver o blog
        </Link>
      </Button>
    </StatusPage>
  );
}
