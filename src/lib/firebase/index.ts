import { addDoc, serverTimestamp } from "firebase/firestore";
import { contactCollection } from "../firebase";
import { ContactFormData } from "../schemas/contact-form";

export async function saveContactForm(data: ContactFormData) {
  try {
    console.log("📝 Tentando salvar no Firestore...");
    console.log("📁 Coleção:", "contacts");
    console.log("📄 Dados:", data);

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

    console.log("✅ Salvo com ID:", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    // Tipar o error corretamente
    const err = error as Error & { code?: string };

    console.error("❌ Erro ao salvar no Firestore:", err);
    console.error("❌ Detalhes do erro:", {
      name: err.name,
      message: err.message,
      code: err.code || "N/A",
      stack: err.stack,
    });

    return { success: false, error: err };
  }
}
