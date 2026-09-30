"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type {
  Resume,
  ResumeCourse,
  ResumeEducation,
  ResumeExperience,
  ResumeLink,
  ResumeProject,
  ResumeSkillGroup,
} from "@/lib/content/resume";
import { initialFormState } from "@/lib/content/schemas";

import { saveResumeAction } from "../actions";
import { FormMessage, SubmitButton } from "../form-parts";

// Estado controlado: o currículo inteiro vai num input escondido (JSON) e é
// validado no servidor. Controlado também sobrevive ao reset do form após erro.

type TextProps = {
  id: string;
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  hint?: string;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  type?: string;
  placeholder?: string;
};

function TextField({ id, label, value, onChange, hint, multiline, rows = 3, maxLength, type, placeholder }: TextProps) {
  const describedBy = hint ? `${id}-hint` : undefined;
  const common = {
    id,
    value: value ?? "",
    maxLength,
    placeholder,
    "aria-describedby": describedBy,
  };
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {multiline ? (
        <Textarea {...common} rows={rows} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <Input {...common} type={type} onChange={(event) => onChange(event.target.value)} />
      )}
      {hint && <FieldDescription id={describedBy}>{hint}</FieldDescription>}
    </Field>
  );
}

/** Tópicos editados como texto, um por linha */
function BulletsField({ id, value, onChange, max }: { id: string; value: string[]; onChange: (value: string[]) => void; max: number }) {
  return (
    <TextField
      id={id}
      label="Tópicos"
      value={value.join("\n")}
      onChange={(next) => onChange(next.split("\n"))}
      multiline
      rows={4}
      hint={`Um por linha, até ${max}. Comece com um verbo: “Desenvolvimento de...”, “Criação de...”.`}
    />
  );
}

function ListEditor<T>({
  title,
  description,
  itemName,
  items,
  max,
  empty,
  onChange,
  renderItem,
}: {
  title: string;
  description?: string;
  /** "experiência", "projeto"... usado nos rótulos */
  itemName: string;
  items: T[];
  max: number;
  empty: T;
  onChange: (items: T[]) => void;
  renderItem: (item: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode;
}) {
  const update = (index: number, patch: Partial<T>) =>
    onChange(items.map((item, current) => (current === index ? { ...item, ...patch } : item)));
  const move = (index: number, delta: number) => {
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next);
  };

  return (
    <FieldSet>
      <FieldLegend>{title}</FieldLegend>
      {description && <FieldDescription>{description}</FieldDescription>}
      <ol className="flex flex-col gap-4">
        {items.map((item, index) => (
          <li key={index} className="flex flex-col gap-4 rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">
                {itemName.charAt(0).toUpperCase() + itemName.slice(1)} {index + 1}
              </p>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Mover ${itemName} ${index + 1} para cima`}>
                  <ArrowUp aria-hidden="true" />
                </Button>
                <Button type="button" variant="ghost" size="icon" disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label={`Mover ${itemName} ${index + 1} para baixo`}>
                  <ArrowDown aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => onChange(items.filter((_, current) => current !== index))}
                  aria-label={`Remover ${itemName} ${index + 1}`}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </div>
            {renderItem(item, (patch) => update(index, patch), index)}
          </li>
        ))}
      </ol>
      <div>
        <Button type="button" variant="outline" size="sm" disabled={items.length >= max} onClick={() => onChange([...items, empty])}>
          <Plus data-icon="inline-start" aria-hidden="true" />
          Adicionar {itemName}
        </Button>
      </div>
    </FieldSet>
  );
}

const EMPTY = {
  link: { label: "", url: "" } satisfies ResumeLink,
  skill: { label: "", items: "" } satisfies ResumeSkillGroup,
  experience: { role: "", organization: "", period: "", bullets: [] } satisfies ResumeExperience,
  project: { name: "", context: "", bullets: [], linkLabel: "", linkUrl: "" } satisfies ResumeProject,
  education: { course: "", institution: "", period: "", details: "" } satisfies ResumeEducation,
  course: { name: "", details: "", url: "" } satisfies ResumeCourse,
};

export function ResumeForm({ resume: initial }: { resume: Resume }) {
  const [state, formAction] = useActionState(saveResumeAction, initialFormState);
  const [resume, setResume] = useState<Resume>(initial);
  const set = <K extends keyof Resume>(key: K) => (value: Resume[K]) => setResume((current) => ({ ...current, [key]: value }));
  const errors = state.fieldErrors?.resume;

  return (
    <form action={formAction} className="flex flex-col gap-8" noValidate>
      <input type="hidden" name="resume" value={JSON.stringify(resume)} />
      <FormMessage state={state} />
      {errors && (
        <ul className="-mt-4 flex list-disc flex-col gap-1 pl-5 text-sm text-destructive">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <FieldGroup>
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField id="name" label="Nome" value={resume.name} onChange={set("name")} maxLength={80} />
          <TextField id="headline" label="Cargo ou objetivo" value={resume.headline} onChange={set("headline")} maxLength={80} />
        </div>
        <TextField
          id="stack"
          label="Stack em destaque (opcional)"
          value={resume.stack}
          onChange={set("stack")}
          maxLength={120}
          hint="Aparece abaixo do cargo. Ex.: “JavaScript/TypeScript · React/Next.js · Node.js”."
        />
        <TextField
          id="summary"
          label="Resumo profissional"
          value={resume.summary}
          onChange={set("summary")}
          multiline
          rows={6}
          maxLength={1500}
          hint="Quem você é, o que já entregou e o que busca. Até 1500 caracteres."
        />

        <FieldSet>
          <FieldLegend>Contato (privado)</FieldLegend>
          <FieldDescription>Só entra no PDF baixado pelo painel. A página pública nunca mostra esses dados.</FieldDescription>
          <div className="grid gap-6 sm:grid-cols-3">
            <TextField id="email" label="E-mail" type="email" value={resume.email} onChange={set("email")} maxLength={120} />
            <TextField id="phone" label="Celular" type="tel" value={resume.phone} onChange={set("phone")} maxLength={30} />
            <TextField id="location" label="Cidade" value={resume.location} onChange={set("location")} maxLength={80} />
          </div>
        </FieldSet>

        <ListEditor
          title="Links"
          itemName="link"
          items={resume.links}
          max={6}
          empty={EMPTY.link}
          onChange={set("links")}
          renderItem={(link, update, index) => (
            <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
              <TextField id={`link-${index}-label`} label="Rótulo" value={link.label} onChange={(label) => update({ label })} maxLength={40} placeholder="LinkedIn" />
              <TextField id={`link-${index}-url`} label="Endereço" type="url" value={link.url} onChange={(url) => update({ url })} placeholder="https://" />
            </div>
          )}
        />

        <ListEditor
          title="Habilidades"
          description="Agrupe por área. Ex.: Front-end, Back-end, Banco de dados, Idiomas."
          itemName="grupo"
          items={resume.skills}
          max={8}
          empty={EMPTY.skill}
          onChange={set("skills")}
          renderItem={(group, update, index) => (
            <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
              <TextField id={`skill-${index}-label`} label="Grupo" value={group.label} onChange={(label) => update({ label })} maxLength={40} />
              <TextField id={`skill-${index}-items`} label="Habilidades" value={group.items} onChange={(items) => update({ items })} maxLength={300} hint="Separadas por vírgula." />
            </div>
          )}
        />

        <ListEditor
          title="Experiência profissional"
          description="Da mais recente para a mais antiga."
          itemName="experiência"
          items={resume.experience}
          max={10}
          empty={EMPTY.experience}
          onChange={set("experience")}
          renderItem={(item, update, index) => (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <TextField id={`exp-${index}-role`} label="Cargo" value={item.role} onChange={(role) => update({ role })} maxLength={100} />
                <TextField id={`exp-${index}-org`} label="Empresa (opcional)" value={item.organization} onChange={(organization) => update({ organization })} maxLength={100} />
                <TextField id={`exp-${index}-period`} label="Período" value={item.period} onChange={(period) => update({ period })} maxLength={60} placeholder="Ago/2026 – Atual" />
              </div>
              <BulletsField id={`exp-${index}-bullets`} value={item.bullets} onChange={(bullets) => update({ bullets })} max={8} />
            </>
          )}
        />

        <ListEditor
          title="Projetos"
          itemName="projeto"
          items={resume.projects}
          max={10}
          empty={EMPTY.project}
          onChange={set("projects")}
          renderItem={(item, update, index) => (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField id={`proj-${index}-name`} label="Nome" value={item.name} onChange={(name) => update({ name })} maxLength={120} />
                <TextField id={`proj-${index}-context`} label="Contexto (opcional)" value={item.context} onChange={(context) => update({ context })} maxLength={60} placeholder="Freelance · Next.js" />
              </div>
              <BulletsField id={`proj-${index}-bullets`} value={item.bullets} onChange={(bullets) => update({ bullets })} max={6} />
              <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
                <TextField id={`proj-${index}-link-label`} label="Rótulo do link" value={item.linkLabel} onChange={(linkLabel) => update({ linkLabel })} maxLength={30} placeholder="Deploy" />
                <TextField id={`proj-${index}-link-url`} label="Link (opcional)" type="url" value={item.linkUrl} onChange={(linkUrl) => update({ linkUrl })} placeholder="https://" />
              </div>
            </>
          )}
        />

        <ListEditor
          title="Formação"
          itemName="formação"
          items={resume.education}
          max={6}
          empty={EMPTY.education}
          onChange={set("education")}
          renderItem={(item, update, index) => (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <TextField id={`edu-${index}-course`} label="Curso" value={item.course} onChange={(course) => update({ course })} maxLength={120} />
                <TextField id={`edu-${index}-inst`} label="Instituição" value={item.institution} onChange={(institution) => update({ institution })} maxLength={120} />
                <TextField id={`edu-${index}-period`} label="Período" value={item.period} onChange={(period) => update({ period })} maxLength={60} placeholder="Jul/2024 – Jul/2025" />
              </div>
              <TextField id={`edu-${index}-details`} label="Detalhes (opcional)" value={item.details} onChange={(details) => update({ details })} maxLength={200} />
            </>
          )}
        />

        <ListEditor
          title="Cursos e certificações"
          itemName="curso"
          items={resume.courses}
          max={12}
          empty={EMPTY.course}
          onChange={set("courses")}
          renderItem={(item, update, index) => (
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField id={`course-${index}-name`} label="Nome" value={item.name} onChange={(name) => update({ name })} maxLength={160} />
              <TextField id={`course-${index}-details`} label="Detalhes (opcional)" value={item.details} onChange={(details) => update({ details })} maxLength={100} placeholder="Udemy · 5 h · 2026" />
              <TextField id={`course-${index}-url`} label="Certificado (opcional)" type="url" value={item.url} onChange={(url) => update({ url })} placeholder="https://" />
            </div>
          )}
        />

        <TextField
          id="availability"
          label="Disponibilidade (opcional)"
          value={resume.availability}
          onChange={set("availability")}
          maxLength={200}
          placeholder="Remoto, híbrido ou presencial"
        />

        <div className="flex items-start gap-3">
          <Switch
            id="published"
            checked={resume.published}
            onCheckedChange={set("published")}
            aria-describedby="published-hint"
          />
          <div className="flex flex-col gap-1">
            <Label htmlFor="published">Publicar em /curriculo</Label>
            <FieldDescription id="published-hint">
              A página pública mostra o currículo com botão de download. O botão “Ver currículo” da home passa a abrir essa página.
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
