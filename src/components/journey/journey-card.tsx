import { ExternalLink } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { MagicCard } from "@/components/ui/magic-card";
import { formatDuration, formatMonth } from "@/lib/content/dates";
import type { JourneyItem } from "@/lib/content/schemas";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { common } from "@/lib/i18n/messages/common";
import { home } from "@/lib/i18n/messages/home";

function Period({ item, locale }: { item: JourneyItem; locale: Locale }) {
  const t = home[locale].journey;
  const isCertificate = item.kind === "certificate";
  return (
    <p className="text-sm text-muted-foreground">
      <time dateTime={item.startDate}>{formatMonth(item.startDate, locale)}</time>
      {!isCertificate && (
        <>
          {" " + t.until + " "}
          {item.endDate ? <time dateTime={item.endDate}>{formatMonth(item.endDate, locale)}</time> : t.present}
          <span className="text-muted-foreground/80">
            {" "}
            ({formatDuration(item.startDate, item.endDate ?? undefined, locale)})
          </span>
        </>
      )}
    </p>
  );
}

export function JourneyLogo({ item, size = 56, locale = DEFAULT_LOCALE }: { item: JourneyItem; size?: number; locale?: Locale }) {
  if (item.imageUrl) {
    return (
      <Image
        src={item.imageUrl}
        alt={item.imageAlt || home[locale].journey.logoAlt(item.organization)}
        width={size}
        height={size}
        className="shrink-0 rounded-xl border border-border bg-card object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  // Sem imagem: inicial da instituição, puramente decorativa
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-xl border border-border bg-card text-lg font-semibold text-brand"
      style={{ width: size, height: size }}
    >
      {item.organization.charAt(0).toUpperCase()}
    </span>
  );
}

export function JourneyCard({ item, locale, showKind = false }: { item: JourneyItem; locale: Locale; showKind?: boolean }) {
  const t = home[locale].journey;
  const isCurrent = !item.endDate && item.kind !== "certificate";

  return (
    <MagicCard
      className="rounded-2xl"
      gradientSize={260}
      gradientColor="color-mix(in oklch, var(--brand) 12%, transparent)"
      gradientFrom="var(--brand)"
      gradientTo="var(--ring)"
    >
      <article className="flex flex-col gap-4 p-5 sm:flex-row sm:p-6">
        <JourneyLogo item={item} locale={locale} />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-foreground sm:text-lg">{item.title}</h3>
            {isCurrent && (
              <Badge variant="outline" className="border-emerald-600/40 text-emerald-700 dark:border-emerald-400/40 dark:text-emerald-300">
                {t.current}
              </Badge>
            )}
            {showKind && <Badge variant="secondary">{t.kinds[item.kind]}</Badge>}
          </div>

          <p className="font-medium text-brand">{item.organization}</p>
          <Period item={item} locale={locale} />

          <p className="max-w-prose whitespace-pre-line text-sm leading-relaxed text-foreground/85 sm:text-base">
            {item.description}
          </p>

          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 rounded-sm text-sm font-medium text-brand underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {t.links[item.kind]}
              <ExternalLink className="size-3.5" aria-hidden="true" />
              <span className="sr-only">{common[locale].newTab}</span>
            </a>
          )}
        </div>
      </article>
    </MagicCard>
  );
}
