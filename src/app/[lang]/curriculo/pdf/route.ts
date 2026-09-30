// GET /[lang]/curriculo/pdf → PDF para download, com contato (para empresas chamarem)
import { getPublishedResume } from "@/lib/content/repository";
import { buildResumeView } from "@/lib/content/resume";
import { isLocale } from "@/lib/i18n/config";
import { resume as resumeMessages } from "@/lib/i18n/messages/resume";
import { resumePdfResponse } from "@/lib/resume-pdf";
import { clientIp, rateLimit } from "@/lib/security/request-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: RouteContext<"/[lang]/curriculo/pdf">) {
  const { lang } = await params;
  if (!isLocale(lang)) return new Response(null, { status: 404 });
  const t = resumeMessages[lang];

  if (!rateLimit(`resume:pdf:${clientIp(request.headers)}`, 10, 60_000).allowed) {
    return new Response(t.tooManyPdf, { status: 429, headers: { "Retry-After": "60" } });
  }

  const published = await getPublishedResume(lang);
  if (!published) return new Response(t.notFound, { status: 404 });

  // CDN guarda por 10 min: evita gerar o PDF a cada visita
  return resumePdfResponse(buildResumeView(published.resume, { withContact: true }), published.locale, {
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
  });
}
