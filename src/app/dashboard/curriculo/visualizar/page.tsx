import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { ResumeActions } from "@/components/resume/resume-actions";
import { ResumeDocument } from "@/components/resume/resume-document";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { getResumeUncached } from "@/lib/content/repository";
import { buildResumeView, RESUME_SEED } from "@/lib/content/resume";

export default async function ResumePreviewPage() {
  await requireAdmin();
  const resume = buildResumeView((await getResumeUncached()) ?? RESUME_SEED, { withContact: true });

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" asChild className="self-start print:hidden">
        <Link href="/dashboard/curriculo">
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          Voltar para edição
        </Link>
      </Button>
      <ResumeDocument resume={resume} actions={<ResumeActions pdfHref="/dashboard/curriculo/pdf" />} />
    </div>
  );
}
