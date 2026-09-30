// GET /[lang]/dashboard/curriculo/pdf?idioma=en → PDF do rascunho atual, só para o admin
import type { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/auth/session";
import { getResumeDraft } from "@/lib/content/repository";
import { buildResumeView } from "@/lib/content/resume";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { resume as resumeMessages } from "@/lib/i18n/messages/resume";
import { resumePdfResponse } from "@/lib/resume-pdf";
import { rateLimit } from "@/lib/security/request-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: RouteContext<"/[lang]/dashboard/curriculo/pdf">) {
  const { lang } = await params;
  const { uid } = await requireAdmin();
  // Gerar PDF custa CPU: mesmo o admin tem limite
  if (!rateLimit(`dashboard:pdf:${uid}`, 20, 60_000).allowed) {
    return new Response(resumeMessages[isLocale(lang) ? lang : DEFAULT_LOCALE].tooManyPdfAdmin, { status: 429 });
  }

  const requested = request.nextUrl.searchParams.get("idioma");
  const contentLocale = isLocale(requested) ? requested : DEFAULT_LOCALE;
  const { resume } = await getResumeDraft(contentLocale);
  return resumePdfResponse(buildResumeView(resume, { withContact: true }), contentLocale, {
    "Cache-Control": "private, no-store",
  });
}
