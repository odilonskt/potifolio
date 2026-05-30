import { NextRequest, NextResponse } from "next/server";

// Cache estático - revalidar a cada 1 hora
export const revalidate = 3600;

// Headers para máxima privacidade e segurança
const PRIVACY_HEADERS = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
};

export async function GET(request: NextRequest) {
  try {
    const githubUsername = process.env.NEXT_PUBLIC_GITHUB_USERNAME;
    const githubApiUrl = process.env.NEXT_PUBLIC_GITHUB_API_URL;
    const githubToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

    if (!githubUsername || !githubApiUrl || !githubToken) {
      return NextResponse.json(
        { error: "GitHub credentials not configured" },
        { status: 500, headers: PRIVACY_HEADERS },
      );
    }

    const url = `${githubApiUrl}/users/${githubUsername}/repos?sort=updated&per_page=12`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${githubToken}`,
        "User-Agent": "NextJS-Portfolio-Server",
      },
      next: { revalidate: 3600, tags: ["github-repos"] },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch repositories" },
        { status: response.status, headers: PRIVACY_HEADERS },
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: PRIVACY_HEADERS,
    });
  } catch (error) {
    console.error("Error fetching repositories");
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503, headers: PRIVACY_HEADERS },
    );
  }
}
