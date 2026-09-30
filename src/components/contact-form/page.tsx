"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useMemo, useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useContactForm } from "@/hooks/useContactForm";
import { useMessages } from "@/lib/i18n/client";
import { home } from "@/lib/i18n/messages/home";
import { createContactFormSchema, type ContactFormInput } from "@/lib/schemas/contact-form";

type ContactMessages = (typeof home)["pt"]["contact"];

const MESSAGE_MAX = 500;

// Chamado só no envio (fora do render)
const millisecondsSince = (start: number) => Date.now() - start;

const defaultValues: ContactFormInput = {
  nome: "",
  email: "",
  telefone: "",
  message: "",
  subject: "",
  lidor: false,
  create: new Date().toISOString(),
  id: "",
  update: "",
};

type TextFieldName = "nome" | "email" | "telefone" | "subject";

// Campos de linha única: uma configuração em vez de blocos repetidos
function textFields(t: ContactMessages): {
  name: TextFieldName;
  label: string;
  type: "text" | "email" | "tel";
  autoComplete: string;
  placeholder: string;
  description?: string;
  optional?: boolean;
}[] {
  return [
    { name: "nome", type: "text", autoComplete: "name", ...t.name },
    { name: "email", type: "email", autoComplete: "email", ...t.email },
    { name: "subject", type: "text", autoComplete: "off", ...t.subject },
    { name: "telefone", type: "tel", autoComplete: "tel", ...t.phone, optional: true },
  ];
}

function RequiredMark() {
  // O asterisco é visual; o "required" do campo informa os leitores de tela
  return (
    <span aria-hidden="true" className="text-destructive">
      *
    </span>
  );
}

export function ContactForm() {
  const { submitForm, isLoading, error, success, reset } = useContactForm();
  const t = useMessages(home).contact;
  const schema = useMemo(() => createContactFormSchema(t.validation), [t]);
  // Antispam: robôs preenchem o campo invisível e enviam instantaneamente
  const [openedAt] = useState(() => Date.now());

  const form = useForm<ContactFormInput>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onSubmit",
  });

  async function onSubmit(inputData: ContactFormInput, event?: BaseSyntheticEvent) {
    const honeypot = (event?.target as HTMLFormElement | undefined)?.elements.namedItem("website");
    const formData = schema.parse({
      ...inputData,
      id: inputData.id || uuidv4(),
      create: inputData.create ?? new Date().toISOString(),
      update: new Date().toISOString(),
      lidor: inputData.lidor ?? false,
    });

    const result = await submitForm({
      ...formData,
      website: honeypot instanceof HTMLInputElement ? honeypot.value : "",
      elapsedMs: millisecondsSince(openedAt),
    });
    if (result.success) {
      form.reset(defaultValues);
      reset();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="relative flex flex-col gap-6">
        <p className="text-sm text-muted-foreground">
          {t.requiredNoteBefore} <RequiredMark /> {t.requiredNoteAfter}
        </p>

        {/* Honeypot: invisível e fora da ordem de foco e da árvore de acessibilidade */}
        <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
          <label htmlFor="website">{t.honeypot}</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {textFields(t).map((config) => (
            <FormField
              key={config.name}
              control={form.control}
              name={config.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {config.label} {config.optional ? <span className="font-normal text-muted-foreground">{t.optional}</span> : <RequiredMark />}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      type={config.type}
                      autoComplete={config.autoComplete}
                      placeholder={config.placeholder}
                      required={!config.optional}
                      className="h-11"
                    />
                  </FormControl>
                  {config.description && <FormDescription>{config.description}</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t.message.label} <RequiredMark />
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={t.message.placeholder}
                  maxLength={MESSAGE_MAX}
                  required
                  className="min-h-40 resize-y"
                />
              </FormControl>
              <FormDescription>
                {t.message.counter(MESSAGE_MAX, field.value?.length ?? 0)}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div aria-live="polite">
          {success && (
            <Alert>
              <CheckCircle2 aria-hidden="true" />
              <AlertTitle>{t.successTitle}</AlertTitle>
              <AlertDescription>{t.successDescription}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertCircle aria-hidden="true" />
              <AlertTitle>{t.errorTitle}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {t.privacy}
          </p>
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? (
              <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
            ) : (
              <Send data-icon="inline-start" aria-hidden="true" />
            )}
            {isLoading ? t.sending : t.send}
          </Button>
        </div>
      </form>
    </Form>
  );
}
