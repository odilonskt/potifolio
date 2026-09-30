"use server";

// Server actions do painel. Cada uma é um endpoint público, então TODAS
// verificam a sessão de admin e validam a entrada antes de tocar no banco.

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/session";
import { deleteImage, InvalidImageError, readImageField, uploadImage } from "@/lib/content/images";
import {
  getJourneyItem,
  getPost,
  getProject,
  JOURNEY_COLLECTION,
  JOURNEY_TAG,
  POSTS_COLLECTION,
  POSTS_TAG,
  PROJECTS_COLLECTION,
  PROJECTS_TAG,
  uniqueSlug,
} from "@/lib/content/repository";
import {
  journeyInputSchema,
  MAX_PROJECT_IMAGES,
  postInputSchema,
  projectInputSchema,
  type ProjectImage,
  slugify,
  type FormState,
} from "@/lib/content/schemas";
import { adminDb } from "@/lib/firebase/admin";
import { rateLimit } from "@/lib/security/request-guard";

// ─── Limite de tentativas ─────────────────────────────────────────────────────
// Mesmo com login de admin: protege contra script em loop ou sessão roubada
// (cada "salvar" pode enviar uma imagem de até 2 MB para o Storage).
const LIMITS = {
  save: { limit: 20, windowMs: 60_000 },
  delete: { limit: 30, windowMs: 60_000 },
} as const;

const RATE_LIMITED_MESSAGE = "Muitas ações seguidas. Aguarde um minuto e tente de novo.";

function isRateLimited(uid: string, kind: keyof typeof LIMITS): boolean {
  const { limit, windowMs } = LIMITS[kind];
  return !rateLimit(`dashboard:${kind}:${uid}`, limit, windowMs).allowed;
}

const docIdSchema = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);

function readId(formData: FormData): string | null {
  const parsed = docIdSchema.safeParse(formData.get("id"));
  return parsed.success ? parsed.data : null;
}

/** Campos de texto enviados (sem arquivos), para repreencher o formulário. */
function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string" && !key.startsWith("$ACTION")) values[key] = value;
  });
  return values;
}

function errorState(formData: FormData, state: Omit<FormState, "status" | "values">): FormState {
  return { status: "error", values: formValues(formData), ...state };
}

function validationError(formData: FormData, error: z.ZodError): FormState {
  return errorState(formData, {
    message: "Revise os campos destacados.",
    fieldErrors: error.flatten().fieldErrors as FormState["fieldErrors"],
  });
}

/** Remove chaves undefined (o Firestore rejeita undefined). */
function clean<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) as Partial<T>;
}

// ─── Trajetória ───────────────────────────────────────────────────────────────

export async function saveJourneyAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { uid } = await requireAdmin();
  if (isRateLimited(uid, "save")) return errorState(formData, { message: RATE_LIMITED_MESSAGE });

  const parsed = journeyInputSchema.safeParse({
    kind: formData.get("kind"),
    title: formData.get("title"),
    organization: formData.get("organization"),
    description: formData.get("description"),
    startDate: formData.get("startDate"),
    endDate: formData.get("current") === "on" ? "" : formData.get("endDate"),
    link: formData.get("link"),
    imageAlt: formData.get("imageAlt"),
  });
  if (!parsed.success) return validationError(formData, parsed.error);

  const image = readImageField(formData.get("image"));
  if (!image.ok) return errorState(formData, { fieldErrors: { image: [image.error] } });

  const id = readId(formData);
  const existing = id ? await getJourneyItem(id) : null;
  if (id && !existing) return errorState(formData, { message: "Item não encontrado." });

  try {
    const now = new Date().toISOString();
    let imageFields: { imageUrl?: string | null; imagePath?: string | null } = {};

    if (image.file) {
      const uploaded = await uploadImage(image.file, "journey");
      imageFields = { imageUrl: uploaded.url, imagePath: uploaded.path };
      await deleteImage(existing?.imagePath);
    } else if (formData.get("removeImage") === "on" && existing?.imagePath) {
      imageFields = { imageUrl: null, imagePath: null };
      await deleteImage(existing.imagePath);
    }

    const data = {
      ...parsed.data,
      endDate: parsed.data.endDate ?? null,
      link: parsed.data.link ?? null,
      imageAlt: parsed.data.imageAlt ?? null,
      ...imageFields,
      updatedAt: now,
    };

    const collection = adminDb().collection(JOURNEY_COLLECTION);
    if (existing) {
      await collection.doc(existing.id).update(clean(data));
    } else {
      await collection.add(clean({ ...data, createdAt: now }));
    }
  } catch (error) {
    if (error instanceof InvalidImageError) {
      return errorState(formData, { fieldErrors: { image: [error.message] } });
    }
    console.error("Erro ao salvar item da trajetória:", error);
    return errorState(formData, { message: "Não foi possível salvar. Tente novamente." });
  }

  updateTag(JOURNEY_TAG);
  redirect("/dashboard/trajetoria?salvo=1");
}

export async function deleteJourneyAction(formData: FormData): Promise<void> {
  const { uid } = await requireAdmin();
  if (isRateLimited(uid, "delete")) return;
  const id = readId(formData);
  if (!id) return;

  const existing = await getJourneyItem(id);
  if (!existing) return;

  await adminDb().collection(JOURNEY_COLLECTION).doc(id).delete();
  await deleteImage(existing.imagePath);
  updateTag(JOURNEY_TAG);
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export async function savePostAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { uid } = await requireAdmin();
  if (isRateLimited(uid, "save")) return errorState(formData, { message: RATE_LIMITED_MESSAGE });

  const parsed = postInputSchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    tags: formData.get("tags") ?? "",
    published: formData.get("published"),
    coverAlt: formData.get("coverAlt"),
  });
  if (!parsed.success) return validationError(formData, parsed.error);

  const cover = readImageField(formData.get("cover"));
  if (!cover.ok) return errorState(formData, { fieldErrors: { cover: [cover.error] } });

  const id = readId(formData);
  const existing = id ? await getPost(id) : null;
  if (id && !existing) return errorState(formData, { message: "Post não encontrado." });

  try {
    const now = new Date().toISOString();
    let coverFields: { coverUrl?: string | null; coverPath?: string | null } = {};

    if (cover.file) {
      const uploaded = await uploadImage(cover.file, "posts");
      coverFields = { coverUrl: uploaded.url, coverPath: uploaded.path };
      await deleteImage(existing?.coverPath);
    } else if (formData.get("removeCover") === "on" && existing?.coverPath) {
      coverFields = { coverUrl: null, coverPath: null };
      await deleteImage(existing.coverPath);
    }

    const data = {
      ...parsed.data,
      coverAlt: parsed.data.coverAlt ?? null,
      ...coverFields,
      // Primeira publicação define a data; despublicar mantém o histórico
      publishedAt: parsed.data.published ? (existing?.publishedAt ?? now) : (existing?.publishedAt ?? null),
      updatedAt: now,
    };

    const collection = adminDb().collection(POSTS_COLLECTION);
    if (existing) {
      // Slug estável depois de criado, para não quebrar links compartilhados
      await collection.doc(existing.id).update(clean(data));
    } else {
      const slug = await uniqueSlug(slugify(parsed.data.title));
      await collection.add(clean({ ...data, slug, createdAt: now }));
    }
  } catch (error) {
    if (error instanceof InvalidImageError) {
      return errorState(formData, { fieldErrors: { cover: [error.message] } });
    }
    console.error("Erro ao salvar post:", error);
    return errorState(formData, { message: "Não foi possível salvar. Tente novamente." });
  }

  updateTag(POSTS_TAG);
  redirect("/dashboard/blog?salvo=1");
}

export async function deletePostAction(formData: FormData): Promise<void> {
  const { uid } = await requireAdmin();
  if (isRateLimited(uid, "delete")) return;
  const id = readId(formData);
  if (!id) return;

  const existing = await getPost(id);
  if (!existing) return;

  await adminDb().collection(POSTS_COLLECTION).doc(id).delete();
  await deleteImage(existing.coverPath);
  updateTag(POSTS_TAG);
}

// ─── Projetos ─────────────────────────────────────────────────────────────────

const MAX_UPLOAD_BYTES_PER_SAVE = 4 * 1024 * 1024;

export async function saveProjectAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { uid } = await requireAdmin();
  if (isRateLimited(uid, "save")) return errorState(formData, { message: RATE_LIMITED_MESSAGE });

  const parsed = projectInputSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary"),
    tags: formData.get("tags") ?? "",
    repoUrl: formData.get("repoUrl"),
    demoUrl: formData.get("demoUrl"),
    imageAlt: formData.get("imageAlt"),
    order: formData.get("order") || 0,
    published: formData.get("published"),
  });
  if (!parsed.success) return validationError(formData, parsed.error);

  const files: File[] = [];
  for (const entry of formData.getAll("images")) {
    const image = readImageField(entry);
    if (!image.ok) return errorState(formData, { fieldErrors: { images: [image.error] } });
    if (image.file) files.push(image.file);
  }

  const id = readId(formData);
  const existing = id ? await getProject(id) : null;
  if (id && !existing) return errorState(formData, { message: "Projeto não encontrado." });

  // Só remove caminhos que já pertencem a este projeto
  const toRemove = new Set(formData.getAll("removeImages").filter((value): value is string => typeof value === "string"));
  const kept = (existing?.images ?? []).filter((image) => !toRemove.has(image.path));
  const removed = (existing?.images ?? []).filter((image) => toRemove.has(image.path));

  // Limite da Vercel: 4,5 MB por requisição, somando todos os arquivos
  if (files.reduce((total, file) => total + file.size, 0) > MAX_UPLOAD_BYTES_PER_SAVE) {
    return errorState(formData, {
      fieldErrors: { images: ["As imagens novas passam de 4 MB juntas. Envie menos de cada vez e salve de novo para adicionar o resto."] },
    });
  }
  if (kept.length + files.length > MAX_PROJECT_IMAGES) {
    return errorState(formData, {
      fieldErrors: { images: [`No máximo ${MAX_PROJECT_IMAGES} imagens por projeto. Remova alguma antes de enviar outra.`] },
    });
  }
  if (kept.length + files.length > 0 && !parsed.data.imageAlt) {
    return errorState(formData, { fieldErrors: { imageAlt: ["Descreva as imagens para quem usa leitor de tela"] } });
  }

  const uploaded: ProjectImage[] = [];
  try {
    for (const file of files) uploaded.push(await uploadImage(file, "projects"));

    const now = new Date().toISOString();
    const data = {
      ...parsed.data,
      repoUrl: parsed.data.repoUrl ?? null,
      demoUrl: parsed.data.demoUrl ?? null,
      imageAlt: parsed.data.imageAlt ?? null,
      images: [...kept, ...uploaded],
      updatedAt: now,
    };

    const collection = adminDb().collection(PROJECTS_COLLECTION);
    if (existing) {
      await collection.doc(existing.id).update(clean(data));
    } else {
      await collection.add(clean({ ...data, createdAt: now }));
    }
  } catch (error) {
    // Não deixa arquivos órfãos no Storage se o salvamento falhar
    await Promise.all(uploaded.map((image) => deleteImage(image.path)));
    if (error instanceof InvalidImageError) {
      return errorState(formData, { fieldErrors: { images: [error.message] } });
    }
    console.error("Erro ao salvar projeto:", error);
    return errorState(formData, { message: "Não foi possível salvar. Tente novamente." });
  }

  await Promise.all(removed.map((image) => deleteImage(image.path)));
  updateTag(PROJECTS_TAG);
  redirect("/dashboard/projetos?salvo=1");
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  const { uid } = await requireAdmin();
  if (isRateLimited(uid, "delete")) return;
  const id = readId(formData);
  if (!id) return;

  const existing = await getProject(id);
  if (!existing) return;

  await adminDb().collection(PROJECTS_COLLECTION).doc(id).delete();
  await Promise.all(existing.images.map((image) => deleteImage(image.path)));
  updateTag(PROJECTS_TAG);
}
