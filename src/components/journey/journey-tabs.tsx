"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JOURNEY_KINDS, type JourneyItem } from "@/lib/content/schemas";
import { useLocale } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/config";
import { home } from "@/lib/i18n/messages/home";
import { cn } from "@/lib/utils";

import { JourneyCard } from "./journey-card";

function Timeline({ items, label, locale }: { items: JourneyItem[]; label: string; locale: Locale }) {
  if (items.length === 0) {
    return <p className="py-10 text-center text-muted-foreground">{home[locale].journey.empty(label.toLowerCase())}</p>;
  }

  return (
    <ol aria-label={label} className="relative flex flex-col gap-5 border-l border-border pl-6 sm:pl-8">
      {items.map((item) => (
        <li key={item.id} className="relative">
          {/* Marcador da linha do tempo; preenchido quando o item é atual */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-8 -left-[31px] size-3 rounded-full border-2 border-brand sm:-left-[39px]",
              !item.endDate && item.kind !== "certificate" ? "bg-brand" : "bg-background"
            )}
          />
          <JourneyCard item={item} locale={locale} />
        </li>
      ))}
    </ol>
  );
}

export function JourneyTabs({ items }: { items: JourneyItem[] }) {
  const locale = useLocale();
  const t = home[locale].journey;
  // Só mostra abas de tipos que têm conteúdo
  const kinds = JOURNEY_KINDS.filter((kind) => items.some((item) => item.kind === kind));

  return (
    <Tabs defaultValue={kinds[0]} className="gap-8">
      <TabsList aria-label={t.filterLabel} className="mx-auto h-11 w-full max-w-md">
        {kinds.map((kind) => (
          <TabsTrigger key={kind} value={kind} className="text-sm sm:text-base">
            {t.kinds[kind]}
          </TabsTrigger>
        ))}
      </TabsList>

      {kinds.map((kind) => (
        <TabsContent key={kind} value={kind}>
          <Timeline
            label={t.kinds[kind]}
            locale={locale}
            items={items.filter((item) => item.kind === kind)}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
