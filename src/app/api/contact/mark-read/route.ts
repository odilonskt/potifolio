// app/api/contacts/mark-read/route.ts
import { verifyIdToken } from "@/lib/firebase-auth";
import { markAsRead } from "@/lib/firebase-contacts";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const verification = await verifyIdToken(token);

    if (!verification.valid) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json(
        { error: "ID do contato é obrigatório" },
        { status: 400 }
      );
    }

    const result = await markAsRead(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
