import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600;

const PRIVACY_HEADERS = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
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

    const url = `${githubApiUrl}/repos/${owner}/${repo}/readme`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3.raw+json",
        Authorization: `Bearer ${githubToken}`,
        "User-Agent": "NextJS-Portfolio-Server",
      },
      next: { revalidate: 3600, tags: [`github-readme-${owner}-${repo}`] },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "README not found" },
        { status: response.status, headers: PRIVACY_HEADERS },
      );
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
