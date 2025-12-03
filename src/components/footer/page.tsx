"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface GitHubUser {
  created_at: string;
  name?: string;
  bio?: string;
  location?: string;
  public_repos?: number;
  public_gists?: number;
  followers?: number;
  following?: number;
  avatar_url?: string;
}

export default function Footer() {
  const [githubData, setGithubData] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        const response = await fetch("https://api.github.com/users/odilonskt");
        if (response.ok) {
          const data = await response.json();
          setGithubData(data);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do GitHub:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubData();
  }, []);

  return (
    <footer className="bg-black text-white p-4 px-4 md:px-20 flex flex-col md:flex-row items-center justify-between gap-4 w-full border-t border-gray-800">
      {/* Logo e nome */}
      <div className="flex items-center gap-3">
        <Image
          src="/favicon.svg"
          alt="Logo Odilon"
          width={40}
          height={40}
          className="rounded-lg"
          priority
        />
        <span className="font-medium text-lg">Odilon</span>
      </div>

      {/* Informações do GitHub */}
      <div className="text-center">
        {loading ? (
          <div className="text-xs text-gray-500 animate-pulse">
            Carregando...
          </div>
        ) : githubData?.created_at ? (
          <div className="space-y-1">
            <div className="text-xs text-gray-400">
              Desenvolvedor desde{" "}
              <span className="text-blue-400 font-semibold">
                {new Date(githubData.created_at).toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-500">
            Dados do GitHub indisponíveis
          </div>
        )}
      </div>

      {/* Espaço vazio para balancear o layout (opcional) */}
      <div className="hidden md:block w-[40px]" />
    </footer>
  );
}
