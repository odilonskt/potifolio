import { CheckCircle2, Pencil, Route } from "lucide-react";
import Link from "next/link";

import { JourneyLogo } from "@/components/journey/journey-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/session";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { formatMonth } from "@/lib/content/dates";
import { getJourneyItem, listJourneyUncached } from "@/lib/content/repository";
import { localePath } from "@/lib/i18n/config";
import { dashboard } from "@/lib/i18n/messages/dashboard";
import { getLocale } from "@/lib/i18n/server";

import { deleteJourneyAction } from "../actions";
import { DeleteButton } from "../form-parts";
import { PageHeader } from "../page-header";
import { JourneyForm } from "./journey-form";

type Props = { searchParams: Promise<{ editar?: string; salvo?: string }> };

export default async function JourneyDashboardPage({ searchParams }: Props) {
  // Layout e página renderizam em paralelo: cada página verifica a sessão por conta própria
  await requireAdmin();
  const locale = await getLocale();
  const t = dashboard[locale];
  const { editar, salvo } = await searchParams;
  const [items, editing] = await Promise.all([
    listJourneyUncached(),
    editar && /^[A-Za-z0-9_-]{1,64}$/.test(editar) ? getJourneyItem(editar) : null,
  ]);

  return (
    <>
      <PageHeader
        title={t.journey.title}
        description={t.journey.description}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">

      <Card className="order-2 lg:order-1">
        <CardHeader>
          <CardTitle>{editing ? t.journey.editing(editing.title) : t.journey.newItem}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* key força o remount ao trocar de item */}
          <JourneyForm key={editing?.id ?? "novo"} item={editing} />
        </CardContent>
      </Card>

      <section aria-labelledby="journey-list-title" className="order-1 flex flex-col gap-4 self-start lg:order-2">
        <h2 id="journey-list-title" className="font-semibold text-foreground">
          {t.journey.listTitle(items.length)}
        </h2>

        <div aria-live="polite">
          {salvo && (
            <Alert>
              <CheckCircle2 aria-hidden="true" />
              <AlertDescription>{t.journey.saved}</AlertDescription>
            </Alert>
          )}
        </div>

        {items.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Route aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>{t.journey.emptyTitle}</EmptyTitle>
              <EmptyDescription>{t.journey.emptyDescription}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.id}>
                <Card className="gap-3 py-4">
                  <CardContent className="flex items-start gap-3 px-4">
                    <JourneyLogo item={item} size={40} locale={locale} />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className="truncate font-medium">{item.title}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {item.organization}, {formatMonth(item.startDate, locale)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{t.journey.kinds[item.kind]}</Badge>
                        {!item.endDate && item.kind !== "certificate" && <Badge variant="outline">{t.common.current}</Badge>}
                      </div>
                    </div>
                  </CardContent>
                  <div className="flex justify-end gap-1 px-4">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={localePath(locale, `/dashboard/trajetoria?editar=${item.id}`)}>
                        <Pencil data-icon="inline-start" aria-hidden="true" />
                        {t.common.edit}
                        <span className="sr-only"> {item.title}</span>
                      </Link>
                    </Button>
                    <DeleteButton id={item.id} itemName={item.title} action={deleteJourneyAction} />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
      </div>
    </>
  );
}
