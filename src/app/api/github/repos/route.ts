import { NextResponse } from "next/server";

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

export async function GET() {
  try {
    const githubUsername =
      process.env.GITHUB_USERNAME ||
      process.env.NEXT_PUBLIC_GITHUB_USERNAME ||
      "odilonskt";
    const githubApiUrl = (
      process.env.GITHUB_API_URL ||
      process.env.NEXT_PUBLIC_GITHUB_API_URL ||
      "https://api.github.com"
    ).replace(/\/+$/, "");
    const githubToken = process.env.GITHUB_TOKEN?.trim();

    const url = `${githubApiUrl}/users/${githubUsername}/repos?sort=updated&per_page=12`;

    const response = await fetch(url, {
      headers: buildGitHubHeaders(githubToken),
      next: { revalidate: 3600, tags: ["github-repos"] },
    });

    if (!response.ok) {
      return respondGitHubError(response, "GitHub repos fetch failed:");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("Unexpected GitHub response for repos:", data);
      return NextResponse.json(
        { error: "Unexpected GitHub response" },
        { status: 502, headers: PRIVACY_HEADERS },
      );
    }

    return NextResponse.json(data, {
      headers: PRIVACY_HEADERS,
    });
  } catch (error) {
    console.error("Error fetching repositories", error);
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503, headers: PRIVACY_HEADERS },
    );
  }
}
