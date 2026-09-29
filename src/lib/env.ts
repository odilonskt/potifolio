// lib/env.ts
// Variáveis de ambiente — SÓ servidor. Nada aqui usa o prefixo NEXT_PUBLIC_, então
// nenhum valor é embutido no JavaScript enviado ao navegador.
import "server-only";

import { z } from "zod";

const envSchema = z.object({
  // Firebase (Admin SDK + API REST de login)
  FIREBASE_API_KEY: z.string().min(1),
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_STORAGE_BUCKET: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
  FIREBASE_PRIVATE_KEY: z.string().min(1).optional(),
  ADMIN_EMAILS: z.string().optional(),

  // GitHub
  GITHUB_API_URL: z.string().url().default("https://api.github.com"),
  GITHUB_USERNAME: z.string().min(1),
  GITHUB_TOKEN: z.string().min(1).optional(),
});

// Strings vazias ("VAR=") contam como ausentes
const clean = (value: string | undefined) => (value?.trim() ? value : undefined);

export const env = envSchema.parse({
  FIREBASE_API_KEY: clean(process.env.FIREBASE_API_KEY),
  FIREBASE_PROJECT_ID: clean(process.env.FIREBASE_PROJECT_ID),
  FIREBASE_STORAGE_BUCKET: clean(process.env.FIREBASE_STORAGE_BUCKET),
  FIREBASE_CLIENT_EMAIL: clean(process.env.FIREBASE_CLIENT_EMAIL),
  FIREBASE_PRIVATE_KEY: clean(process.env.FIREBASE_PRIVATE_KEY),
  ADMIN_EMAILS: clean(process.env.ADMIN_EMAILS),
  GITHUB_API_URL: clean(process.env.GITHUB_API_URL),
  GITHUB_USERNAME: clean(process.env.GITHUB_USERNAME),
  GITHUB_TOKEN: clean(process.env.GITHUB_TOKEN),
});

export type Env = z.infer<typeof envSchema>;
