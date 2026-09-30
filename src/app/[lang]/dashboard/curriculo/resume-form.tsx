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
import { useLocale } from "@/lib/i18n/client";
import { HTML_LANG, type Locale } from "@/lib/i18n/config";
import { resume as resumeMessages } from "@/lib/i18n/messages/resume";

import { saveResumeAction } from "../actions";
import { FormMessage, SubmitButton } from "../form-parts";

// Estado controlado: o currículo inteiro vai num input escondido (JSON) e é
// validado no servidor. Controlado também sobrevive ao reset do form após erro.
// Rótulos no idioma do painel; o texto digitado recebe o lang do idioma do currículo.

type EditorMessages = (typeof resumeMessages)["pt"]["editor"];

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
  /** Idioma do texto digitado (corretor ortográfico e leitores de tela) */
  lang?: string;
};

function TextField({ id, label, value, onChange, hint, multiline, rows = 3, maxLength, type, placeholder, lang }: TextProps) {
  const describedBy = hint ? `${id}-hint` : undefined;
  const common = {
    id,
    value: value ?? "",
    maxLength,
    placeholder,
    lang,
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
function BulletsField({
  id,
  value,
  onChange,
  max,
  t,
  lang,
}: {
  id: string;
  value: string[];
  onChange: (value: string[]) => void;
  max: number;
  t: EditorMessages;
  lang: string;
}) {
  return (
    <TextField
      id={id}
      label={t.bullets}
      value={value.join("\n")}
      onChange={(next) => onChange(next.split("\n"))}
      multiline
      rows={4}
      hint={t.bulletsHint(max)}
      lang={lang}
    />
  );
}

function ListEditor<T>({
  t,
  title,
  description,
  itemName,
  items,
  max,
  empty,
  onChange,
  renderItem,
}: {
  t: EditorMessages;
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
                <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => move(index, -1)} aria-label={t.moveUp(itemName, index + 1)}>
                  <ArrowUp aria-hidden="true" />
                </Button>
                <Button type="button" variant="ghost" size="icon" disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label={t.moveDown(itemName, index + 1)}>
                  <ArrowDown aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => onChange(items.filter((_, current) => current !== index))}
                  aria-label={t.remove(itemName, index + 1)}
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
          {t.add(itemName)}
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

export function ResumeForm({ resume: initial, contentLocale }: { resume: Resume; contentLocale: Locale }) {
  const t = resumeMessages[useLocale()].editor;
  const lang = HTML_LANG[contentLocale];
  const [state, formAction] = useActionState(saveResumeAction, initialFormState);
  const [resume, setResume] = useState<Resume>(initial);
  const set = <K extends keyof Resume>(key: K) => (value: Resume[K]) => setResume((current) => ({ ...current, [key]: value }));
  const errors = state.fieldErrors?.resume;

  return (
    <form action={formAction} className="flex flex-col gap-8" noValidate>
      <input type="hidden" name="resume" value={JSON.stringify(resume)} />
      <input type="hidden" name="contentLocale" value={contentLocale} />
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
          <TextField id="name" label={t.name} value={resume.name} onChange={set("name")} maxLength={80} />
          <TextField id="headline" label={t.headline} value={resume.headline} onChange={set("headline")} maxLength={80} lang={lang} />
        </div>
        <TextField id="stack" label={t.stack} value={resume.stack} onChange={set("stack")} maxLength={120} hint={t.stackHint} />
        <TextField
          id="summary"
          label={t.summary}
          value={resume.summary}
          onChange={set("summary")}
          multiline
          rows={6}
          maxLength={1500}
          hint={t.summaryHint}
          lang={lang}
        />

        <FieldSet>
          <FieldLegend>{t.contact}</FieldLegend>
          <FieldDescription>{t.contactHint}</FieldDescription>
          <div className="grid gap-6 sm:grid-cols-3">
            <TextField id="email" label={t.email} type="email" value={resume.email} onChange={set("email")} maxLength={120} />
            <TextField id="phone" label={t.phone} type="tel" value={resume.phone} onChange={set("phone")} maxLength={30} />
            <TextField id="location" label={t.location} value={resume.location} onChange={set("location")} maxLength={80} />
          </div>
        </FieldSet>

        <ListEditor
          t={t}
          title={t.links}
          itemName={t.linkItem}
          items={resume.links}
          max={6}
          empty={EMPTY.link}
          onChange={set("links")}
          renderItem={(link, update, index) => (
            <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
              <TextField id={`link-${index}-label`} label={t.linkLabel} value={link.label} onChange={(label) => update({ label })} maxLength={40} placeholder="LinkedIn" lang={lang} />
              <TextField id={`link-${index}-url`} label={t.linkUrl} type="url" value={link.url} onChange={(url) => update({ url })} placeholder="https://" />
            </div>
          )}
        />

        <ListEditor
          t={t}
          title={t.skills}
          description={t.skillsHint}
          itemName={t.skillItem}
          items={resume.skills}
          max={8}
          empty={EMPTY.skill}
          onChange={set("skills")}
          renderItem={(group, update, index) => (
            <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
              <TextField id={`skill-${index}-label`} label={t.skillGroup} value={group.label} onChange={(label) => update({ label })} maxLength={40} lang={lang} />
              <TextField id={`skill-${index}-items`} label={t.skillItems} value={group.items} onChange={(items) => update({ items })} maxLength={300} hint={t.commaHint} lang={lang} />
            </div>
          )}
        />

        <ListEditor
          t={t}
          title={t.experience}
          description={t.experienceHint}
          itemName={t.experienceItem}
          items={resume.experience}
          max={10}
          empty={EMPTY.experience}
          onChange={set("experience")}
          renderItem={(item, update, index) => (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <TextField id={`exp-${index}-role`} label={t.role} value={item.role} onChange={(role) => update({ role })} maxLength={100} lang={lang} />
                <TextField id={`exp-${index}-org`} label={t.organization} value={item.organization} onChange={(organization) => update({ organization })} maxLength={100} />
                <TextField id={`exp-${index}-period`} label={t.period} value={item.period} onChange={(period) => update({ period })} maxLength={60} placeholder="08/2026 – 12/2026" lang={lang} />
              </div>
              <BulletsField id={`exp-${index}-bullets`} value={item.bullets} onChange={(bullets) => update({ bullets })} max={8} t={t} lang={lang} />
            </>
          )}
        />

        <ListEditor
          t={t}
          title={t.projects}
          itemName={t.projectItem}
          items={resume.projects}
          max={10}
          empty={EMPTY.project}
          onChange={set("projects")}
          renderItem={(item, update, index) => (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField id={`proj-${index}-name`} label={t.projectName} value={item.name} onChange={(name) => update({ name })} maxLength={120} lang={lang} />
                <TextField id={`proj-${index}-context`} label={t.context} value={item.context} onChange={(context) => update({ context })} maxLength={60} placeholder="Freelance · Next.js" lang={lang} />
              </div>
              <BulletsField id={`proj-${index}-bullets`} value={item.bullets} onChange={(bullets) => update({ bullets })} max={6} t={t} lang={lang} />
              <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
                <TextField id={`proj-${index}-link-label`} label={t.projectLinkLabel} value={item.linkLabel} onChange={(linkLabel) => update({ linkLabel })} maxLength={30} placeholder="Deploy" lang={lang} />
                <TextField id={`proj-${index}-link-url`} label={t.projectLink} type="url" value={item.linkUrl} onChange={(linkUrl) => update({ linkUrl })} placeholder="https://" />
              </div>
            </>
          )}
        />

        <ListEditor
          t={t}
          title={t.education}
          itemName={t.educationItem}
          items={resume.education}
          max={6}
          empty={EMPTY.education}
          onChange={set("education")}
          renderItem={(item, update, index) => (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <TextField id={`edu-${index}-course`} label={t.course} value={item.course} onChange={(course) => update({ course })} maxLength={120} lang={lang} />
                <TextField id={`edu-${index}-inst`} label={t.institution} value={item.institution} onChange={(institution) => update({ institution })} maxLength={120} />
                <TextField id={`edu-${index}-period`} label={t.period} value={item.period} onChange={(period) => update({ period })} maxLength={60} placeholder="07/2024 – 07/2025" lang={lang} />
              </div>
              <TextField id={`edu-${index}-details`} label={t.details} value={item.details} onChange={(details) => update({ details })} maxLength={200} lang={lang} />
            </>
          )}
        />

        <ListEditor
          t={t}
          title={t.courses}
          itemName={t.courseItem}
          items={resume.courses}
          max={12}
          empty={EMPTY.course}
          onChange={set("courses")}
          renderItem={(item, update, index) => (
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField id={`course-${index}-name`} label={t.projectName} value={item.name} onChange={(name) => update({ name })} maxLength={160} lang={lang} />
              <TextField id={`course-${index}-details`} label={t.details} value={item.details} onChange={(details) => update({ details })} maxLength={100} placeholder="Udemy · 5 h · 2026" lang={lang} />
              <TextField id={`course-${index}-url`} label={t.certificate} type="url" value={item.url} onChange={(url) => update({ url })} placeholder="https://" />
            </div>
          )}
        />

        <TextField
          id="availability"
          label={t.availability}
          value={resume.availability}
          onChange={set("availability")}
          maxLength={200}
          placeholder={t.availabilityPlaceholder}
          lang={lang}
        />

        {contentLocale === "pt" ? (
          <div className="flex items-start gap-3">
            <Switch id="published" checked={resume.published} onCheckedChange={set("published")} aria-describedby="published-hint" />
            <div className="flex flex-col gap-1">
              <Label htmlFor="published">{t.publish}</Label>
              <FieldDescription id="published-hint">{t.publishHint}</FieldDescription>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t.publishOnlyPt}</p>
        )}
      </FieldGroup>

      <div>
        <SubmitButton pendingLabel={t.saving}>{t.save}</SubmitButton>
      </div>
    </form>
  );
}
