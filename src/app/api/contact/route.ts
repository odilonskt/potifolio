import { saveContactForm } from "@/lib/firebase";
import { contactFormSchema } from "@/lib/schemas/contact-form";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Verificar se o Firebase está configurado
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      console.error(
        "Firebase não configurado - variáveis de ambiente ausentes"
      );
      return NextResponse.json(
        {
          success: false,
          error: "Serviço temporariamente indisponível",
        },
        { status: 503 }
      );
    }

    const body = await request.json();

    // Validar
    const validatedData = contactFormSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos",
        },
        { status: 400 }
      );
    }

    const data = validatedData.data;

    // Salvar no Firebase
    const result = await saveContactForm(data);

    if (!result.success) {
      console.error("Erro ao salvar:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao processar sua solicitação",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        id: result.id,
        message: "Formulário enviado com sucesso!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro na API:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}

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
