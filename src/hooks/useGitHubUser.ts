import { useEffect, useState } from "react";

interface GitHubUser {
  name: string;
  bio: string;
  location: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  avatar_url: string;
}

export function useGitHubUser(username: string) {
  const [githubData, setGithubData] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.github.com/users/${username}`,
        );

        if (response.ok) {
          const data = await response.json();
          setGithubData(data);
          setError(null);
        } else {
          setError("Erro ao buscar dados do GitHub");
        }
      } catch (err) {
        console.error("Erro ao buscar dados do GitHub:", err);
        setError("Erro ao conectar ao GitHub");
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubData();
  }, [username]);

  return { githubData, loading, error };
}
