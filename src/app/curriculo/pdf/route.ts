// GET /curriculo/pdf → PDF público (sem e-mail, telefone ou cidade)
import { getJourney, getPublishedResume } from "@/lib/content/repository";
import { buildResumeView } from "@/lib/content/resume";
import { resumePdfResponse } from "@/lib/resume-pdf";
import { clientIp, rateLimit } from "@/lib/security/request-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!rateLimit(`resume:pdf:${clientIp(request.headers)}`, 10, 60_000).allowed) {
    return new Response("Muitas requisições. Tente de novo em um minuto.", { status: 429, headers: { "Retry-After": "60" } });
  }

  const [resume, journey] = await Promise.all([getPublishedResume(), getJourney()]);
  if (!resume) return new Response("Currículo não encontrado", { status: 404 });

  // CDN guarda por 10 min: evita gerar o PDF a cada visita
  return resumePdfResponse(buildResumeView(resume, journey, { includePrivate: false }), {
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
  });
}
