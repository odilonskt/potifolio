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
import { useLocale } from "@/lib/i18n/client";
import { HTML_LANG, type Locale } from "@/lib/i18n/config";
import { dashboard } from "@/lib/i18n/messages/dashboard";
import { cn } from "@/lib/utils";

type ContactMessages = (typeof dashboard)["pt"]["contacts"];

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

function shortDate(iso: string, locale: Locale): string {
  const date = new Date(iso);
  const isToday = date.toDateString() === new Date().toDateString();
  const options: Intl.DateTimeFormatOptions = isToday ? { hour: "2-digit", minute: "2-digit" } : { day: "2-digit", month: "short" };
  return new Intl.DateTimeFormat(HTML_LANG[locale], options).format(date);
}

const fullDate = (iso: string, locale: Locale) =>
  new Intl.DateTimeFormat(HTML_LANG[locale], { dateStyle: "long", timeStyle: "short" }).format(new Date(iso));

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

function Stats({ contacts, t }: { contacts: InboxContact[]; t: ContactMessages }) {
  const unread = contacts.filter((contact) => !contact.read).length;
  const stats = [
    { label: t.total, value: contacts.length },
    { label: t.filters.unread, value: unread },
    { label: t.filters.read, value: contacts.length - unread },
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

function ContactRow({
  contact,
  onOpen,
  t,
  locale,
}: {
  contact: InboxContact;
  onOpen: () => void;
  t: ContactMessages;
  locale: Locale;
}) {
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
            {!contact.read && <span className="sr-only">{t.unreadPrefix}</span>}
            {contact.nome}
          </span>
          <span className="truncate text-sm text-foreground/85">{contact.subject}</span>
          <span className="truncate text-sm text-muted-foreground">{contact.message}</span>
        </span>
        <time dateTime={contact.createdAt} suppressHydrationWarning className="text-xs whitespace-nowrap text-muted-foreground">
          {shortDate(contact.createdAt, locale)}
        </time>
      </button>
    </li>
  );
}

export function ContactsInbox({ initialContacts }: { initialContacts: InboxContact[] }) {
  const locale = useLocale();
  const t = dashboard[locale].contacts;
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
      setError(t.updateError);
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
      setError(t.deleteError);
    } finally {
      setPending(false);
      setConfirmDeleteId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Stats contacts={contacts} t={t} />

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
        aria-label={t.filterLabel}
        className="w-fit"
      >
        {(Object.keys(t.filters) as Filter[]).map((key) => (
          <ToggleGroupItem key={key} value={key} className="px-4">
            {t.filters[key]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {visible.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>{contacts.length === 0 ? t.emptyTitle : t.emptyFilterTitle}</EmptyTitle>
            <EmptyDescription>
              {contacts.length === 0
                ? t.emptyDescription
                : t.emptyFilterDescription}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul aria-label={t.listLabel(t.filters[filter])} className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {visible.map((contact) => (
            <ContactRow key={contact.id} contact={contact} onOpen={() => open(contact)} t={t} locale={locale} />
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
                {t.from(opened.nome)}{" "}
                <time dateTime={opened.createdAt}>{fullDate(opened.createdAt, locale)}</time>
              </DialogDescription>
            </DialogHeader>

            <dl className="grid gap-1 text-sm">
              <div className="flex gap-2">
                <dt className="text-muted-foreground">{t.email}</dt>
                <dd className="break-all text-foreground">{opened.email}</dd>
              </div>
              {opened.telefone && (
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">{t.phone}</dt>
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
                {dashboard[locale].common.delete}
              </Button>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button variant="outline" onClick={() => setRead(opened.id, !opened.read)}>
                  {opened.read ? <Mail data-icon="inline-start" aria-hidden="true" /> : <MailOpen data-icon="inline-start" aria-hidden="true" />}
                  {opened.read ? t.markUnread : t.markRead}
                </Button>
                <Button asChild>
                  <a href={`mailto:${opened.email}?subject=${encodeURIComponent(`${t.replyPrefix} ${opened.subject}`)}`}>
                    <Reply data-icon="inline-start" aria-hidden="true" />
                    {t.reply}
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
            <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.deleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>{dashboard[locale].common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(event) => {
                event.preventDefault(); // mantém aberto até a exclusão terminar
                void confirmDelete();
              }}
            >
              {pending ? dashboard[locale].common.deleting : dashboard[locale].common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
