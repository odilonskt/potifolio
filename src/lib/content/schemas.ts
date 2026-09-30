// lib/content/schemas.ts
// Validação dos conteúdos gerenciados pelo painel (trajetória, blog e projetos).
import { z } from "zod";

const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;

const httpsUrl = z
  .string()
  .trim()
  .max(2048)
  .url("URL inválida")
  .refine((value) => value.startsWith("https://"), "Use um link https://");

/** Campos de formulário vazios chegam como "" — tratamos como ausentes. */
const optional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

// ─── Trajetória ───────────────────────────────────────────────────────────────

export const JOURNEY_KINDS = ["work", "education", "certificate"] as const;
export type JourneyKind = (typeof JOURNEY_KINDS)[number];

export const JOURNEY_KIND_LABELS: Record<JourneyKind, string> = {
  work: "Carreira",
  education: "Estudos",
  certificate: "Certificados",
};

export const journeyInputSchema = z
  .object({
    kind: z.enum(JOURNEY_KINDS, { message: "Escolha um tipo" }),
    title: z.string().trim().min(2, "Informe o nome").max(120),
    organization: z.string().trim().min(2, "Informe a instituição ou empresa").max(120),
    description: z.string().trim().min(10, "Escreva ao menos 10 caracteres").max(1200),
    startDate: z.string().regex(monthRegex, "Informe o mês de início"),
    endDate: optional(z.string().regex(monthRegex, "Mês de término inválido")),
    link: optional(httpsUrl),
    imageAlt: optional(z.string().trim().max(160)),
  })
  .refine((data) => !data.endDate || data.endDate >= data.startDate, {
    path: ["endDate"],
    message: "O término deve ser depois do início",
  });

export type JourneyInput = z.infer<typeof journeyInputSchema>;

export type JourneyItem = JourneyInput & {
  id: string;
  imageUrl?: string;
  imagePath?: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Blog ─────────────────────────────────────────────────────────────────────

export const postInputSchema = z.object({
  title: z.string().trim().min(3, "Informe o título").max(140),
  excerpt: z.string().trim().min(10, "Escreva um resumo de ao menos 10 caracteres").max(300),
  content: z.string().trim().min(20, "Escreva o conteúdo do post").max(50_000),
  tags: z
    .string()
    .max(200)
    .transform((value) =>
      [...new Set(value.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 8)
    ),
  published: z.preprocess((value) => value === "on" || value === true, z.boolean()),
  coverAlt: optional(z.string().trim().max(160)),
});

export type PostInput = z.infer<typeof postInputSchema>;

export type Post = PostInput & {
  id: string;
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

export const projectInputSchema = z.object({
  title: z.string().trim().min(2, "Informe o nome do projeto").max(80),
  summary: z.string().trim().min(10, "Escreva um resumo de ao menos 10 caracteres").max(400),
  tags: z
    .string()
    .max(300)
    .transform((value) => [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))].slice(0, 8)),
  repoUrl: optional(httpsUrl),
  demoUrl: optional(httpsUrl),
  imageAlt: optional(z.string().trim().max(160)),
  order: z.coerce.number().int("Use um número inteiro").min(0, "Mínimo 0").max(99, "Máximo 99").default(0),
  published: z.preprocess((value) => value === "on" || value === true, z.boolean()),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;

export type Project = ProjectInput & {
  id: string;
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
