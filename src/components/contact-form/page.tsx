"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useState, type BaseSyntheticEvent } from "react";
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
import { contactFormSchema, type ContactFormInput } from "@/lib/schemas/contact-form";

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
const TEXT_FIELDS: {
  name: TextFieldName;
  label: string;
  type: "text" | "email" | "tel";
  autoComplete: string;
  placeholder: string;
  description?: string;
  optional?: boolean;
}[] = [
  { name: "nome", label: "Nome completo", type: "text", autoComplete: "name", placeholder: "Seu nome" },
  { name: "email", label: "E-mail", type: "email", autoComplete: "email", placeholder: "voce@email.com" },
  { name: "subject", label: "Assunto", type: "text", autoComplete: "off", placeholder: "Sobre o que vamos conversar?" },
  {
    name: "telefone",
    label: "Telefone",
    type: "tel",
    autoComplete: "tel",
    placeholder: "(31) 99999-9999",
    description: "Opcional. Preencha só se preferir contato por telefone.",
    optional: true,
  },
];

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
  // Antispam: robôs preenchem o campo invisível e enviam instantaneamente
  const [openedAt] = useState(() => Date.now());

  const form = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
    mode: "onSubmit",
  });

  async function onSubmit(inputData: ContactFormInput, event?: BaseSyntheticEvent) {
    const honeypot = (event?.target as HTMLFormElement | undefined)?.elements.namedItem("website");
    const formData = contactFormSchema.parse({
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
          Campos com <RequiredMark /> são obrigatórios.
        </p>

        {/* Honeypot: invisível e fora da ordem de foco e da árvore de acessibilidade */}
        <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
          <label htmlFor="website">Não preencha este campo</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {TEXT_FIELDS.map((config) => (
            <FormField
              key={config.name}
              control={form.control}
              name={config.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {config.label} {config.optional ? <span className="font-normal text-muted-foreground">(opcional)</span> : <RequiredMark />}
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
                Mensagem <RequiredMark />
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Conte sobre a vaga, o projeto ou a ideia."
                  maxLength={MESSAGE_MAX}
                  required
                  className="min-h-40 resize-y"
                />
              </FormControl>
              <FormDescription>
                Entre 10 e {MESSAGE_MAX} caracteres. {field.value?.length ?? 0}/{MESSAGE_MAX}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div aria-live="polite">
          {success && (
            <Alert>
              <CheckCircle2 aria-hidden="true" />
              <AlertTitle>Mensagem enviada</AlertTitle>
              <AlertDescription>Obrigado pelo contato. Respondo em até 24 horas úteis.</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertCircle aria-hidden="true" />
              <AlertTitle>Não foi possível enviar</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Seus dados são usados só para responder este contato.
          </p>
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? (
              <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
            ) : (
              <Send data-icon="inline-start" aria-hidden="true" />
            )}
            {isLoading ? "Enviando..." : "Enviar mensagem"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
