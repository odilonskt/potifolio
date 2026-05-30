import { NextRequest, NextResponse } from "next/server";

// Esta rota usa parâmetros de URL do `request` e deve ser tratada como dinâmica
export const dynamic = "force-dynamic";

export const revalidate = 3600;

const PRIVACY_HEADERS = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get("username");

    if (
      !username ||
      typeof username !== "string" ||
      !username.match(/^[a-zA-Z0-9-]+$/)
    ) {
      return NextResponse.json(
        { error: "Invalid username" },
        { status: 400, headers: PRIVACY_HEADERS },
      );
    }

    const githubApiUrl =
      process.env.GITHUB_API_URL || process.env.NEXT_PUBLIC_GITHUB_API_URL;
    const githubToken =
      process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;

    if (!githubApiUrl || !githubToken) {
      return NextResponse.json(
        { error: "GitHub credentials not configured" },
        { status: 500, headers: PRIVACY_HEADERS },
      );
    }

    const url = `${githubApiUrl}/users/${username}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${githubToken}`,
        "User-Agent": "NextJS-Portfolio-Server",
      },
      next: { revalidate: 3600, tags: [`github-user-${username}`] },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: response.status, headers: PRIVACY_HEADERS },
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: PRIVACY_HEADERS,
    });
  } catch (error) {
    console.error("Error fetching user data", error);
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503, headers: PRIVACY_HEADERS },
    );
  }
}
