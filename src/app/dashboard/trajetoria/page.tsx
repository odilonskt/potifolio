import { CheckCircle2, Pencil, Route } from "lucide-react";
import Link from "next/link";

import { JourneyLogo } from "@/components/journey/journey-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/session";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { formatMonth } from "@/lib/content/dates";
import { getJourneyItem, listJourneyUncached } from "@/lib/content/repository";
import { JOURNEY_KIND_LABELS } from "@/lib/content/schemas";

import { deleteJourneyAction } from "../actions";
import { DeleteButton } from "../form-parts";
import { JourneyForm } from "./journey-form";

type Props = { searchParams: Promise<{ editar?: string; salvo?: string }> };

export default async function JourneyDashboardPage({ searchParams }: Props) {
  // Layout e página renderizam em paralelo: cada página verifica a sessão por conta própria
  await requireAdmin();
  const { editar, salvo } = await searchParams;
  const [items, editing] = await Promise.all([
    listJourneyUncached(),
    editar && /^[A-Za-z0-9_-]{1,64}$/.test(editar) ? getJourneyItem(editar) : null,
  ]);

  return (
    <main className="mx-auto grid max-w-7xl gap-6 p-3 sm:p-6 lg:grid-cols-[1fr_minmax(0,28rem)]">
      <h1 className="sr-only">Trajetória</h1>

      <Card className="order-2 lg:order-1">
        <CardHeader>
          <CardTitle>{editing ? `Editando “${editing.title}”` : "Novo item"}</CardTitle>
          <CardDescription>
            Carreira, estudos e certificados aparecem na home. Itens sem data de término entram em “Agora”.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* key força o remount ao trocar de item */}
          <JourneyForm key={editing?.id ?? "novo"} item={editing} />
        </CardContent>
      </Card>

      <section aria-labelledby="journey-list-title" className="order-1 flex flex-col gap-4 lg:order-2">
        <h2 id="journey-list-title" className="text-lg font-semibold">
          Itens publicados ({items.length})
        </h2>

        <div aria-live="polite">
          {salvo && (
            <Alert>
              <CheckCircle2 aria-hidden="true" />
              <AlertDescription>Trajetória atualizada. A home já mostra a nova versão.</AlertDescription>
            </Alert>
          )}
        </div>

        {items.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Route aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>Nenhum item ainda</EmptyTitle>
              <EmptyDescription>Adicione seu trabalho atual ou o curso que está fazendo para começar.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.id}>
                <Card className="gap-3 py-4">
                  <CardContent className="flex items-start gap-3 px-4">
                    <JourneyLogo item={item} size={40} />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className="truncate font-medium">{item.title}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {item.organization}, {formatMonth(item.startDate)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{JOURNEY_KIND_LABELS[item.kind]}</Badge>
                        {!item.endDate && item.kind !== "certificate" && <Badge variant="outline">Atual</Badge>}
                      </div>
                    </div>
                  </CardContent>
                  <div className="flex justify-end gap-1 px-4">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/trajetoria?editar=${item.id}`}>
                        <Pencil data-icon="inline-start" aria-hidden="true" />
                        Editar<span className="sr-only"> {item.title}</span>
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
    </main>
  );
}
