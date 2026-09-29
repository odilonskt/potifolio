// lib/firebase-contacts.ts
// Contatos recebidos pelo formulário. Acesso só pelo servidor (Firebase Admin), o que
// permite bloquear a coleção "contacts" para qualquer cliente nas regras do Firestore.
import "server-only";

import { FieldValue, Timestamp, type DocumentSnapshot } from "firebase-admin/firestore";

import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import type { ContactFormData } from "@/lib/schemas/contact-form";

export interface Contact {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  /** IP do envio (prevenção de spam/abuso). Só aparece no painel. */
  ip?: string;
  message: string;
  subject: string;
  read: boolean;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

const CONTACTS_COLLECTION = "contacts";
const contacts = () => adminDb().collection(CONTACTS_COLLECTION);

/** Aceita Timestamp do Firestore (documentos antigos) ou string ISO. */
function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string" && !Number.isNaN(Date.parse(value))) return value;
  return new Date(0).toISOString();
}

function toContact(doc: DocumentSnapshot): Contact {
  const data = doc.data() ?? {};
  return {
    id: doc.id,
    nome: String(data.nome ?? ""),
    email: String(data.email ?? ""),
    telefone: data.telefone ? String(data.telefone) : undefined,
    ip: typeof data.ip === "string" ? data.ip : undefined,
    message: String(data.message ?? ""),
    subject: String(data.subject ?? ""),
    read: Boolean(data.read),
    createdAt: toIso(data.createdAt ?? data.create),
  };
}

async function run<T>(label: string, task: () => Promise<T>): Promise<ApiResponse<T>> {
  if (!isAdminConfigured()) return { success: false, error: "Serviço indisponível" };
  try {
    return { success: true, data: await task() };
  } catch (error) {
    // Detalhes só no log do servidor
    console.error(`${label}:`, error);
    return { success: false, error: label };
  }
}

export function getAllContacts(): Promise<ApiResponse<Contact[]>> {
  return run("Erro ao buscar contatos", async () => {
    const snapshot = await contacts().orderBy("createdAt", "desc").get();
    return snapshot.docs.map(toContact);
  });
}

/** `ip` já deve vir validado (ver clientIpForStorage). */
export function saveContactForm(
  data: ContactFormData,
  meta: { ip?: string } = {},
): Promise<ApiResponse<{ id: string }>> {
  return run("Erro ao salvar contato", async () => {
    // Só os campos do formulário: nada vindo do cliente define status ou datas
    const ref = await contacts().add({
      nome: data.nome,
      email: data.email,
      telefone: data.telefone || "",
      ip: meta.ip ?? null,
      subject: data.subject,
      message: data.message,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
    return { id: ref.id };
  });
}

export function updateContactReadStatus(contactId: string, read: boolean): Promise<ApiResponse> {
  return run("Erro ao atualizar contato", async () => {
    await contacts().doc(contactId).update({ read, updatedAt: FieldValue.serverTimestamp() });
  });
}

export const markAsRead = (contactId: string) => updateContactReadStatus(contactId, true);
export const markAsUnread = (contactId: string) => updateContactReadStatus(contactId, false);

export function deleteContact(contactId: string): Promise<ApiResponse> {
  return run("Erro ao deletar contato", async () => {
    await contacts().doc(contactId).delete();
  });
}
