import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = {
    GITHUB_API_URL: process.env.GITHUB_API_URL ?? null,
    GITHUB_USERNAME: process.env.GITHUB_USERNAME ?? null,
    hasServerToken: !!process.env.GITHUB_TOKEN,
    hasPublicToken: !!process.env.NEXT_PUBLIC_GITHUB_TOKEN,
    NODE_ENV: process.env.NODE_ENV ?? null,
  };

  return NextResponse.json(payload, { status: 200 });
}
