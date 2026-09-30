// lib/content/repository.ts
// Leitura e escrita da trajetória, do blog, dos projetos e do currículo no Firestore (via Admin SDK, só no servidor).
// Leituras públicas usam cache com tag; as server actions invalidam com updateTag().
import "server-only";

import type { DocumentSnapshot } from "firebase-admin/firestore";
import { unstable_cache } from "next/cache";

import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { RESUME_SEED, type Resume } from "@/lib/content/resume";
import type { Locale } from "@/lib/i18n/config";
import type { JourneyItem, Post, Project } from "@/lib/content/schemas";

export const JOURNEY_COLLECTION = "journey";
export const POSTS_COLLECTION = "posts";
export const JOURNEY_TAG = "journey";
export const POSTS_TAG = "posts";
export const PROJECTS_COLLECTION = "projects";
export const PROJECTS_TAG = "projects";
export const RESUME_TAG = "resume";
/** Um único currículo: coleção "resume", documento "main" */
export const RESUME_DOC = { collection: "resume", id: "main" } as const;

const REVALIDATE_SECONDS = 3600;

type WithId<T> = T & { id: string };

function mapDoc<T>(doc: DocumentSnapshot): WithId<T> {
  return { id: doc.id, ...(doc.data() as T) };
}

/** Itens atuais (sem término) primeiro; depois do mais recente para o mais antigo. */
function sortJourney(items: JourneyItem[]): JourneyItem[] {
  return [...items].sort((a, b) => {
    if (!a.endDate !== !b.endDate) return a.endDate ? 1 : -1;
    return b.startDate.localeCompare(a.startDate);
  });
}

function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) =>
    (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt)
  );
}

// ─── Trajetória ───────────────────────────────────────────────────────────────

export async function listJourneyUncached(): Promise<JourneyItem[]> {
  const snapshot = await adminDb().collection(JOURNEY_COLLECTION).get();
  return sortJourney(snapshot.docs.map((doc) => mapDoc<JourneyItem>(doc)));
}

const listJourneyCached = unstable_cache(listJourneyUncached, ["journey:list"], {
  tags: [JOURNEY_TAG],
  revalidate: REVALIDATE_SECONDS,
});

/** Para páginas públicas: nunca quebra a página; em erro devolve lista vazia (erros não são cacheados). */
export async function getJourney(): Promise<JourneyItem[]> {
  if (!isAdminConfigured()) return [];
  try {
    return await listJourneyCached();
  } catch (error) {
    console.error("Erro ao carregar trajetória:", error);
    return [];
  }
}

export async function getJourneyItem(id: string): Promise<JourneyItem | null> {
  const doc = await adminDb().collection(JOURNEY_COLLECTION).doc(id).get();
  return doc.exists ? mapDoc<JourneyItem>(doc) : null;
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export async function listAllPostsUncached(): Promise<Post[]> {
  const snapshot = await adminDb().collection(POSTS_COLLECTION).get();
  return sortPosts(snapshot.docs.map((doc) => mapDoc<Post>(doc)));
}

const listPublishedCached = unstable_cache(
  async (): Promise<Post[]> => {
    const snapshot = await adminDb()
      .collection(POSTS_COLLECTION)
      .where("published", "==", true)
      .get();
    return sortPosts(snapshot.docs.map((doc) => mapDoc<Post>(doc)));
  },
  ["posts:published"],
  { tags: [POSTS_TAG], revalidate: REVALIDATE_SECONDS }
);

export async function getPublishedPosts(): Promise<Post[]> {
  if (!isAdminConfigured()) return [];
  try {
    return await listPublishedCached();
  } catch (error) {
    console.error("Erro ao carregar posts:", error);
    return [];
  }
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getPublishedPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getPost(id: string): Promise<Post | null> {
  const doc = await adminDb().collection(POSTS_COLLECTION).doc(id).get();
  return doc.exists ? mapDoc<Post>(doc) : null;
}

/** Garante slug único acrescentando -2, -3... */
export async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const root = base || "post";
  for (let attempt = 1; attempt < 50; attempt++) {
    const candidate = attempt === 1 ? root : `${root}-${attempt}`;
    const snapshot = await adminDb()
      .collection(POSTS_COLLECTION)
      .where("slug", "==", candidate)
      .limit(2)
      .get();
    if (snapshot.docs.every((doc) => doc.id === ignoreId)) return candidate;
  }
  return `${root}-${Date.now()}`;
}

// ─── Projetos ─────────────────────────────────────────────────────────────────

/** Documentos antigos ou sem imagem podem não ter o campo "images". */
function toProject(doc: DocumentSnapshot): Project {
  const project = mapDoc<Project>(doc);
  return { ...project, images: project.images ?? [] };
}

/** Menor "ordem" primeiro; empate, o mais novo primeiro. */
function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => a.order - b.order || b.createdAt.localeCompare(a.createdAt));
}

export async function listProjectsUncached(): Promise<Project[]> {
  const snapshot = await adminDb().collection(PROJECTS_COLLECTION).get();
  return sortProjects(snapshot.docs.map(toProject));
}

const listPublishedProjectsCached = unstable_cache(
  async (): Promise<Project[]> => (await listProjectsUncached()).filter((project) => project.published),
  ["projects:published"],
  { tags: [PROJECTS_TAG], revalidate: REVALIDATE_SECONDS },
);

/** Para a home: nunca quebra a página; em erro devolve lista vazia. */
export async function getPublishedProjects(): Promise<Project[]> {
  if (!isAdminConfigured()) return [];
  try {
    return await listPublishedProjectsCached();
  } catch (error) {
    console.error("Erro ao carregar projetos:", error);
    return [];
  }
}

export async function getProject(id: string): Promise<Project | null> {
  const doc = await adminDb().collection(PROJECTS_COLLECTION).doc(id).get();
  return doc.exists ? toProject(doc) : null;
}

// ─── Currículo ────────────────────────────────────────────────────────────────
// Um documento por idioma; a versão em português controla a publicação e serve de
// alternativa quando o idioma ainda não foi salvo.

const RESUME_DOC_IDS: Record<Locale, string> = { pt: RESUME_DOC.id, en: "en", es: "es" };
const resumeRef = (locale: Locale) => adminDb().collection(RESUME_DOC.collection).doc(RESUME_DOC_IDS[locale]);

/** Para o painel: null enquanto a versão desse idioma nunca foi salva. */
export async function getResumeUncached(locale: Locale = "pt"): Promise<Resume | null> {
  const doc = await resumeRef(locale).get();
  return doc.exists ? (doc.data() as Resume) : null;
}

const getResumeCached = unstable_cache(getResumeUncached, ["resume"], {
  tags: [RESUME_TAG],
  revalidate: REVALIDATE_SECONDS,
});

/**
 * Para páginas públicas: currículo publicado no idioma pedido ou, se ainda não houver
 * essa versão, em português (`locale` diz qual veio). Em erro, null.
 */
export async function getPublishedResume(locale: Locale = "pt"): Promise<{ resume: Resume; locale: Locale } | null> {
  if (!isAdminConfigured()) return null;
  try {
    const base = await getResumeCached("pt");
    if (!base?.published) return null;
    const translated = locale === "pt" ? null : await getResumeCached(locale);
    return translated ? { resume: { ...translated, published: true }, locale } : { resume: base, locale: "pt" };
  } catch (error) {
    console.error("Erro ao carregar currículo:", error);
    return null;
  }
}

export async function saveResume(resume: Resume, locale: Locale = "pt"): Promise<void> {
  // O Firestore recusa undefined, inclusive dentro das listas: o JSON descarta esses campos
  await resumeRef(locale).set(JSON.parse(JSON.stringify(resume)));
}

/**
 * Rascunho do painel para um idioma: a versão salva ou, se ainda não existe, o
 * conteúdo inicial traduzido com o contato e a publicação da versão em português.
 */
export async function getResumeDraft(locale: Locale): Promise<{ resume: Resume; saved: boolean }> {
  const [own, base] = await Promise.all([getResumeUncached(locale), locale === "pt" ? null : getResumeUncached("pt")]);
  if (own) return { resume: own, saved: true };
  const fallback = locale === "pt" ? RESUME_SEED.pt : { ...RESUME_SEED[locale], email: base?.email ?? "", phone: base?.phone ?? "", location: base?.location, published: base?.published ?? false };
  return { resume: fallback, saved: false };
}
