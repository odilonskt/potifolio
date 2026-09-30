import { Home, Newspaper } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { StatusPage } from "@/components/status/status-page";
import { Button } from "@/components/ui/button";
import { localePath } from "@/lib/i18n/config";
import { common } from "@/lib/i18n/messages/common";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = common[await getLocale()];
  return { title: `${t.status.notFoundTitle} | ${t.siteName}`, robots: { index: false } };
}

// Next.js responde com status 404 ao renderizar esta página
export default async function NotFound() {
  const locale = await getLocale();
  const t = common[locale];

  return (
    <StatusPage code={404} codeLabel={t.status.errorCode(404)} title={t.status.notFoundTitle} description={t.status.notFoundDescription}>
      <Button asChild>
        <Link href={localePath(locale)}>
          <Home data-icon="inline-start" aria-hidden="true" />
          {t.status.goHome}
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link href={localePath(locale, "/blog")}>
          <Newspaper data-icon="inline-start" aria-hidden="true" />
          {t.status.seeBlog}
        </Link>
      </Button>
    </StatusPage>
  );
}
