import { ContactFormData } from "../schemas/contact-form";

// Configuração vazia para evitar erros no build
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

// Função principal que só roda no RUNTIME (não no build)
export async function saveContactForm(data: ContactFormData) {
  // Esta função só será executada em runtime, não durante o build
  if (typeof window !== "undefined") {
    // Se estiver no cliente, redirecione para API
    console.warn("saveContactForm chamado no cliente. Use a API route.");
    return { success: false, error: "Use a API route no cliente" };
  }

  // Verificar se as variáveis estão disponíveis ANTES de importar
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("Variáveis do Firebase não configuradas");
    return {
      success: false,
      error: "Firebase não configurado",
    };
  }

  try {
    // IMPORTANTE: Importação dinâmica que só acontece em runtime
    const { initializeApp, getApps } = await import("firebase/app");
    const { getFirestore, collection, addDoc, serverTimestamp } = await import(
      "firebase/firestore"
    );

    // Inicializar Firebase
    let app;
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    const db = getFirestore(app);
    const contactCollection = collection(db, "contacts");

    const docRef = await addDoc(contactCollection, {
      nome: data.nome,
      email: data.email,
      telefone: data.telefone || "",
      message: data.message,
      subject: data.subject,
      create: data.create || new Date().toISOString(),
      id: data.id || "",
      lidor: data.lidor || false,
      update: data.update || "",
      createdAt: serverTimestamp(),
      read: false,
    });

    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Erro ao salvar no Firestore:", error);
    return {
      success: false,
      error: error.message || "Erro ao salvar dados",
    };
  }
}

// Função para o cliente usar
export function getFirebaseConfig() {
  return firebaseConfig;
}
