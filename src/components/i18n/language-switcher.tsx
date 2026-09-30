"use client";

import { Check, Languages } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale, useMessages } from "@/lib/i18n/client";
import { HTML_LANG, LOCALE_NAMES, LOCALES, localePath, stripLocale } from "@/lib/i18n/config";
import { common } from "@/lib/i18n/messages/common";
import { cn } from "@/lib/utils";

/**
 * Troca o idioma mantendo a página atual. O idioma escolhido fica gravado
 * (cookie do proxy) e vale também para a próxima visita.
 */
export function LanguageSwitcher({ className, showLabel = false }: { className?: string; showLabel?: boolean }) {
  const locale = useLocale();
  const t = useMessages(common);
  const route = stripLocale(usePathname());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-full text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          className,
        )}
        aria-label={`${t.language.change}. ${t.language.current(LOCALE_NAMES[locale])}`}
        title={t.language.change}
      >
        <Languages className="size-4" aria-hidden="true" />
        <span aria-hidden="true" className={cn("uppercase", !showLabel && "sr-only sm:not-sr-only")}>
          {locale}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuLabel>{t.language.label}</DropdownMenuLabel>
        {LOCALES.map((option) => (
          <DropdownMenuItem key={option} asChild>
            <Link
              href={localePath(option, route)}
              hrefLang={HTML_LANG[option]}
              lang={HTML_LANG[option]}
              aria-current={option === locale ? "true" : undefined}
              className="flex items-center justify-between gap-3"
            >
              {LOCALE_NAMES[option]}
              {option === locale && <Check className="size-4" aria-hidden="true" />}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
