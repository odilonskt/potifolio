export interface RepoOwner {
  login: string;
  avatar_url: string;
}

export interface RepoWithReadme {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  pushed_at: string;
  owner: RepoOwner;
  languages?: { [key: string]: number };
  readme?: string;
  readmeImages?: string[];
  extractedKeywords?: string[];
}

// 📌 Username fixo
const USERNAME = "odilonskt";

// 🔧 fetch simplificado (sem autenticação)
async function fetchSimple(url: string) {
  return fetch(url, {
    headers: { Accept: "application/vnd.github.v3+json" },
    next: { revalidate: 3600 },
  });
}

function extractKeywordsFromReadme(readme: string): string[] {
  const keywords: Set<string> = new Set();

  const techPatterns = [
    /React/gi,
    /Next\.?js/gi,
    /Vue/gi,
    /Angular/gi,
    /Svelte/gi,
    /Node\.?js/gi,
    /Express/gi,
    /Nest\.?js/gi,
    /Django/gi,
    /Flask/gi,
    /TypeScript/gi,
    /JavaScript/gi,
    /Python/gi,
    /Java\b/gi,
    /Go\b/gi,
    /Rust/gi,
    /Ruby/gi,
    /PHP/gi,
    /C#/gi,
    /Swift/gi,
    /Kotlin/gi,
    /Tailwind/gi,
    /Bootstrap/gi,
    /SCSS/gi,
    /Sass/gi,
    /PostgreSQL/gi,
    /MySQL/gi,
    /MongoDB/gi,
    /Redis/gi,
    /Firebase/gi,
    /Supabase/gi,
    /Prisma/gi,
    /Docker/gi,
    /Kubernetes/gi,
    /AWS/gi,
    /Vercel/gi,
    /GraphQL/gi,
    /REST/gi,
    /Vite/gi,
    /Webpack/gi,
  ];

  techPatterns.forEach((pattern) => {
    const matches = readme.match(pattern);
    if (matches) {
      matches.forEach((m) => keywords.add(m));
    }
  });

  return Array.from(keywords).slice(0, 10);
}

function extractImagesFromReadme(readme: string): string[] {
  const imagePattern = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
  const images: string[] = [];
  let match;
  while ((match = imagePattern.exec(readme)) !== null) {
    images.push(match[1]);
  }
  return images.slice(0, 5);
}

// ------------------------------------------------------------
// 📌 Buscar repositórios DO PRÓPRIO usuário "odilonskt"
// ------------------------------------------------------------
export async function fetchGitHubRepos(
  username: string
): Promise<RepoWithReadme[]> {
  try {
    const response = await fetchSimple(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=20`
    );

    if (!response.ok) return [];

    const repos = await response.json();

    const reposWithDetails = await Promise.all(
      repos.slice(0, 10).map(async (repo: RepoWithReadme) => {
        const [languagesRes, readmeRes] = await Promise.all([
          fetchSimple(
            `https://api.github.com/repos/${repo.full_name}/languages`
          ),
          fetchSimple(`https://api.github.com/repos/${repo.full_name}/readme`),
        ]);

        const languages = languagesRes.ok ? await languagesRes.json() : {};
        let readme = "";
        let readmeImages: string[] = [];
        let extractedKeywords: string[] = [];

        if (readmeRes.ok) {
          const readmeData = await readmeRes.json();
          readme = Buffer.from(readmeData.content, "base64").toString("utf-8");
          readmeImages = extractImagesFromReadme(readme);
          extractedKeywords = extractKeywordsFromReadme(readme);
        }

        return {
          ...repo,
          languages,
          readme,
          readmeImages,
          extractedKeywords,
        };
      })
    );

    return reposWithDetails;
  } catch (error) {
    console.error("Error fetching repos:", error);
    return [];
  }
}

// ------------------------------------------------------------
// 📌 Buscar repositórios onde "odilonskt" contribuiu
// ------------------------------------------------------------
export async function fetchContributedRepos(
  username: string
): Promise<RepoWithReadme[]> {
  try {
    const response = await fetchSimple(
      `https://api.github.com/search/repositories?q=user:${username}+fork:true&sort=updated&per_page=10`
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching contributed repos:", error);
    return [];
  }
}
