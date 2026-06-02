import { useGitHubUserContext } from "@/context/github-user-context";

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

export function useGitHubUser() {
  const { githubData, loading } = useGitHubUserContext();
  return { githubData, loading, error: null };
}
