import Titan from "@/components/titan/page";
import { getJourney } from "@/lib/content/repository";
import type { JourneyItem } from "@/lib/content/schemas";

import { JourneyLogo } from "./journey-card";
import { JourneyTabs } from "./journey-tabs";

function NowRow({ label, item }: { label: string; item: JourneyItem }) {
  return (
    <div className="flex items-center gap-4">
      <JourneyLogo item={item} size={48} />
      <div className="min-w-0">
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="text-base font-medium text-foreground sm:text-lg">
          {item.title} <span className="text-muted-foreground">em</span>{" "}
          <span className="text-brand">{item.organization}</span>
        </dd>
      </div>
    </div>
  );
}

/** "Agora": onde trabalho e o que estudo — itens sem data de término. */
function NowSection({ items }: { items: JourneyItem[] }) {
  const working = items.filter((item) => item.kind === "work" && !item.endDate);
  const studying = items.filter((item) => item.kind === "education" && !item.endDate);
  if (working.length === 0 && studying.length === 0) return null;

  return (
    <section
      id="Agora"
      aria-labelledby="agora-heading"
      className="mx-auto w-full max-w-4xl scroll-mt-24 px-4 py-12 sm:py-16"
    >
      <div className="rounded-3xl border border-border bg-card/40 p-6 sm:p-8">
        <h2 id="agora-heading" className="flex items-center gap-3 text-xl font-semibold text-foreground sm:text-2xl">
          <span className="relative flex size-2.5" aria-hidden="true">
            <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
          </span>
          Agora
        </h2>

        <dl className="mt-6 grid gap-6 sm:grid-cols-2">
          {working.map((item) => (
            <NowRow key={item.id} label="Trabalhando" item={item} />
          ))}
          {studying.map((item) => (
            <NowRow key={item.id} label="Estudando" item={item} />
          ))}
        </dl>
      </div>
    </section>
  );
}

export default async function JourneySections() {
  const items = await getJourney();
  if (items.length === 0) return null;

  return (
    <>
      <NowSection items={items} />

      {/* Titan já renderiza a <section> rotulada pelo título */}
      <div id="Trajetoria" className="scroll-mt-24 py-12">
        <Titan
          id="trajetoria-heading"
          title="Trajetória"
          subtitle="Carreira, estudos e certificados"
        />
        <div className="mx-auto w-full max-w-3xl px-4 py-8">
          <JourneyTabs items={items} />
        </div>
      </div>
    </>
  );
}
