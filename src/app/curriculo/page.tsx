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

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const resume = await getPublishedResume();
  // Chamar notFound() aqui faz robôs de busca receberem HTTP 404
  if (!resume) notFound();
  return {
    title: `Currículo | ${resume.name}`,
    description: `${resume.headline}. ${resume.summary}`.slice(0, 160),
    alternates: { canonical: "/curriculo" },
  };
}

export default async function ResumePage() {
  const resume = await getPublishedResume();
  if (!resume) notFound();

  // Página pública: sem e-mail, celular ou cidade (estão só no PDF)
  const view = buildResumeView(resume, { withContact: false });

  return (
    <>
      <Header />
      <main id="conteudo" className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pt-16 pb-28 sm:pt-32 print:p-0">
        <ResumeDocument
          resume={view}
          actions={
            <ResumeActions pdfHref="/curriculo/pdf">
              <Button asChild variant="ghost" size="lg">
                <Link href="/#Contato">
                  <Mail data-icon="inline-start" aria-hidden="true" />
                  Falar comigo
                </Link>
              </Button>
            </ResumeActions>
          }
        />
      </main>
    </>
  );
}
