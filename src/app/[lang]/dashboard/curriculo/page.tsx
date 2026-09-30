import { CheckCircle2, Download, ExternalLink, Eye } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/session";
import { getResumeDraft, getResumeUncached } from "@/lib/content/repository";
import { DEFAULT_LOCALE, HTML_LANG, isLocale, LOCALE_NAMES, LOCALES, localePath } from "@/lib/i18n/config";
import { common } from "@/lib/i18n/messages/common";
import { resume as resumeMessages } from "@/lib/i18n/messages/resume";
import { getLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

import { PageHeader } from "../page-header";
import { ResumeForm } from "./resume-form";

type Props = { searchParams: Promise<{ salvo?: string; idioma?: string }> };

export default async function ResumeDashboardPage({ searchParams }: Props) {
  await requireAdmin();
  const locale = await getLocale();
  const t = resumeMessages[locale].editor;
  const { salvo, idioma } = await searchParams;
  // Idioma do conteúdo editado (a interface do painel segue o idioma da URL)
  const contentLocale = isLocale(idioma) ? idioma : DEFAULT_LOCALE;

  const [{ resume, saved }, base] = await Promise.all([getResumeDraft(contentLocale), getResumeUncached("pt")]);
  const published = base?.published ?? false;
  const query = `?idioma=${contentLocale}`;

  return (
    <>
      <PageHeader title={t.title} description={t.description} />

      <nav aria-label={t.languageTabs} className="mb-6">
        <ul className="inline-flex gap-1 rounded-lg border border-border p-1">
          {LOCALES.map((option) => (
            <li key={option}>
              <Link
                href={localePath(locale, `/dashboard/curriculo?idioma=${option}`)}
                lang={HTML_LANG[option]}
                aria-current={option === contentLocale ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  "aria-[current=page]:bg-foreground aria-[current=page]:text-background",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
              >
                {LOCALE_NAMES[option]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Card className="order-2 lg:order-1">
          <CardHeader>
            <CardTitle>{saved ? t.editTitle : t.newTitle}</CardTitle>
            <CardDescription>
              {t.languageNote(LOCALE_NAMES[contentLocale])}
              {!saved && ` ${contentLocale === "pt" ? t.draftNote : t.translationDraftNote}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* key força o remount ao trocar de idioma */}
            <ResumeForm key={contentLocale} resume={resume} contentLocale={contentLocale} />
          </CardContent>
        </Card>

        <aside aria-labelledby="resume-output-title" className="order-1 flex flex-col gap-4 self-start lg:order-2">
          <h2 id="resume-output-title" className="font-semibold text-foreground">
            {t.output}
          </h2>

          <div aria-live="polite">
            {salvo && (
              <Alert>
                <CheckCircle2 aria-hidden="true" />
                <AlertDescription>
                  {t.saved}
                  {published ? t.savedPublic : ""}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" asChild>
              <Link href={localePath(locale, `/dashboard/curriculo/visualizar${query}`)}>
                <Eye data-icon="inline-start" aria-hidden="true" />
                {t.preview}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href={localePath(locale, `/dashboard/curriculo/pdf${query}`)} download>
                <Download data-icon="inline-start" aria-hidden="true" />
                {t.downloadPdf}
              </a>
            </Button>
            {published && (
              <Button variant="outline" asChild>
                <Link href={localePath(contentLocale, "/curriculo")} target="_blank">
                  <ExternalLink data-icon="inline-start" aria-hidden="true" />
                  {t.seePublic}
                  <span className="sr-only"> {common[locale].newTab}</span>
                </Link>
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground">{t.pdfNote}</p>
        </aside>
      </div>
    </>
  );
}
