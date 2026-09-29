// app/api/contact/mark-unread/route.ts
import { isAdminRequest } from "@/lib/auth/session";
import { markAsUnread } from "@/lib/firebase-contacts";
import { NextRequest, NextResponse } from "next/server";

const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { contactId } = await request.json();

    if (typeof contactId !== "string" || !ID_PATTERN.test(contactId)) {
      return NextResponse.json(
        { error: "ID do contato é obrigatório" },
        { status: 400 }
      );
    }

    const result = await markAsUnread(contactId);

    if (!result.success) {
      return NextResponse.json({ error: "Erro ao atualizar contato" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
