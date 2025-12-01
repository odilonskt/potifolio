import { saveContactForm } from "@/lib/firebase";
import { contactFormSchema } from "@/lib/schemas/contact-form";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("API de contato: Recebendo requisição...");

    // Obter dados
    const body = await request.json();
    console.log("Dados recebidos:", JSON.stringify(body, null, 2));

    // Validar
    const validationResult = contactFormSchema.safeParse(body);

    if (!validationResult.success) {
      console.error("Validação falhou:", validationResult.error.format());
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos",
          details: validationResult.error._zod,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Salvar no Firebase
    console.log("Salvando no Firebase...");
    const result = await saveContactForm(data);

    if (!result.success) {
      console.error("Erro ao salvar no Firebase:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao salvar no banco de dados",
        },
        { status: 500 }
      );
    }

    console.log("Salvo com sucesso, ID:", result.id);

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
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

// Método GET para testar
export async function GET(request: NextRequest) {
  console.log("GET /api/contact");
  return NextResponse.json(
    {
      success: true,
      message: "API de contato funcionando",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

// Método OPTIONS para CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
