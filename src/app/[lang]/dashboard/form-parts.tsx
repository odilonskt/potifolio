"use client";

import { AlertCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { useFormStatus } from "react-dom";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { FormState } from "@/lib/content/schemas";
import { TRANSLATED_LOCALES, type Translations } from "@/lib/content/translations";
import { useMessages } from "@/lib/i18n/client";
import { HTML_LANG } from "@/lib/i18n/config";
import { dashboard } from "@/lib/i18n/messages/dashboard";

export function SubmitButton({ children, pendingLabel }: { children: React.ReactNode; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending}>
      {pending && <Spinner data-icon="inline-start" />}
      {pending ? pendingLabel : children}
    </Button>
  );
}

/** Mensagem geral do formulário, anunciada por leitores de tela. */
export function FormMessage({ state }: { state: FormState }) {
  return (
    <div aria-live="polite">
      {state.status === "error" && state.message && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export function fieldProps(state: FormState, name: string) {
  const errors = state.fieldErrors?.[name];
  return {
    id: name,
    name,
    "aria-invalid": errors ? true : undefined,
    "aria-describedby": errors ? `${name}-error` : undefined,
  } as const;
}

export function FieldErrors({ state, name }: { state: FormState; name: string }) {
  return <FieldError id={`${name}-error`} errors={state.fieldErrors?.[name]} />;
}

export function ImageField({
  state,
  name,
  label,
  currentUrl,
  removeName,
}: {
  state: FormState;
  name: string;
  label: string;
  currentUrl?: string | null;
  removeName: string;
}) {
  const t = useMessages(dashboard).common;
  const invalid = Boolean(state.fieldErrors?.[name]);
  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      {currentUrl && (
        <div className="flex items-center gap-4">
          <Image
            src={currentUrl}
            alt={t.currentImage}
            width={64}
            height={64}
            className="size-16 rounded-lg border border-border object-cover"
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" name={removeName} className="size-4 accent-primary" />
            {t.removeCurrentImage}
          </label>
        </div>
      )}
      <Input
        {...fieldProps(state, name)}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
      />
      <FieldDescription>{t.imageHint}</FieldDescription>
      <FieldErrors state={state} name={name} />
    </Field>
  );
}

/** Exclusão com confirmação. A action verifica a sessão de admin no servidor. */
export function DeleteButton({
  id,
  itemName,
  action,
}: {
  id: string;
  itemName: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const t = useMessages(dashboard).common;
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive">
          <Trash2 data-icon="inline-start" aria-hidden="true" />
          {t.delete}
          <span className="sr-only"> {itemName}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.deleteTitle(itemName)}</AlertDialogTitle>
          <AlertDialogDescription>{t.deleteDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <form action={action}>
          <input type="hidden" name="id" value={id} />
          <AlertDialogFooter>
            <AlertDialogCancel type="button">{t.cancel}</AlertDialogCancel>
            <AlertDialogAction type="submit">{t.delete}</AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export type TranslationField = {
  name: string;
  label: string;
  max: number;
  /** Linhas do textarea; ausente = campo de uma linha */
  rows?: number;
  hint?: string;
};

/**
 * Campos traduzidos (inglês e espanhol) de um conteúdo, em abas. Enviados como
 * "en.title", "es.title"... Tudo opcional: vazio aparece em português no site.
 */
export function TranslationFields({
  state,
  fields,
  translations,
}: {
  state: FormState;
  fields: TranslationField[];
  translations?: Translations<Record<string, string>>;
}) {
  const t = useMessages(dashboard).translations;
  const value = (locale: string, name: string) =>
    state.values?.[`${locale}.${name}`] ?? translations?.[locale as keyof typeof translations]?.[name] ?? "";

  return (
    <fieldset className="flex flex-col gap-4 rounded-lg border border-border p-4">
      <legend className="px-1 text-sm font-medium text-foreground">{t.legend}</legend>
      <p className="text-sm text-muted-foreground">{t.hint}</p>
      <Tabs defaultValue="en" className="gap-4">
        <TabsList aria-label={t.tabsLabel}>
          {TRANSLATED_LOCALES.map((locale) => (
            <TabsTrigger key={locale} value={locale} lang={HTML_LANG[locale]}>
              {t[locale]}
            </TabsTrigger>
          ))}
        </TabsList>
        {TRANSLATED_LOCALES.map((locale) => (
          // forceMount: os campos das duas abas sempre vão no envio do formulário
          <TabsContent key={locale} value={locale} forceMount className="flex flex-col gap-4 data-[state=inactive]:hidden">
            {fields.map((field) => {
              const name = `${locale}.${field.name}`;
              const errors = state.fieldErrors?.[name];
              const common = {
                ...fieldProps(state, name),
                id: `tr-${locale}-${field.name}`,
                lang: HTML_LANG[locale],
                defaultValue: value(locale, field.name),
                maxLength: field.max,
              };
              return (
                <Field key={field.name} data-invalid={errors ? true : undefined}>
                  <FieldLabel htmlFor={common.id}>
                    {field.label} <span className="font-normal text-muted-foreground">({t[locale]})</span>
                  </FieldLabel>
                  {field.rows ? <Textarea {...common} rows={field.rows} /> : <Input {...common} />}
                  {field.hint && <FieldDescription>{field.hint}</FieldDescription>}
                  <FieldErrors state={state} name={name} />
                </Field>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
    </fieldset>
  );
}
