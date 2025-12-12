// app/api/contacts/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { deleteContact } from "@/lib/firebase-contacts";
import { verifyIdToken } from "@/lib/firebase-auth";

export async function DELETE(request: NextRequest) {
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

    const { contactId } = await request.json();

    if (!contactId) {
      return NextResponse.json(
        { error: "ID do contato é obrigatório" },
        { status: 400 }
      );
    }

    const result = await deleteContact(contactId);

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
