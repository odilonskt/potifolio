import { isAdminRequest } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Diagnóstico de configuração — só para o admin. Para os demais, a rota "não existe".
export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const payload = {
    GITHUB_API_URL: process.env.GITHUB_API_URL ?? null,
    GITHUB_USERNAME: process.env.GITHUB_USERNAME ?? null,
    hasServerToken: !!process.env.GITHUB_TOKEN,
    hasPublicToken: !!process.env.NEXT_PUBLIC_GITHUB_TOKEN,
    NODE_ENV: process.env.NODE_ENV ?? null,
  };

  return NextResponse.json(payload, { status: 200 });
}
