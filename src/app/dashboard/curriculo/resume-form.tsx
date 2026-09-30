"use client";

import { useActionState, useState } from "react";

import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatMonth } from "@/lib/content/dates";
import type { Resume } from "@/lib/content/resume";
import { initialFormState, JOURNEY_KIND_LABELS, JOURNEY_KINDS, type JourneyItem } from "@/lib/content/schemas";

import { saveResumeAction } from "../actions";
import { fieldProps, FieldErrors, FormMessage, SubmitButton } from "../form-parts";

/** Valores salvos convertidos para o texto que cada campo edita. */
function toFormValues(resume: Resume): Record<string, string> {
  return {
    name: resume.name,
    role: resume.role,
    summary: resume.summary,
    email: resume.email ?? "",
    phone: resume.phone ?? "",
    location: resume.location ?? "",
    links: resume.links.map((link) => `${link.label} | ${link.url}`).join("\n"),
    skills: resume.skills.join(", "),
    softSkills: resume.softSkills.join(", "),
    languages: resume.languages.join("\n"),
  };
}

export function ResumeForm({ resume, journey }: { resume: Resume; journey: JourneyItem[] }) {
  const [state, formAction] = useActionState(saveResumeAction, initialFormState);
  const saved = toFormValues(resume);
  const value = (name: string) => state.values?.[name] ?? saved[name] ?? "";
  const invalid = (name: string) => Boolean(state.fieldErrors?.[name]) || undefined;

  // Controlados: o React reseta o formulário após a action e perderia as escolhas em caso de erro
  const [selected, setSelected] = useState(() => new Set(resume.journeyIds));
  const [published, setPublished] = useState(resume.published);

  const toggle = (id: string, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <FormMessage state={state} />

      <FieldGroup>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={invalid("name")}>
            <FieldLabel htmlFor="name">Nome</FieldLabel>
            <Input {...fieldProps(state, "name")} defaultValue={value("name")} required maxLength={80} autoComplete="name" />
            <FieldErrors state={state} name="name" />
          </Field>
          <Field data-invalid={invalid("role")}>
            <FieldLabel htmlFor="role">Cargo ou objetivo</FieldLabel>
            <Input {...fieldProps(state, "role")} defaultValue={value("role")} required maxLength={80} />
            <FieldErrors state={state} name="role" />
          </Field>
        </div>

        <Field data-invalid={invalid("summary")}>
          <FieldLabel htmlFor="summary">Resumo profissional</FieldLabel>
          <Textarea {...fieldProps(state, "summary")} defaultValue={value("summary")} rows={4} required maxLength={1200} />
          <FieldDescription>Duas ou três frases sobre quem você é e o que busca. Até 1200 caracteres.</FieldDescription>
          <FieldErrors state={state} name="summary" />
        </Field>

        <FieldSet>
          <FieldLegend>Contato (privado)</FieldLegend>
          <FieldDescription>Só aparece no PDF baixado pelo painel. A página pública não mostra esses dados.</FieldDescription>
          <div className="grid gap-6 sm:grid-cols-3">
            <Field data-invalid={invalid("email")}>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input {...fieldProps(state, "email")} type="email" defaultValue={value("email")} maxLength={120} autoComplete="email" />
              <FieldErrors state={state} name="email" />
            </Field>
            <Field data-invalid={invalid("phone")}>
              <FieldLabel htmlFor="phone">Telefone</FieldLabel>
              <Input {...fieldProps(state, "phone")} type="tel" defaultValue={value("phone")} maxLength={30} autoComplete="tel" />
              <FieldErrors state={state} name="phone" />
            </Field>
            <Field data-invalid={invalid("location")}>
              <FieldLabel htmlFor="location">Cidade</FieldLabel>
              <Input {...fieldProps(state, "location")} defaultValue={value("location")} maxLength={80} />
              <FieldErrors state={state} name="location" />
            </Field>
          </div>
        </FieldSet>

        <Field data-invalid={invalid("links")}>
          <FieldLabel htmlFor="links">Links</FieldLabel>
          <Textarea {...fieldProps(state, "links")} defaultValue={value("links")} rows={3} className="font-mono text-sm" />
          <FieldDescription>Um por linha, no formato “GitHub | https://github.com/...”. Até 6.</FieldDescription>
          <FieldErrors state={state} name="links" />
        </Field>

        <FieldSet>
          <FieldLegend>Trajetória no currículo</FieldLegend>
          <FieldDescription>
            Marque os itens que entram. Para editar textos e datas, use a página Trajetória.
          </FieldDescription>
          {journey.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum item na Trajetória ainda.</p>
          ) : (
            JOURNEY_KINDS.map((kind) => {
              const items = journey.filter((item) => item.kind === kind);
              if (items.length === 0) return null;
              return (
                <div key={kind} role="group" aria-labelledby={`journey-${kind}`} className="flex flex-col gap-2">
                  <p id={`journey-${kind}`} className="text-sm font-medium text-foreground">
                    {JOURNEY_KIND_LABELS[kind]}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {items.map((item) => (
                      <li key={item.id}>
                        <Label
                          htmlFor={`journey-item-${item.id}`}
                          className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 font-normal has-[:checked]:border-primary has-[:checked]:bg-primary/10"
                        >
                          <input
                            id={`journey-item-${item.id}`}
                            type="checkbox"
                            name="journeyIds"
                            value={item.id}
                            checked={selected.has(item.id)}
                            onChange={(event) => toggle(item.id, event.target.checked)}
                            className="mt-0.5 size-4 accent-primary"
                          />
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate text-foreground">{item.title}</span>
                            <span className="truncate text-xs text-muted-foreground">
                              {item.organization}, {formatMonth(item.startDate)}
                            </span>
                          </span>
                        </Label>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          )}
        </FieldSet>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={invalid("skills")}>
            <FieldLabel htmlFor="skills">Competências técnicas</FieldLabel>
            <Textarea {...fieldProps(state, "skills")} defaultValue={value("skills")} rows={3} />
            <FieldDescription>Separadas por vírgula. Até 30.</FieldDescription>
            <FieldErrors state={state} name="skills" />
          </Field>
          <Field data-invalid={invalid("softSkills")}>
            <FieldLabel htmlFor="softSkills">Competências pessoais</FieldLabel>
            <Textarea {...fieldProps(state, "softSkills")} defaultValue={value("softSkills")} rows={3} />
            <FieldDescription>Separadas por vírgula. Até 15.</FieldDescription>
            <FieldErrors state={state} name="softSkills" />
          </Field>
        </div>

        <Field data-invalid={invalid("languages")}>
          <FieldLabel htmlFor="languages">Idiomas</FieldLabel>
          <Textarea {...fieldProps(state, "languages")} defaultValue={value("languages")} rows={2} />
          <FieldDescription>Um por linha. Ex.: “Inglês: intermediário”.</FieldDescription>
          <FieldErrors state={state} name="languages" />
        </Field>

        <div className="flex items-start gap-3">
          <Switch id="published" name="published" checked={published} onCheckedChange={setPublished} aria-describedby="published-hint" />
          <div className="flex flex-col gap-1">
            <Label htmlFor="published">Publicar em /curriculo</Label>
            <FieldDescription id="published-hint">
              O botão “Ver currículo” da home passa a abrir esta página, com opção de baixar o PDF.
            </FieldDescription>
          </div>
        </div>
      </FieldGroup>

      <div>
        <SubmitButton pendingLabel="Salvando...">Salvar currículo</SubmitButton>
      </div>
    </form>
  );
}
