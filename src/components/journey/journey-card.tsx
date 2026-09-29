import { ExternalLink } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { MagicCard } from "@/components/ui/magic-card";
import { formatDuration, formatMonth } from "@/lib/content/dates";
import { JOURNEY_KIND_LABELS, type JourneyItem } from "@/lib/content/schemas";

const LINK_LABELS: Record<JourneyItem["kind"], string> = {
  work: "Ver empresa",
  education: "Ver curso",
  certificate: "Ver credencial",
};

function Period({ item }: { item: JourneyItem }) {
  const isCertificate = item.kind === "certificate";
  return (
    <p className="text-sm text-muted-foreground">
      <time dateTime={item.startDate}>{formatMonth(item.startDate)}</time>
      {!isCertificate && (
        <>
          {" até "}
          {item.endDate ? (
            <time dateTime={item.endDate}>{formatMonth(item.endDate)}</time>
          ) : (
            "o momento"
          )}
          <span className="text-muted-foreground/80">
            {" "}
            ({formatDuration(item.startDate, item.endDate ?? undefined)})
          </span>
        </>
      )}
    </p>
  );
}

export function JourneyLogo({ item, size = 56 }: { item: JourneyItem; size?: number }) {
  if (item.imageUrl) {
    return (
      <Image
        src={item.imageUrl}
        alt={item.imageAlt || `Logo de ${item.organization}`}
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
      className="flex shrink-0 items-center justify-center rounded-xl border border-border bg-card text-lg font-semibold text-sky-300"
      style={{ width: size, height: size }}
    >
      {item.organization.charAt(0).toUpperCase()}
    </span>
  );
}

export function JourneyCard({ item, showKind = false }: { item: JourneyItem; showKind?: boolean }) {
  const isCurrent = !item.endDate && item.kind !== "certificate";

  return (
    <MagicCard
      className="rounded-2xl"
      gradientSize={260}
      gradientColor="rgba(56, 189, 248, 0.08)"
      gradientFrom="#38bdf8"
      gradientTo="#818cf8"
    >
      <article className="flex flex-col gap-4 p-5 sm:flex-row sm:p-6">
        <JourneyLogo item={item} />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-foreground sm:text-lg">{item.title}</h3>
            {isCurrent && (
              <Badge variant="outline" className="border-emerald-400/40 text-emerald-300">
                Atual
              </Badge>
            )}
            {showKind && <Badge variant="secondary">{JOURNEY_KIND_LABELS[item.kind]}</Badge>}
          </div>

          <p className="font-medium text-sky-200">{item.organization}</p>
          <Period item={item} />

          <p className="max-w-prose whitespace-pre-line text-sm leading-relaxed text-foreground/85 sm:text-base">
            {item.description}
          </p>

          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 rounded-sm text-sm font-medium text-sky-300 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
            >
              {LINK_LABELS[item.kind]}
              <ExternalLink className="size-3.5" aria-hidden="true" />
              <span className="sr-only">(abre em nova aba)</span>
            </a>
          )}
        </div>
      </article>
    </MagicCard>
  );
}
