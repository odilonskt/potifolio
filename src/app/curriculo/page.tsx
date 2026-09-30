import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Header from "@/components/heard/page";
import { ResumeActions } from "@/components/resume/resume-actions";
import { ResumeDocument } from "@/components/resume/resume-document";
import { getJourney, getPublishedResume } from "@/lib/content/repository";
import { buildResumeView } from "@/lib/content/resume";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const resume = await getPublishedResume();
  // Chamar notFound() aqui faz robôs de busca receberem HTTP 404
  if (!resume) notFound();
  return {
    title: `Currículo | ${resume.name}`,
    description: `${resume.role}. ${resume.summary}`.slice(0, 160),
    alternates: { canonical: "/curriculo" },
  };
}

export default async function ResumePage() {
  const [resume, journey] = await Promise.all([getPublishedResume(), getJourney()]);
  if (!resume) notFound();

  // Versão pública: sem e-mail, telefone ou cidade
  const view = buildResumeView(resume, journey, { includePrivate: false });

  return (
    <>
      <Header />
      <main id="conteudo" className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pt-16 pb-28 sm:pt-32 print:p-0">
        <ResumeActions pdfHref="/curriculo/pdf" />
        <ResumeDocument resume={view} />
      </main>
    </>
  );
}
