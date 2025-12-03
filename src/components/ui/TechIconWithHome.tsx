"use client";

import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const TECH_HOME_MAP: Record<string, string> = {
  React: "https://react.dev",
  "React.js": "https://react.dev",
  "Next.js": "https://nextjs.org",
  "Vue.js": "https://vuejs.org",
  Angular: "https://angular.dev",
  Svelte: "https://svelte.dev",
  "Node.js": "https://nodejs.org",
  Express: "https://expressjs.com",
  "Nest.js": "https://nestjs.com",
  TypeScript: "https://www.typescriptlang.org",
  JavaScript: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  Python: "https://python.org",
  Prisma: "https://www.prisma.io",
  PostgreSQL: "https://www.postgresql.org",
  MySQL: "https://www.mysql.com",
  MongoDB: "https://www.mongodb.com",
  Docker: "https://www.docker.com",
  Firebase: "https://firebase.google.com",
  TailwindCSS: "https://tailwindcss.com",
  Vite: "https://vitejs.dev",
  HTML: "https://developer.mozilla.org/en-US/docs/Web/HTML",
  CSS: "https://developer.mozilla.org/en-US/docs/Web/CSS",
};

const ICON_SLUG_MAP: Record<string, string> = {
  React: "react",
  "React.js": "react",
  "Next.js": "nextdotjs",
  "Vue.js": "vuedotjs",
  Angular: "angular",
  Svelte: "svelte",
  "Node.js": "nodedotjs",
  Express: "express",
  "Nest.js": "nestjs",
  TypeScript: "typescript",
  JavaScript: "javascript",
  Python: "python",
  Prisma: "prisma",
  PostgreSQL: "postgresql",
  MySQL: "mysql",
  MongoDB: "mongodb",
  Docker: "docker",
  Firebase: "firebase",
  TailwindCSS: "tailwindcss",
  Vite: "vite",
  HTML: "html5",
  CSS: "css3",
};

const getIconUrl = (tech: string) => {
  const slug = ICON_SLUG_MAP[tech] || ICON_SLUG_MAP[tech.toLowerCase()];
  return slug ? `https://cdn.simpleicons.org/${slug}/white` : null;
};

export function TechIconWithHome({
  tech,
  isPrimary,
}: {
  tech: string;
  isPrimary: boolean;
}) {
  const [error, setError] = useState(false);

  const iconUrl = getIconUrl(tech);
  const homeUrl = TECH_HOME_MAP[tech];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-200 ${
            isPrimary
              ? "bg-amber-950/40 border border-amber-800/50 hover:bg-amber-900/60 hover:border-amber-500"
              : "bg-gray-900/40 border border-gray-700/50 hover:bg-gray-800/60 hover:border-gray-500"
          }`}
        >
          {!error && iconUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={iconUrl}
              alt={tech}
              width={14}
              height={14}
              className="w-3.5 h-3.5 object-contain"
              onError={() => setError(true)}
            />
          ) : (
            <span className="text-[10px] font-semibold text-white/80">
              {tech.charAt(0).toUpperCase()}
            </span>
          )}
        </button>
      </TooltipTrigger>

      <TooltipContent
        side="top"
        className="bg-gray-900 text-white border border-gray-700 text-xs font-medium px-3 py-2 rounded-lg"
      >
        <div className="flex flex-col gap-1">
          <span className="text-white font-semibold">{tech}</span>

          {homeUrl ? (
            <a
              href={homeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline text-[10px]"
            >
              {homeUrl.replace("https://", "")}
            </a>
          ) : (
            <span className="text-gray-400 text-[10px]">
              Nenhum site oficial registrado
            </span>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
