// Este arquivo SÓ deve ser usado no cliente
"use client";

import type { Analytics } from "firebase/analytics";
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { CollectionReference, Firestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;
let contactCollection: CollectionReference | null = null;

// Inicializar apenas se estiver no cliente
if (typeof window !== "undefined") {
  (async () => {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId:
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
    };

    // Verificar se as variáveis estão definidas
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
      try {
        const { initializeApp, getApps } = await import("firebase/app");
        const { getAnalytics } = await import("firebase/analytics");
        const { getAuth } = await import("firebase/auth");
        const { collection, getFirestore } = await import("firebase/firestore");
        const { getStorage } = await import("firebase/storage");

        if (!getApps().length) {
          app = initializeApp(firebaseConfig);
        } else {
          app = getApps()[0];
        }

        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        analytics = getAnalytics(app);
        contactCollection = collection(db, "contacts");
      } catch (error) {
        console.warn("Erro ao inicializar Firebase:", error);
      }
    } else {
      console.warn(
        "Firebase config não encontrada. Verifique as variáveis de ambiente."
      );
    }
  })();
}

export { analytics, app, auth, contactCollection, db, storage };
