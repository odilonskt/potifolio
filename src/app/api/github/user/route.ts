import { env } from "@/lib/env";
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

const buildGitHubHeaders = (githubToken?: string) => ({
  Accept: "application/vnd.github.v3+json",
  ...(githubToken ? { Authorization: `token ${githubToken}` } : {}),
  "User-Agent": "NextJS-Portfolio-Server",
});

const respondGitHubError = async (response: Response, context: string) => {
  const body = await response.text().catch(() => null);
  console.error(context, response.status, body);
  return NextResponse.json(
    { error: "Unable to fetch GitHub data" },
    { status: response.status, headers: PRIVACY_HEADERS },
  );
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

    const githubApiUrl = env.GITHUB_API_URL.replace(/\/+$/, "");
    const githubToken = env.GITHUB_TOKEN || env.NEXT_PUBLIC_GITHUB_TOKEN;

    const url = `${githubApiUrl}/users/${username}`;

    const response = await fetch(url, {
      headers: buildGitHubHeaders(githubToken),
      next: { revalidate: 3600, tags: [`github-user-${username}`] },
    });

    if (!response.ok) {
      return respondGitHubError(response, "GitHub user fetch failed:");
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
