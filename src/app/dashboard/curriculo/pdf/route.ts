// GET /dashboard/curriculo/pdf → PDF completo (com contato privado), só para o admin
import { requireAdmin } from "@/lib/auth/session";
import { getResumeUncached, listJourneyUncached } from "@/lib/content/repository";
import { buildResumeView, defaultResume } from "@/lib/content/resume";
import { resumePdfResponse } from "@/lib/resume-pdf";
import { rateLimit } from "@/lib/security/request-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const { uid } = await requireAdmin();
  // Gerar PDF custa CPU: mesmo o admin tem limite
  if (!rateLimit(`dashboard:pdf:${uid}`, 20, 60_000).allowed) {
    return new Response("Muitas gerações seguidas. Aguarde um minuto.", { status: 429 });
  }

  const [saved, journey] = await Promise.all([getResumeUncached(), listJourneyUncached()]);
  const resume = buildResumeView(saved ?? defaultResume(journey), journey, { includePrivate: true });
  return resumePdfResponse(resume, { "Cache-Control": "private, no-store" });
}
