import { Section } from "@/components/section/section";
import { getJourney } from "@/lib/content/repository";
import type { JourneyItem } from "@/lib/content/schemas";
import { localize } from "@/lib/content/translations";
import type { Locale } from "@/lib/i18n/config";
import { home } from "@/lib/i18n/messages/home";
import { getLocale } from "@/lib/i18n/server";

type JourneyMessages = (typeof home)["pt"]["journey"];

import { JourneyLogo } from "./journey-card";
import { JourneyTabs } from "./journey-tabs";

function NowRow({ label, item, t, locale }: { label: string; item: JourneyItem; t: JourneyMessages; locale: Locale }) {
  return (
    <div className="flex items-center gap-4">
      <JourneyLogo item={item} size={48} locale={locale} />
      <div className="min-w-0">
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="text-base font-medium text-foreground sm:text-lg">
          {item.title} <span className="text-muted-foreground">{t.at}</span>{" "}
          <span className="text-brand">{item.organization}</span>
        </dd>
      </div>
    </div>
  );
}

/** "Agora": onde trabalho e o que estudo — itens sem data de término. */
function NowSection({ items, t, locale }: { items: JourneyItem[]; t: JourneyMessages; locale: Locale }) {
  const working = items.filter((item) => item.kind === "work" && !item.endDate);
  const studying = items.filter((item) => item.kind === "education" && !item.endDate);
  if (working.length === 0 && studying.length === 0) return null;

  return (
    <section
      id="Agora"
      aria-labelledby="agora-heading"
      className="mx-auto w-full max-w-5xl scroll-mt-24 px-4 py-12 sm:px-6"
    >
      <div className="rounded-3xl border border-border bg-card/40 p-6 sm:p-8">
        <h2 id="agora-heading" className="flex items-center gap-3 text-xl font-semibold text-foreground sm:text-2xl">
          <span className="relative flex size-2.5" aria-hidden="true">
            <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
          </span>
          {t.now}
        </h2>

        <dl className="mt-6 grid gap-6 sm:grid-cols-2">
          {working.map((item) => (
            <NowRow key={item.id} label={t.working} item={item} t={t} locale={locale} />
          ))}
          {studying.map((item) => (
            <NowRow key={item.id} label={t.studying} item={item} t={t} locale={locale} />
          ))}
        </dl>
      </div>
    </section>
  );
}

export default async function JourneySections() {
  const locale = await getLocale();
  const t = home[locale].journey;
  const items = (await getJourney()).map((item) => localize(item, locale));
  if (items.length === 0) return null;

  return (
    <>
      <NowSection items={items} t={t} locale={locale} />

      <Section id="Trajetoria" title={t.title} description={t.description} width="narrow">
        <JourneyTabs items={items} />
      </Section>
    </>
  );
}
