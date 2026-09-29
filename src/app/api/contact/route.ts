// app/api/contact/route.ts
import { saveContactForm } from "@/lib/firebase";
import {
  deleteContact,
  markAsRead,
  markAsUnread,
} from "@/lib/firebase-contacts";
import { contactFormSchema } from "@/lib/schemas/contact-form";
import { isAdminRequest } from "@/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";

const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

// Marcar como dinâmico para não ser otimizado durante build
export const dynamic = "force-dynamic";

// POST - Criar novo contato ou atualizar status
export async function POST(request: NextRequest) {
  try {
    // Verificar se o Firebase está configurado
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Serviço temporariamente indisponível",
        },
        { status: 503 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos",
        },
        { status: 400 }
      );
    }

    const action = request.nextUrl.searchParams.get("action");

    // Ações do painel exigem admin; o envio do formulário de contato continua público
    if (action === "mark-read" || action === "mark-unread") {
      if (!(await isAdminRequest(request))) {
        return NextResponse.json(
          { success: false, error: "Não autorizado" },
          { status: 401 }
        );
      }
      if (typeof body?.id !== "string" || !ID_PATTERN.test(body.id)) {
        return NextResponse.json(
          { success: false, error: "ID obrigatório" },
          { status: 400 }
        );
      }
    }

    // Ação: marcar como lido
    if (action === "mark-read") {
      const { id } = body;
      if (!id) {
        return NextResponse.json(
          { success: false, error: "ID obrigatório" },
          { status: 400 }
        );
      }
      const result = await markAsRead(id);
      return NextResponse.json(result);
    }

    // Ação: marcar como não lido
    if (action === "mark-unread") {
      const { id } = body;
      if (!id) {
        return NextResponse.json(
          { success: false, error: "ID obrigatório" },
          { status: 400 }
        );
      }
      const result = await markAsUnread(id);
      return NextResponse.json(result);
    }

    // Padrão: criar novo contato
    // Validar com Zod
    const validatedData = contactFormSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos",
          details: validatedData.error.issues,
        },
        { status: 400 }
      );
    }

    // Criar dados completos para o Firebase
    const contactData = validatedData.data;

    // Salvar no Firebase
    const result = await saveContactForm(contactData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao salvar contato",
        },
        { status: 500 }
      );
    }

    // Sucesso
    return NextResponse.json({
      success: true,
      id: result.id || contactData.id,
      message: "Contato salvo com sucesso",
    });
  } catch (error) {
    console.error("Erro na API de contato:", error);

    // Mensagem genérica: detalhes internos ficam só no log do servidor
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}

// DELETE - Deletar contato
export async function DELETE(request: NextRequest) {
  try {
    // Verificar se o Firebase está configurado
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Serviço temporariamente indisponível",
        },
        { status: 503 }
      );
    }

    if (!(await isAdminRequest(request))) {
      return NextResponse.json(
        { success: false, error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !ID_PATTERN.test(id)) {
      return NextResponse.json(
        { success: false, error: "ID obrigatório" },
        { status: 400 }
      );
    }

    const result = await deleteContact(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao deletar contato:", error);

    return NextResponse.json(
      { success: false, error: "Erro ao deletar contato" },
      { status: 500 }
    );
  }
}

// GET - Verificar status da API
export async function GET() {
  // Verificação simples de saúde da API
  const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  return NextResponse.json(
    {
      success: true,
      api: "online",
      firebase: isFirebaseConfigured ? "configured" : "not-configured",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
