// lib/content/images.ts
// Upload de imagens para o Firebase Storage com validação por assinatura binária.
import "server-only";

import { getDownloadURL } from "firebase-admin/storage";
import { randomUUID } from "node:crypto";

import { adminBucket } from "@/lib/firebase/admin";

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB

// SVG fica de fora de propósito: pode carregar scripts (XSS).
const SIGNATURES: { mime: string; ext: string; test: (b: Uint8Array) => boolean }[] = [
  { mime: "image/jpeg", ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: "image/png",
    ext: "png",
    test: (b) => [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => b[i] === v),
  },
  {
    mime: "image/webp",
    ext: "webp",
    test: (b) =>
      String.fromCharCode(...b.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...b.slice(8, 12)) === "WEBP",
  },
  {
    mime: "image/avif",
    ext: "avif",
    test: (b) => String.fromCharCode(...b.slice(4, 12)) === "ftypavif",
  },
];

export type ImageValidation =
  | { ok: true; file: File | null }
  | { ok: false; error: string };

/** Aceita campo vazio (nenhuma imagem nova) ou uma imagem válida. */
export function readImageField(value: FormDataEntryValue | null): ImageValidation {
  if (!value || typeof value === "string" || value.size === 0) {
    return { ok: true, file: null };
  }
  if (value.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "A imagem deve ter no máximo 2 MB" };
  }
  return { ok: true, file: value };
}

export async function uploadImage(
  file: File,
  folder: "journey" | "posts" | "projects"
): Promise<{ url: string; path: string }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = SIGNATURES.find((signature) => signature.test(bytes));
  if (!kind) {
    throw new InvalidImageError("Formato não suportado. Use JPG, PNG, WebP ou AVIF.");
  }

  const path = `uploads/${folder}/${randomUUID()}.${kind.ext}`;
  const storageFile = adminBucket().file(path);

  await storageFile.save(Buffer.from(bytes), {
    resumable: false,
    contentType: kind.mime, // tipo detectado, nunca o informado pelo navegador
    metadata: { cacheControl: "public, max-age=31536000, immutable" },
  });

  return { url: await getDownloadURL(storageFile), path };
}

export async function deleteImage(path: string | undefined): Promise<void> {
  if (!path?.startsWith("uploads/")) return;
  try {
    await adminBucket().file(path).delete({ ignoreNotFound: true });
  } catch (error) {
    console.error("Erro ao remover imagem:", error);
  }
}

export class InvalidImageError extends Error {}
