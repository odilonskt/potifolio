"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Titan from "../titan/page";
import { Card, CardContent } from "../ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

export default function ProjectPage() {
  const [user, setUser] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/users/odilonskt/repos"
        );
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);
  if (loading) {
    return (
      <>
        <Titan title="Projetos: "></Titan>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-gray-500">Carregando projetos...</div>
        </div>
      </>
    );
  }
  return (
    <>
      <Titan title="Projetos: "></Titan>
      <div className="container mx-auto px-4 py-8 ">
        <Carousel className="w-full max-w-6xl mx-auto">
          <CarouselContent>
            {user.map((repo) => {
              return (
                <CarouselItem
                  key={repo.id}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <div className="p-2">
                    <Card className="bg-gray-900 border border-white hover:border-gray-500 transition-colors">
                      <CardContent className="p-6 flex  flex-col h-64">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-semibold text-white truncate flex-1 mr-2">
                            {" "}
                            {repo.name}
                          </h3>

                          {repo.language && (
                            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded ">
                              {repo.language}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm mb-4 line-clamp-3 flex-1">
                          {repo.description || "Sem descrição disponível."}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                          <div className="flex items-center space-x-4">
                            {" "}
                            <span>⭐ {repo.stargazers_count}</span>
                            <span>🍴 {repo.forks_count}</span>
                          </div>
                        </div>

                        <Link
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium hover:underline "
                        >
                          {" "}
                          Ver no GitHub →
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <div className=" flex justify-center gap-4 mt-6">
            <CarouselPrevious className="static bg-white border-gray-700 hover:bg-gray-700 cursor-pointer"></CarouselPrevious>
            <CarouselNext className="static bg-white border-gray-700 hover:bg-gray-700 cursor-pointer"></CarouselNext>
          </div>
        </Carousel>
      </div>
    </>
  );
}
