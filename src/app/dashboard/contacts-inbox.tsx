"use client";

import { AlertCircle, Inbox, Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export type InboxContact = {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
};

type Filter = "all" | "unread" | "read";

const FILTER_LABELS: Record<Filter, string> = { all: "Todas", unread: "Não lidas", read: "Lidas" };

const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const dayFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
const fullFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" });

function shortDate(iso: string): string {
  const date = new Date(iso);
  const isToday = date.toDateString() === new Date().toDateString();
  return isToday ? timeFormatter.format(date) : dayFormatter.format(date);
}

// ─── Chamadas à API (a rota verifica a sessão de admin) ───────────────────────

async function setReadOnServer(id: string, read: boolean) {
  const response = await fetch(`/api/contact?action=${read ? "mark-read" : "mark-unread"}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) throw new Error();
}

async function deleteOnServer(id: string) {
  const response = await fetch(`/api/contact?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!response.ok) throw new Error();
}

// ─── Componentes ──────────────────────────────────────────────────────────────

function Stats({ contacts }: { contacts: InboxContact[] }) {
  const unread = contacts.filter((contact) => !contact.read).length;
  const stats = [
    { label: "Total", value: contacts.length },
    { label: "Não lidas", value: unread },
    { label: "Lidas", value: contacts.length - unread },
  ];

  return (
    <dl className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col-reverse gap-1 px-4 py-4 sm:px-6">
          <dt className="text-sm text-muted-foreground">{stat.label}</dt>
          <dd className="text-2xl font-semibold tabular-nums text-foreground">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ContactRow({ contact, onOpen }: { contact: InboxContact; onOpen: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="grid w-full grid-cols-[auto_1fr_auto] items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-5"
      >
        <span
          aria-hidden="true"
          className={cn("mt-2 size-2 rounded-full", contact.read ? "bg-transparent" : "bg-brand")}
        />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className={cn("truncate text-foreground", !contact.read && "font-semibold")}>
            {!contact.read && <span className="sr-only">Não lida: </span>}
            {contact.nome}
          </span>
          <span className="truncate text-sm text-foreground/85">{contact.subject}</span>
          <span className="truncate text-sm text-muted-foreground">{contact.message}</span>
        </span>
        <time dateTime={contact.createdAt} suppressHydrationWarning className="text-xs whitespace-nowrap text-muted-foreground">
          {shortDate(contact.createdAt)}
        </time>
      </button>
    </li>
  );
}

export function ContactsInbox({ initialContacts }: { initialContacts: InboxContact[] }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [filter, setFilter] = useState<Filter>("all");
  // Guardamos o id (não uma cópia) para o diálogo refletir o estado atual
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visible = useMemo(
    () => contacts.filter((c) => (filter === "all" ? true : filter === "unread" ? !c.read : c.read)),
    [contacts, filter],
  );
  const opened = contacts.find((contact) => contact.id === openId) ?? null;

  async function setRead(id: string, read: boolean) {
    const previous = contacts;
    setError(null);
    // Atualização otimista, com volta ao estado anterior se o servidor recusar
    setContacts((list) => list.map((c) => (c.id === id ? { ...c, read } : c)));
    try {
      await setReadOnServer(id, read);
    } catch {
      setContacts(previous);
      setError("Não foi possível atualizar a mensagem. Tente novamente.");
    }
  }

  function open(contact: InboxContact) {
    setOpenId(contact.id);
    if (!contact.read) void setRead(contact.id, true);
  }

  async function confirmDelete() {
    if (!confirmDeleteId) return;
    setPending(true);
    setError(null);
    try {
      await deleteOnServer(confirmDeleteId);
      setContacts((list) => list.filter((c) => c.id !== confirmDeleteId));
      setOpenId(null);
    } catch {
      setError("Não foi possível excluir a mensagem. Tente novamente.");
    } finally {
      setPending(false);
      setConfirmDeleteId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Stats contacts={contacts} />

      <div aria-live="polite">
        {error && (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <ToggleGroup
        type="single"
        variant="outline"
        value={filter}
        onValueChange={(value) => value && setFilter(value as Filter)}
        aria-label="Filtrar mensagens"
        className="w-fit"
      >
        {(Object.keys(FILTER_LABELS) as Filter[]).map((key) => (
          <ToggleGroupItem key={key} value={key} className="px-4">
            {FILTER_LABELS[key]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {visible.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>{contacts.length === 0 ? "Nenhuma mensagem ainda" : "Nada neste filtro"}</EmptyTitle>
            <EmptyDescription>
              {contacts.length === 0
                ? "As mensagens enviadas pelo formulário do site aparecem aqui."
                : "Troque o filtro para ver as outras mensagens."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul aria-label={`Mensagens: ${FILTER_LABELS[filter]}`} className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {visible.map((contact) => (
            <ContactRow key={contact.id} contact={contact} onOpen={() => open(contact)} />
          ))}
        </ul>
      )}

      {/* Leitura da mensagem */}
      <Dialog open={opened !== null} onOpenChange={(isOpen) => !isOpen && setOpenId(null)}>
        {opened && (
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{opened.subject}</DialogTitle>
              <DialogDescription>
                De {opened.nome}, em{" "}
                <time dateTime={opened.createdAt}>{fullFormatter.format(new Date(opened.createdAt))}</time>
              </DialogDescription>
            </DialogHeader>

            <dl className="grid gap-1 text-sm">
              <div className="flex gap-2">
                <dt className="text-muted-foreground">E-mail:</dt>
                <dd className="break-all text-foreground">{opened.email}</dd>
              </div>
              {opened.telefone && (
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">Telefone:</dt>
                  <dd className="text-foreground">{opened.telefone}</dd>
                </div>
              )}
            </dl>

            <p className="max-h-[50vh] overflow-y-auto rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
              {opened.message}
            </p>

            <DialogFooter className="gap-2 sm:justify-between">
              <Button variant="ghost" className="text-destructive" onClick={() => setConfirmDeleteId(opened.id)}>
                <Trash2 data-icon="inline-start" aria-hidden="true" />
                Excluir
              </Button>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button variant="outline" onClick={() => setRead(opened.id, !opened.read)}>
                  {opened.read ? <Mail data-icon="inline-start" aria-hidden="true" /> : <MailOpen data-icon="inline-start" aria-hidden="true" />}
                  {opened.read ? "Marcar como não lida" : "Marcar como lida"}
                </Button>
                <Button asChild>
                  <a href={`mailto:${opened.email}?subject=${encodeURIComponent(`Re: ${opened.subject}`)}`}>
                    <Reply data-icon="inline-start" aria-hidden="true" />
                    Responder
                  </a>
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog open={confirmDeleteId !== null} onOpenChange={(isOpen) => !isOpen && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta mensagem?</AlertDialogTitle>
            <AlertDialogDescription>Ela será apagada de vez. Essa ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(event) => {
                event.preventDefault(); // mantém aberto até a exclusão terminar
                void confirmDelete();
              }}
            >
              {pending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
