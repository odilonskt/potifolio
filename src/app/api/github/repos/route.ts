import { env } from "@/lib/env";
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

type GitHubRepo = Record<string, unknown>;

async function fetchAllGitHubRepos(
  githubApiUrl: string,
  githubUsername: string,
  githubToken?: string,
) {
  const repos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = `${githubApiUrl}/users/${githubUsername}/repos?sort=updated&per_page=${perPage}&page=${page}`;
    const response = await fetch(url, {
      headers: buildGitHubHeaders(githubToken),
      next: { revalidate: 3600, tags: [`github-repos-page-${page}`] },
    });

    if (!response.ok) {
      throw new Error(`GitHub repos fetch failed: ${response.status}`);
    }

    const pageData = (await response.json()) as unknown;
    if (!Array.isArray(pageData)) {
      throw new Error("Unexpected GitHub response");
    }

    repos.push(
      ...pageData.filter(
        (item): item is GitHubRepo => typeof item === "object" && item !== null,
      ),
    );
    if (pageData.length < perPage) break;
    page += 1;
  }

  return repos;
}

export async function GET() {
  try {
    const githubUsername =
      env.GITHUB_USERNAME || env.NEXT_PUBLIC_GITHUB_USERNAME;
    if (!githubUsername) {
      throw new Error("GitHub username is not configured");
    }

    const githubApiUrl = env.GITHUB_API_URL.replace(/\/+$/, "");
    const githubToken = env.GITHUB_TOKEN;

    const repos = await fetchAllGitHubRepos(
      githubApiUrl,
      githubUsername,
      githubToken,
    );

    return NextResponse.json(repos, {
      headers: PRIVACY_HEADERS,
    });
  } catch (error) {
    console.error("Error fetching repositories", error);
    if (
      error instanceof Error &&
      error.message.includes("GitHub repos fetch failed")
    ) {
      return NextResponse.json(
        { error: "Unable to fetch GitHub repositories" },
        { status: 500, headers: PRIVACY_HEADERS },
      );
    }
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503, headers: PRIVACY_HEADERS },
    );
  }
}
