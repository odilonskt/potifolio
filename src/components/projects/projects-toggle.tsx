"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/client";
import { home } from "@/lib/i18n/messages/home";
import { cn } from "@/lib/utils";

/**
 * Mostra os primeiros cards e revela o restante no clique. Os cards chegam prontos
 * do servidor (children); aqui só alternamos a visibilidade, sem buscar nada.
 */
export function ProjectsToggle({
  total,
  initialVisible,
  children,
}: {
  total: number;
  initialVisible: number;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const t = useMessages(home).projects;
  const collapsible = total > initialVisible;

  return (
    <div className="flex flex-col items-center gap-8">
      <ul
        id="lista-projetos"
        className={cn(
          "grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3",
          // Esconde do 7º card em diante enquanto recolhido
          collapsible && !expanded && "[&>li:nth-child(n+7)]:hidden",
        )}
      >
        {children}
      </ul>

      {collapsible && (
        <Button
          variant="outline"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls="lista-projetos"
        >
          {expanded ? t.showLess : t.showAll(total)}
        </Button>
      )}
    </div>
  );
}
