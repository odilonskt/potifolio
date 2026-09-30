// GET /dashboard/curriculo/pdf → PDF completo (com contato privado), só para o admin
import { requireAdmin } from "@/lib/auth/session";
import { getResumeUncached } from "@/lib/content/repository";
import { buildResumeView, RESUME_SEED } from "@/lib/content/resume";
import { resumePdfResponse } from "@/lib/resume-pdf";
import { rateLimit } from "@/lib/security/request-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const { uid } = await requireAdmin();
  // Gerar PDF custa CPU: mesmo o admin tem limite
  if (!rateLimit(`dashboard:pdf:${uid}`, 20, 60_000).allowed) {
    return new Response("Muitas gerações seguidas. Aguarde um minuto.", { status: 429 });
  }

  const resume = buildResumeView((await getResumeUncached()) ?? RESUME_SEED, { includePrivate: true });
  return resumePdfResponse(resume, { "Cache-Control": "private, no-store" });
}
