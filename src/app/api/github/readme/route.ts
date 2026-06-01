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
  Accept: "application/vnd.github.v3.raw+json",
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
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");

    // Validação rigorosa
    if (
      !owner ||
      !repo ||
      typeof owner !== "string" ||
      typeof repo !== "string" ||
      !owner.match(/^[a-zA-Z0-9-]+$/) ||
      !repo.match(/^[a-zA-Z0-9._-]+$/)
    ) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400, headers: PRIVACY_HEADERS },
      );
    }

    const githubApiUrl = env.NEXT_PUBLIC_GITHUB_API_URL.replace(/\/+$/, "");
    const githubToken = env.GITHUB_TOKEN || env.NEXT_PUBLIC_GITHUB_TOKEN;

    const url = `${githubApiUrl}/repos/${owner}/${repo}/readme`;

    const response = await fetch(url, {
      headers: buildGitHubHeaders(githubToken),
      next: { revalidate: 3600, tags: [`github-readme-${owner}-${repo}`] },
    });

    if (!response.ok) {
      return respondGitHubError(response, "GitHub readme fetch failed:");
    }

    const content = await response.text();

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/markdown",
        ...PRIVACY_HEADERS,
      },
    });
  } catch (error) {
    console.error("Error fetching README", error);
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503, headers: PRIVACY_HEADERS },
    );
  }
}
