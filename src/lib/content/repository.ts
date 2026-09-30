// lib/content/repository.ts
// Leitura e escrita da trajetória, do blog e do currículo no Firestore (via Admin SDK, só no servidor).
// Leituras públicas usam cache com tag; as server actions invalidam com updateTag().
import "server-only";

import type { DocumentSnapshot } from "firebase-admin/firestore";
import { unstable_cache } from "next/cache";

import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import type { Resume } from "@/lib/content/resume";
import type { JourneyItem, Post } from "@/lib/content/schemas";

export const JOURNEY_COLLECTION = "journey";
export const POSTS_COLLECTION = "posts";
export const JOURNEY_TAG = "journey";
export const POSTS_TAG = "posts";
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

// ─── Currículo ────────────────────────────────────────────────────────────────

const resumeRef = () => adminDb().collection(RESUME_DOC.collection).doc(RESUME_DOC.id);

/** Para o painel: null enquanto o currículo nunca foi salvo. */
export async function getResumeUncached(): Promise<Resume | null> {
  const doc = await resumeRef().get();
  return doc.exists ? (doc.data() as Resume) : null;
}

const getResumeCached = unstable_cache(getResumeUncached, ["resume:main"], {
  tags: [RESUME_TAG],
  revalidate: REVALIDATE_SECONDS,
});

/** Para páginas públicas: só devolve o currículo publicado; em erro, null. */
export async function getPublishedResume(): Promise<Resume | null> {
  if (!isAdminConfigured()) return null;
  try {
    const resume = await getResumeCached();
    return resume?.published ? resume : null;
  } catch (error) {
    console.error("Erro ao carregar currículo:", error);
    return null;
  }
}

export async function saveResume(resume: Resume): Promise<void> {
  await resumeRef().set(resume);
}
