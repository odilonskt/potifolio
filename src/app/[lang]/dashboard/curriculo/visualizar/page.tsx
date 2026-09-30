import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { ResumeActions } from "@/components/resume/resume-actions";
import { ResumeDocument } from "@/components/resume/resume-document";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { getResumeDraft } from "@/lib/content/repository";
import { buildResumeView } from "@/lib/content/resume";
import { DEFAULT_LOCALE, isLocale, localePath } from "@/lib/i18n/config";
import { resume as resumeMessages } from "@/lib/i18n/messages/resume";
import { getLocale } from "@/lib/i18n/server";

type Props = { searchParams: Promise<{ idioma?: string }> };

export default async function ResumePreviewPage({ searchParams }: Props) {
  await requireAdmin();
  const locale = await getLocale();
  const { idioma } = await searchParams;
  const contentLocale = isLocale(idioma) ? idioma : DEFAULT_LOCALE;
  const { resume } = await getResumeDraft(contentLocale);
  const query = `?idioma=${contentLocale}`;

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" asChild className="self-start print:hidden">
        <Link href={localePath(locale, `/dashboard/curriculo${query}`)}>
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          {resumeMessages[locale].editor.backToEdit}
        </Link>
      </Button>
      <ResumeDocument
        resume={buildResumeView(resume, { withContact: true })}
        locale={contentLocale}
        actions={<ResumeActions pdfHref={localePath(locale, `/dashboard/curriculo/pdf${query}`)} locale={contentLocale} />}
      />
    </div>
  );
}
