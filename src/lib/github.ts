import { env } from "@/lib/env";

export interface GitHubUser {
  login: string;
  id: number;
  name: string | null;
  bio: string | null;
  location: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  avatar_url: string;
}

const buildGitHubHeaders = (githubToken?: string) => ({
  Accept: "application/vnd.github.v3+json",
  ...(githubToken ? { Authorization: `token ${githubToken}` } : {}),
  "User-Agent": "NextJS-Portfolio-Server",
});

export async function getGitHubUser(username: string): Promise<GitHubUser> {
  const githubApiUrl = env.GITHUB_API_URL.replace(/\/+$/, "");
  const githubToken = env.GITHUB_TOKEN;
  const response = await fetch(`${githubApiUrl}/users/${username}`, {
    headers: buildGitHubHeaders(githubToken),
    next: { revalidate: 3600, tags: [`github-user-${username}`] },
  });

  if (!response.ok) {
    throw new Error(`GitHub user fetch failed: ${response.status}`);
  }

  return response.json();
}
