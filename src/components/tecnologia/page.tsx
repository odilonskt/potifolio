"use client";

import { Pause, Play } from "lucide-react";
import { useState } from "react";
import type { IconType } from "react-icons";
import { IoLogoFirebase } from "react-icons/io5";
import {
  SiCss3,
  SiDocker,
  SiExpress,
  SiGit,
  SiJavascript,
  SiNestjs,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiReact,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";
import { TbApi } from "react-icons/tb";

import { Button } from "@/components/ui/button";
import { TECHNOLOGIES, type Technology } from "@/lib/content/profile";
import { cn } from "@/lib/utils";

import styles from "./InfinityScroll.module.css";

const ICONS: Record<Technology, IconType> = {
  "Next.js": SiNextdotjs,
  React: SiReact,
  TypeScript: SiTypescript,
  JavaScript: SiJavascript,
  "Node.js": SiNodedotjs,
  NestJS: SiNestjs,
  Express: SiExpress,
  PostgreSQL: SiPostgresql,
  Docker: SiDocker,
  Tailwind: SiTailwindcss,
  Git: SiGit,
  Firebase: IoLogoFirebase,
  CSS3: SiCss3,
  RESTful: TbApi,
};

function TechList({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul
      className={cn(styles.track, hidden && styles.duplicate)}
      // A cópia existe só para o loop contínuo: fica fora da árvore de acessibilidade
      aria-hidden={hidden || undefined}
      aria-label={hidden ? undefined : "Tecnologias"}
    >
      {TECHNOLOGIES.map((name) => {
        const Icon = ICONS[name];
        return (
          <li key={name} className={styles.item}>
            <Icon className="size-8 sm:size-10" aria-hidden="true" />
            <span className="text-sm">{name}</span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Faixa de tecnologias em rolagem contínua.
 * Acessibilidade (WCAG 2.2.2): pode ser pausada por botão, pausa com mouse/foco e
 * vira uma grade estática com "movimento reduzido".
 */
export default function TechMarquee() {
  const [paused, setPaused] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className={styles.viewport} data-paused={paused || undefined}>
        <TechList />
        <TechList hidden />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setPaused((value) => !value)}
        aria-pressed={paused}
        className={cn("self-end", styles.toggle)}
      >
        {paused ? <Play data-icon="inline-start" aria-hidden="true" /> : <Pause data-icon="inline-start" aria-hidden="true" />}
        {paused ? "Retomar animação" : "Pausar animação"}
      </Button>
    </div>
  );
}
