//lib/firebase/schemas/firebase.ts

import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { ContactFormData } from "./schemas/contact-form";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const contactCollection = collection(db, "contacts");

export async function saveContactForm(data: ContactFormData) {
  try {
    const docRef = await addDoc(contactCollection, {
      // Campos obrigatórios do formulário
      nome: data.nome,
      email: data.email,
      telefone: data.telefone || "",
      message: data.message,
      subject: data.subject,

      // Campos adicionais
      create: data.create || new Date().toISOString(),
      id: data.id || "", // Ou gerar um ID se necessário
      lidor: data.lidor || false,
      update: data.update || "",

      // Campos do sistema
      createdAt: serverTimestamp(),
      read: false,
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Erro ao salvar formulário:", error);
    return { success: false, error };
  }
}

export async function checkDuplicateSubmission(
  email: string,
  timeWindow: number = 3600000
) {
  const q = query(
    contactCollection,
    where("email", "==", email),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const lastSubmission = querySnapshot.docs[0].data();
    const lastSubmissionTime = lastSubmission.createdAt?.toDate().getTime();
    const currentTime = Date.now();

    if (lastSubmissionTime && currentTime - lastSubmissionTime < timeWindow) {
      return true;
    }
  }
  return false;
}

// Analytics apenas no cliente
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;
