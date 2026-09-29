import "server-only";

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

  // Só os campos usados pelo site vão para o HTML (evita expor o objeto inteiro da API)
  const data = (await response.json()) as GitHubUser;
  return {
    login: data.login,
    id: data.id,
    name: data.name,
    bio: data.bio,
    location: data.location,
    public_repos: data.public_repos,
    public_gists: data.public_gists,
    followers: data.followers,
    following: data.following,
    created_at: data.created_at,
    avatar_url: data.avatar_url,
  };
}

// ─── Repositórios do portfólio ────────────────────────────────────────────────
// Buscados no servidor (cache de 1h): a página chega pronta, sem requisições do
// navegador, e só os campos exibidos vão para o HTML.

// Cores oficiais das linguagens no GitHub (dado, não decoração)
const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Ruby: "#701516",
  Go: "#00ADD8",
  Rust: "#dea584",
  PHP: "#4F5D95",
  Shell: "#89e051",
};
const DEFAULT_LANGUAGE_COLOR = "#6366f1";

export type LanguageShare = { language: string; percentage: number; color: string };

export interface PortfolioRepo {
  id: number;
  name: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  updatedAt: string;
  languages: LanguageShare[];
}

type RawRepo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  updated_at: string;
  fork: boolean;
};

async function githubJson<T>(path: string, tag: string): Promise<T> {
  const response = await fetch(`${env.GITHUB_API_URL.replace(/\/+$/, "")}${path}`, {
    headers: buildGitHubHeaders(env.GITHUB_TOKEN),
    next: { revalidate: 3600, tags: [tag] },
  });
  if (!response.ok) throw new Error(`GitHub fetch failed (${response.status}): ${path}`);
  return response.json() as Promise<T>;
}

function toShares(bytesByLanguage: Record<string, number>): LanguageShare[] {
  const total = Object.values(bytesByLanguage).reduce((sum, bytes) => sum + bytes, 0);
  if (total === 0) return [];
  return Object.entries(bytesByLanguage).map(([language, bytes]) => ({
    language,
    percentage: Math.round((bytes / total) * 100),
    color: LANGUAGE_COLORS[language] ?? DEFAULT_LANGUAGE_COLOR,
  }));
}

/** Repositórios públicos (mais recentes primeiro) com as linguagens de cada um. */
export async function getPortfolioRepos(): Promise<PortfolioRepo[]> {
  const username = encodeURIComponent(env.GITHUB_USERNAME);
  const repos = await githubJson<RawRepo[]>(
    `/users/${username}/repos?sort=updated&per_page=100`,
    "github-repos",
  );

  // Linguagens de todos os repositórios em paralelo; falha em um não derruba os outros
  return Promise.all(
    repos.map(async (repo) => {
      const languages = await githubJson<Record<string, number>>(
        `/repos/${username}/${encodeURIComponent(repo.name)}/languages`,
        `github-languages-${repo.name}`,
      ).catch(() => ({}));

      return {
        id: repo.id,
        name: repo.name,
        description: repo.description,
        htmlUrl: repo.html_url,
        homepage: repo.homepage || null,
        updatedAt: repo.updated_at,
        languages: toShares(languages),
      };
    }),
  );
}
