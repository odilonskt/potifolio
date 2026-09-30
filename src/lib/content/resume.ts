// lib/content/resume.ts
// Currículo montado no painel: validação, valores iniciais e a "visão" pronta para
// exibir (HTML, impressão e PDF usam a mesma visão, então saem sempre iguais).
import { z } from "zod";

import { formatMonth } from "@/lib/content/dates";
import { ABOUT, PROFILE, SOCIAL_LINKS } from "@/lib/content/profile";
import type { JourneyItem } from "@/lib/content/schemas";

const MAX_LINKS = 6;
const MAX_LANGUAGES = 8;

/** Campos vazios chegam como "" — tratamos como ausentes. */
const optionalText = (max: number) =>
  z.preprocess((value) => (value === "" ? undefined : value), z.string().trim().max(max).optional());

/** "React, Node.js, React" → ["React", "Node.js"] */
const commaList = (maxItems: number) =>
  z
    .string()
    .max(1000)
    .transform((value) => [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))].slice(0, maxItems));

/** Uma entrada por linha, sem linhas vazias. */
const lineList = (maxItems: number, maxLength: number) =>
  z
    .string()
    .max(2000)
    .transform((value) =>
      value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, maxItems)
        .map((line) => line.slice(0, maxLength)),
    );

export type ResumeLink = { label: string; url: string };

/** Linhas "Rótulo | https://..." → links. Só https, para nada estranho ir parar no PDF. */
const linkList = z
  .string()
  .max(2000)
  .transform((value, ctx) => {
    const links: ResumeLink[] = [];
    for (const line of value.split("\n").map((item) => item.trim()).filter(Boolean)) {
      const [label, url] = line.split("|").map((part) => part.trim());
      const valid = label && url && z.string().url().safeParse(url).success && url.startsWith("https://");
      if (!valid) {
        ctx.addIssue({ code: "custom", message: `Linha inválida: “${line.slice(0, 40)}”. Use Rótulo | https://...` });
        return z.NEVER;
      }
      links.push({ label: label.slice(0, 40), url: url.slice(0, 300) });
    }
    return links.slice(0, MAX_LINKS);
  });

export const resumeInputSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome").max(80),
  role: z.string().trim().min(2, "Informe o cargo ou objetivo").max(80),
  summary: z.string().trim().min(20, "Escreva um resumo de ao menos 20 caracteres").max(1200),
  // Privados: só no PDF baixado pelo painel, nunca na página pública
  email: z.preprocess((value) => (value === "" ? undefined : value), z.string().trim().email("E-mail inválido").max(120).optional()),
  phone: optionalText(30),
  location: optionalText(80),
  links: linkList,
  skills: commaList(30),
  softSkills: commaList(15),
  languages: lineList(MAX_LANGUAGES, 60),
  journeyIds: z.array(z.string().regex(/^[A-Za-z0-9_-]{1,64}$/)).max(100),
  published: z.preprocess((value) => value === "on" || value === true, z.boolean()),
});

export type ResumeInput = z.infer<typeof resumeInputSchema>;
export type Resume = ResumeInput & { updatedAt?: string };

/** Primeiro rascunho, montado com o que o site já tem. Nada é salvo até você clicar em salvar. */
export function defaultResume(journey: JourneyItem[]): Resume {
  const [technical, personal] = ABOUT;
  return {
    name: PROFILE.name,
    role: PROFILE.role,
    summary: PROFILE.bio,
    links: SOCIAL_LINKS.filter((link) => link.name !== "Instagram").map((link) => ({ label: link.name, url: link.href })),
    skills: technical?.highlights.map((item) => item.text) ?? [],
    softSkills: personal?.highlights.map((item) => item.text) ?? [],
    languages: ["Português: nativo"],
    journeyIds: journey.map((item) => item.id),
    published: false,
  };
}

// ─── Visão para exibição ──────────────────────────────────────────────────────

export type ResumeEntry = {
  title: string;
  organization: string;
  period: string;
  description: string;
  link?: string;
};

export type ResumeView = {
  name: string;
  role: string;
  summary: string;
  /** Vazio na versão pública */
  contact: string[];
  links: ResumeLink[];
  skills: string[];
  softSkills: string[];
  languages: string[];
  work: ResumeEntry[];
  education: ResumeEntry[];
  certificates: ResumeEntry[];
};

function toEntry(item: JourneyItem): ResumeEntry {
  const start = formatMonth(item.startDate);
  const period =
    item.kind === "certificate" ? start : `${start} – ${item.endDate ? formatMonth(item.endDate) : "atual"}`;
  return {
    title: item.title,
    organization: item.organization,
    period,
    description: item.description,
    link: item.link,
  };
}

/**
 * `includePrivate: false` (página e PDF públicos) remove e-mail, telefone e cidade:
 * o portfólio não publica dados pessoais de contato.
 */
export function buildResumeView(
  resume: Resume,
  journey: JourneyItem[],
  { includePrivate }: { includePrivate: boolean },
): ResumeView {
  const selected = new Set(resume.journeyIds);
  // A trajetória já vem ordenada (atuais primeiro, depois do mais recente)
  const items = journey.filter((item) => selected.has(item.id));
  const byKind = (kind: JourneyItem["kind"]) => items.filter((item) => item.kind === kind).map(toEntry);

  return {
    name: resume.name,
    role: resume.role,
    summary: resume.summary,
    contact: includePrivate ? [resume.email, resume.phone, resume.location].filter((value): value is string => Boolean(value)) : [],
    links: resume.links,
    skills: resume.skills,
    softSkills: resume.softSkills,
    languages: resume.languages,
    work: byKind("work"),
    education: byKind("education"),
    certificates: byKind("certificate"),
  };
}
