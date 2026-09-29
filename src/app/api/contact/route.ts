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
import { contactFormSchema } from "@/lib/schemas/contact-form";
import { clientIp, clientIpForStorage, exceedsBodyLimit, isSameOrigin, rateLimit } from "@/lib/security/request-guard";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 10 * 1024; // 10 KB: o formulário tem no máximo ~1 KB
const MIN_FILL_TIME_MS = 3000; // pessoas levam mais que 3s para preencher o formulário
const idSchema = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);

const json = (body: Record<string, unknown>, status = 200, headers?: HeadersInit) =>
  NextResponse.json(body, { status, headers });

/** Barreiras comuns a toda requisição que altera dados. */
function guard(request: NextRequest): NextResponse | null {
  if (!isSameOrigin(request)) return json({ success: false, error: "Origem não permitida" }, 403);
  if (exceedsBodyLimit(request, MAX_BODY_BYTES)) return json({ success: false, error: "Requisição muito grande" }, 413);
  if (!isAdminConfigured()) return json({ success: false, error: "Serviço temporariamente indisponível" }, 503);
  return null;
}

async function handleReadStatus(request: NextRequest, body: unknown, read: boolean) {
  if (!(await isAdminRequest(request))) return json({ success: false, error: "Não autorizado" }, 401);

  const id = idSchema.safeParse((body as { id?: unknown } | null)?.id);
  if (!id.success) return json({ success: false, error: "ID obrigatório" }, 400);

  const result = read ? await markAsRead(id.data) : await markAsUnread(id.data);
  return json({ success: result.success, error: result.error }, result.success ? 200 : 500);
}

async function handleSubmission(request: NextRequest, body: unknown) {
  // Antispam: no máximo 3 envios a cada 10 minutos por IP
  const limit = rateLimit(`contact:${clientIp(request.headers)}`, 3, 10 * 60 * 1000);
  if (!limit.allowed) {
    return json(
      { success: false, error: "Muitos envios seguidos. Tente de novo em alguns minutos." },
      429,
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  const { website, elapsedMs, ...fields } = (body ?? {}) as Record<string, unknown>;

  // Honeypot: campo invisível preenchido ou envio instantâneo = robô.
  // Respondemos "sucesso" sem salvar, para o robô não aprender a contornar.
  if ((typeof website === "string" && website.trim() !== "") || (typeof elapsedMs === "number" && elapsedMs < MIN_FILL_TIME_MS)) {
    return json({ success: true, message: "Contato salvo com sucesso" });
  }

  const parsed = contactFormSchema.safeParse(fields);
  if (!parsed.success) {
    return json({ success: false, error: "Dados inválidos", details: parsed.error.issues }, 400);
  }

  // Segundo limite, por e-mail: quem troca de IP continua limitado (5 por hora)
  const emailLimit = rateLimit(`contact:email:${parsed.data.email.toLowerCase()}`, 5, 60 * 60 * 1000);
  if (!emailLimit.allowed) {
    return json(
      { success: false, error: "Você já enviou várias mensagens. Aguarde um pouco para enviar outra." },
      429,
      { "Retry-After": String(emailLimit.retryAfterSeconds) },
    );
  }

  // IP registrado para prevenção de abuso (informado no formulário)
  const result = await saveContactForm(parsed.data, { ip: clientIpForStorage(request.headers) });
  if (!result.success) return json({ success: false, error: "Erro ao salvar contato" }, 500);

  return json({ success: true, id: result.data?.id, message: "Contato salvo com sucesso" });
}

export async function POST(request: NextRequest) {
  const blocked = guard(request);
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, error: "Dados inválidos" }, 400);
  }

  try {
    const action = request.nextUrl.searchParams.get("action");
    if (action === "mark-read") return await handleReadStatus(request, body, true);
    if (action === "mark-unread") return await handleReadStatus(request, body, false);
    if (action) return json({ success: false, error: "Ação desconhecida" }, 400);
    return await handleSubmission(request, body);
  } catch (error) {
    // Detalhes só no log do servidor
    console.error("Erro na API de contato:", error);
    return json({ success: false, error: "Erro interno do servidor" }, 500);
  }
}

export async function DELETE(request: NextRequest) {
  const blocked = guard(request);
  if (blocked) return blocked;

  if (!(await isAdminRequest(request))) return json({ success: false, error: "Não autorizado" }, 401);

  const id = idSchema.safeParse(request.nextUrl.searchParams.get("id"));
  if (!id.success) return json({ success: false, error: "ID obrigatório" }, 400);

  const result = await deleteContact(id.data);
  return json({ success: result.success, error: result.error }, result.success ? 200 : 500);
}

// Sem GET: a rota não expõe mais o estado da configuração do servidor
