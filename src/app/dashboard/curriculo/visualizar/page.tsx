import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { ResumeActions } from "@/components/resume/resume-actions";
import { ResumeDocument } from "@/components/resume/resume-document";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { getResumeUncached, listJourneyUncached } from "@/lib/content/repository";
import { buildResumeView, defaultResume } from "@/lib/content/resume";

export default async function ResumePreviewPage() {
  await requireAdmin();
  const [saved, journey] = await Promise.all([getResumeUncached(), listJourneyUncached()]);
  const resume = buildResumeView(saved ?? defaultResume(journey), journey, { includePrivate: true });

  return (
    <div className="flex flex-col gap-6">
      <ResumeActions pdfHref="/dashboard/curriculo/pdf">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/curriculo">
            <ArrowLeft data-icon="inline-start" aria-hidden="true" />
            Voltar para edição
          </Link>
        </Button>
      </ResumeActions>
      <ResumeDocument resume={resume} />
    </div>
  );
}
