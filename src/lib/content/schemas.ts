// lib/content/schemas.ts
// Validação dos conteúdos gerenciados pelo painel (trajetória, blog e projetos).
import { z } from "zod";

import type { Translations } from "@/lib/content/translations";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { dashboard } from "@/lib/i18n/messages/dashboard";

const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Aceita "aaaa-mm" e também "mm/aaaa" (como o campo exibe), sempre gravando "aaaa-mm". */
const month = (message: string) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.trim().replace(/^(\d{2})\/(\d{4})$/, "$2-$1") : value),
    z.string().regex(monthRegex, message),
  );

const httpsUrl = (invalid: string, httpsOnly: string) =>
  z
    .string()
    .trim()
    .max(2048)
    .url(invalid)
    .refine((value) => value.startsWith("https://"), httpsOnly);

/** Campos de formulário vazios chegam como "" — tratamos como ausentes. */
const optional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

// ─── Trajetória ───────────────────────────────────────────────────────────────

export const JOURNEY_KINDS = ["work", "education", "certificate"] as const;
export type JourneyKind = (typeof JOURNEY_KINDS)[number];

/** Mensagens de erro no idioma de quem edita (o painel também é traduzido). */
export function createJourneySchema(locale: Locale = DEFAULT_LOCALE) {
  const v = dashboard[locale].journey.validation;
  return z
    .object({
      kind: z.enum(JOURNEY_KINDS, { message: v.kind }),
      title: z.string().trim().min(2, v.title).max(120),
      organization: z.string().trim().min(2, v.organization).max(120),
      description: z.string().trim().min(10, v.description).max(1200),
      startDate: month(v.start),
      endDate: optional(month(v.end)),
      link: optional(httpsUrl(v.url, v.https)),
      imageAlt: optional(z.string().trim().max(160)),
    })
    .refine((data) => !data.endDate || data.endDate >= data.startDate, {
      path: ["endDate"],
      message: v.endBeforeStart,
    });
}

export type JourneyInput = z.infer<ReturnType<typeof createJourneySchema>>;

/** Campos da trajetória que podem ser traduzidos no painel */
export const JOURNEY_TRANSLATABLE = { title: 120, organization: 120, description: 1200, imageAlt: 160 } as const;

export type JourneyItem = JourneyInput & {
  id: string;
  translations?: Translations<Pick<JourneyInput, keyof typeof JOURNEY_TRANSLATABLE>>;
  imageUrl?: string;
  imagePath?: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Blog ─────────────────────────────────────────────────────────────────────

export function createPostSchema(locale: Locale = DEFAULT_LOCALE) {
  const v = dashboard[locale].blog.validation;
  return z.object({
    title: z.string().trim().min(3, v.title).max(140),
    excerpt: z.string().trim().min(10, v.excerpt).max(300),
    content: z.string().trim().min(20, v.content).max(50_000),
    tags: z
      .string()
      .max(200)
      .transform((value) =>
        [...new Set(value.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 8)
      ),
    published: z.preprocess((value) => value === "on" || value === true, z.boolean()),
    coverAlt: optional(z.string().trim().max(160)),
  });
}

export type PostInput = z.infer<ReturnType<typeof createPostSchema>>;

export const POST_TRANSLATABLE = { title: 140, excerpt: 300, content: 50_000, coverAlt: 160 } as const;

export type Post = PostInput & {
  id: string;
  translations?: Translations<Pick<PostInput, keyof typeof POST_TRANSLATABLE>>;
  slug: string;
  coverUrl?: string;
  coverPath?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

/** "Olá, Mundo!" → "ola-mundo" */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80);

// ─── Projetos ─────────────────────────────────────────────────────────────────

export const MAX_PROJECT_IMAGES = 4;

export type ProjectImage = { url: string; path: string };

export function createProjectSchema(locale: Locale = DEFAULT_LOCALE) {
  const v = dashboard[locale].projects.validation;
  return z.object({
    title: z.string().trim().min(2, v.title).max(80),
    summary: z.string().trim().min(10, v.summary).max(400),
    tags: z
      .string()
      .max(300)
      .transform((value) => [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))].slice(0, 8)),
    repoUrl: optional(httpsUrl(v.url, v.https)),
    demoUrl: optional(httpsUrl(v.url, v.https)),
    imageAlt: optional(z.string().trim().max(160)),
    order: z.coerce.number().int(v.integer).min(0, v.min).max(99, v.max).default(0),
    published: z.preprocess((value) => value === "on" || value === true, z.boolean()),
  });
}

export type ProjectInput = z.infer<ReturnType<typeof createProjectSchema>>;

export const PROJECT_TRANSLATABLE = { title: 80, summary: 400, imageAlt: 160 } as const;

export type Project = ProjectInput & {
  id: string;
  translations?: Translations<Pick<ProjectInput, keyof typeof PROJECT_TRANSLATABLE>>;
  images: ProjectImage[];
  createdAt: string;
  updatedAt: string;
};

// ─── Formulários ──────────────────────────────────────────────────────────────

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  /** Valores enviados, para repreencher o formulário após erro (o React reseta o form). */
  values?: Record<string, string>;
};

export const initialFormState: FormState = { status: "idle" };
