"use client";

import React, { createContext, ReactNode, useContext } from "react";
import { GitHubUser } from "@/lib/github";

interface GitHubUserContextValue {
  githubData: GitHubUser | null;
  loading: boolean;
}

const GitHubUserContext = createContext<GitHubUserContextValue | undefined>(
  undefined,
);

export function GitHubUserProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: GitHubUser | null;
}) {
  const value: GitHubUserContextValue = {
    githubData: initialData,
    loading: false,
  };

  return (
    <GitHubUserContext.Provider value={value}>
      {children}
    </GitHubUserContext.Provider>
  );
}

export function useGitHubUserContext() {
  const context = useContext(GitHubUserContext);
  if (!context) {
    throw new Error(
      "useGitHubUserContext must be used within a GitHubUserProvider",
    );
  }
  return context;
}
