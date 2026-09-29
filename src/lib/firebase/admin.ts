// lib/firebase/admin.ts
// Firebase Admin SDK — uso EXCLUSIVO no servidor. Ignora as regras do Firestore/Storage,
// por isso nunca deve ser importado em componentes de cliente.
import "server-only";

import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

import { env } from "@/lib/env";

const ADMIN_APP_NAME = "portfolio-admin";

function readCredentials() {
  const projectId = env.FIREBASE_PROJECT_ID;
  const clientEmail = env.FIREBASE_CLIENT_EMAIL;
  // Na Vercel/.env a chave vem com "\n" literais
  const privateKey = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) return null;
  return { projectId, clientEmail, privateKey };
}

export function isAdminConfigured(): boolean {
  return readCredentials() !== null;
}

export class AdminNotConfiguredError extends Error {
  constructor() {
    super(
      "Firebase Admin não configurado: defina FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY."
    );
    this.name = "AdminNotConfiguredError";
  }
}

function getAdminApp(): App {
  if (getApps().some((app) => app.name === ADMIN_APP_NAME)) {
    return getApp(ADMIN_APP_NAME);
  }

  const credentials = readCredentials();
  if (!credentials) throw new AdminNotConfiguredError();

  return initializeApp(
    {
      credential: cert(credentials),
      projectId: credentials.projectId,
      storageBucket: env.FIREBASE_STORAGE_BUCKET,
    },
    ADMIN_APP_NAME
  );
}

export const adminAuth = () => getAuth(getAdminApp());
export const adminDb = () => getFirestore(getAdminApp());
export const adminBucket = () => getStorage(getAdminApp()).bucket();
