// app/api/contact/route.ts
// POST  /api/contact                    → envia o formulário (público)
// POST  /api/contact?action=mark-read   → marca como lida (admin)
// POST  /api/contact?action=mark-unread → marca como não lida (admin)
// DELETE /api/contact?id=...            → exclui (admin)
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { isAdminRequest } from "@/lib/auth/session";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { deleteContact, markAsRead, markAsUnread, saveContactForm } from "@/lib/firebase-contacts";
import { dashboard } from "@/lib/i18n/messages/dashboard";
import { home } from "@/lib/i18n/messages/home";
import { getRequestLocale } from "@/lib/i18n/server";
import { createContactFormSchema } from "@/lib/schemas/contact-form";
import { clientIp, exceedsBodyLimit, isSameOrigin, rateLimit } from "@/lib/security/request-guard";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 10 * 1024; // 10 KB: o formulário tem no máximo ~1 KB
const MIN_FILL_TIME_MS = 3000; // pessoas levam mais que 3s para preencher o formulário
const idSchema = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);

const json = (body: Record<string, unknown>, status = 200, headers?: HeadersInit) =>
  NextResponse.json(body, { status, headers });

type ServerMessages = (typeof home)["pt"]["contact"]["server"];

async function messages() {
  const locale = await getRequestLocale();
  return { locale, t: home[locale].contact.server, admin: dashboard[locale].api };
}

/** Barreiras comuns a toda requisição que altera dados. */
function guard(request: NextRequest, t: ServerMessages): NextResponse | null {
  if (!isSameOrigin(request)) return json({ success: false, error: t.forbiddenOrigin }, 403);
  if (exceedsBodyLimit(request, MAX_BODY_BYTES)) return json({ success: false, error: t.tooLarge }, 413);
  if (!isAdminConfigured()) return json({ success: false, error: t.unavailable }, 503);
  return null;
}

type AdminMessages = (typeof dashboard)["pt"]["api"];

async function handleReadStatus(request: NextRequest, body: unknown, read: boolean, admin: AdminMessages) {
  if (!(await isAdminRequest(request))) return json({ success: false, error: admin.unauthorized }, 401);

  const id = idSchema.safeParse((body as { id?: unknown } | null)?.id);
  if (!id.success) return json({ success: false, error: admin.idRequired }, 400);

  const result = read ? await markAsRead(id.data) : await markAsUnread(id.data);
  return json({ success: result.success, error: result.error }, result.success ? 200 : 500);
}

async function handleSubmission(request: NextRequest, body: unknown, locale: Awaited<ReturnType<typeof getRequestLocale>>) {
  const t = home[locale].contact.server;
  // Antispam: no máximo 3 envios a cada 10 minutos por IP
  const limit = rateLimit(`contact:${clientIp(request.headers)}`, 3, 10 * 60 * 1000);
  if (!limit.allowed) {
    return json(
      { success: false, error: t.tooManyIp },
      429,
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  const { website, elapsedMs, ...fields } = (body ?? {}) as Record<string, unknown>;

  // Honeypot: campo invisível preenchido ou envio instantâneo = robô.
  // Respondemos "sucesso" sem salvar, para o robô não aprender a contornar.
  if ((typeof website === "string" && website.trim() !== "") || (typeof elapsedMs === "number" && elapsedMs < MIN_FILL_TIME_MS)) {
    return json({ success: true, message: t.saved });
  }

  const parsed = createContactFormSchema(home[locale].contact.validation).safeParse(fields);
  if (!parsed.success) {
    return json({ success: false, error: parsed.error.issues[0]?.message ?? t.invalid, details: parsed.error.issues }, 400);
  }

  // Segundo limite, por e-mail: quem troca de IP continua limitado (5 por hora)
  const emailLimit = rateLimit(`contact:email:${parsed.data.email.toLowerCase()}`, 5, 60 * 60 * 1000);
  if (!emailLimit.allowed) {
    return json(
      { success: false, error: t.tooManyEmail },
      429,
      { "Retry-After": String(emailLimit.retryAfterSeconds) },
    );
  }

  const result = await saveContactForm(parsed.data);
  if (!result.success) return json({ success: false, error: t.saveError }, 500);

  return json({ success: true, id: result.data?.id, message: t.saved });
}

export async function POST(request: NextRequest) {
  const { locale, t, admin } = await messages();
  const blocked = guard(request, t);
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, error: t.invalid }, 400);
  }

  try {
    const action = request.nextUrl.searchParams.get("action");
    if (action === "mark-read") return await handleReadStatus(request, body, true, admin);
    if (action === "mark-unread") return await handleReadStatus(request, body, false, admin);
    if (action) return json({ success: false, error: admin.unknownAction }, 400);
    return await handleSubmission(request, body, locale);
  } catch (error) {
    // Detalhes só no log do servidor
    console.error("Erro na API de contato:", error);
    return json({ success: false, error: t.internal }, 500);
  }
}

export async function DELETE(request: NextRequest) {
  const { t, admin } = await messages();
  const blocked = guard(request, t);
  if (blocked) return blocked;

  if (!(await isAdminRequest(request))) return json({ success: false, error: admin.unauthorized }, 401);

  const id = idSchema.safeParse(request.nextUrl.searchParams.get("id"));
  if (!id.success) return json({ success: false, error: admin.idRequired }, 400);

  const result = await deleteContact(id.data);
  return json({ success: result.success, error: result.error }, result.success ? 200 : 500);
}

// Sem GET: a rota não expõe mais o estado da configuração do servidor
