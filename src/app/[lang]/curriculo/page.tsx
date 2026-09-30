import { Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Header from "@/components/heard/page";
import { ResumeActions } from "@/components/resume/resume-actions";
import { ResumeDocument } from "@/components/resume/resume-document";
import { Button } from "@/components/ui/button";
import { getPublishedResume } from "@/lib/content/repository";
import { buildResumeView } from "@/lib/content/resume";
import { languageAlternates, localePath } from "@/lib/i18n/config";
import { resume as resumeMessages } from "@/lib/i18n/messages/resume";
import { getLocale } from "@/lib/i18n/server";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const published = await getPublishedResume(locale);
  // Chamar notFound() aqui faz robôs de busca receberem HTTP 404
  if (!published) notFound();
  const { resume } = published;
  return {
    title: resumeMessages[locale].metaTitle(resume.name),
    description: `${resume.headline}. ${resume.summary}`.slice(0, 160),
    alternates: languageAlternates(locale, "/curriculo"),
  };
}

export default async function ResumePage() {
  const locale = await getLocale();
  const published = await getPublishedResume(locale);
  if (!published) notFound();

  // Página pública: sem e-mail, celular ou cidade (estão só no PDF)
  const view = buildResumeView(published.resume, { withContact: false });

  return (
    <>
      <Header />
      <main id="conteudo" className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pt-16 pb-28 sm:pt-32 print:p-0">
        <ResumeDocument
          resume={view}
          locale={published.locale}
          actions={
            <ResumeActions pdfHref={localePath(locale, "/curriculo/pdf")} locale={published.locale}>
              <Button asChild variant="ghost" size="lg">
                <Link href={localePath(locale, "/#Contato")}>
                  <Mail data-icon="inline-start" aria-hidden="true" />
                  {resumeMessages[published.locale].contactMe}
                </Link>
              </Button>
            </ResumeActions>
          }
        />
      </main>
    </>
  );
}
