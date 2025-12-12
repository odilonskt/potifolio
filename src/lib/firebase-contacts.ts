// lib/firebase-contacts.ts
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Contact {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  message: string;
  subject: string;
  read: boolean;
  createdAt: string;
  create: string;
  lidor: boolean;
  update?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Stats {
  total: number;
  read: number;
  unread: number;
  percentageChange: number;
}

const CONTACTS_COLLECTION = "contacts";

// Helper function to safely extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// 1. GET - Lista todos os contatos
export async function getAllContacts(): Promise<ApiResponse<Contact[]>> {
  try {
    const contactsRef = collection(db, CONTACTS_COLLECTION);
    const q = query(contactsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const contacts: Contact[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      contacts.push({
        id: doc.id,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        message: data.message,
        subject: data.subject,
        read: data.read || false,
        createdAt:
          data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        create: data.create,
        lidor: data.lidor || false,
        update: data.update,
      });
    });

    return { success: true, data: contacts };
  } catch (error: unknown) {
    console.error("Erro ao buscar contatos:", error);
    return {
      success: false,
      error: getErrorMessage(error) || "Erro ao buscar contatos",
    };
  }
}

// 2. GET - Lista contatos lidos
export async function getReadContacts(): Promise<ApiResponse<Contact[]>> {
  try {
    const contactsRef = collection(db, CONTACTS_COLLECTION);
    const q = query(
      contactsRef,
      where("read", "==", true),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    const contacts: Contact[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      contacts.push({
        id: doc.id,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        message: data.message,
        subject: data.subject,
        read: true,
        createdAt:
          data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        create: data.create,
        lidor: data.lidor || false,
        update: data.update,
      });
    });

    return { success: true, data: contacts };
  } catch (error: unknown) {
    console.error("Erro ao buscar contatos lidos:", error);
    return {
      success: false,
      error: getErrorMessage(error) || "Erro ao buscar contatos lidos",
    };
  }
}

// 3. GET - Lista contatos não lidos
export async function getUnreadContacts(): Promise<ApiResponse<Contact[]>> {
  try {
    const contactsRef = collection(db, CONTACTS_COLLECTION);
    const q = query(
      contactsRef,
      where("read", "==", false),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    const contacts: Contact[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      contacts.push({
        id: doc.id,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        message: data.message,
        subject: data.subject,
        read: false,
        createdAt:
          data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        create: data.create,
        lidor: data.lidor || false,
        update: data.update,
      });
    });

    return { success: true, data: contacts };
  } catch (error: unknown) {
    console.error("Erro ao buscar contatos não lidos:", error);
    return {
      success: false,
      error: getErrorMessage(error) || "Erro ao buscar contatos não lidos",
    };
  }
}

// 4. POST - Cliente preenche formulário de contato (existe no seu firebase.ts)
// Usando a função saveContactForm que você já tem

// 5. POST - Login do admin (já existe no firebase-auth.ts)

// 6. PATCH - Atualizar status de leitura (marcar como lido/não lido)
export async function updateContactReadStatus(
  contactId: string,
  read: boolean
): Promise<ApiResponse> {
  try {
    const contactRef = doc(db, CONTACTS_COLLECTION, contactId);

    await updateDoc(contactRef, {
      read,
      update: new Date().toISOString(),
      lidor: read,
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Erro ao atualizar contato:", error);
    return {
      success: false,
      error: getErrorMessage(error) || "Erro ao atualizar contato",
    };
  }
}

// 7. PATCH - Marcar como lido (alias)
export async function markAsRead(contactId: string): Promise<ApiResponse> {
  return updateContactReadStatus(contactId, true);
}

// 8. PATCH - Marcar como não lido (alias)
export async function markAsUnread(contactId: string): Promise<ApiResponse> {
  return updateContactReadStatus(contactId, false);
}

// 9. DELETE - Deletar contato
export async function deleteContact(contactId: string): Promise<ApiResponse> {
  try {
    const contactRef = doc(db, CONTACTS_COLLECTION, contactId);
    await deleteDoc(contactRef);

    return { success: true };
  } catch (error: unknown) {
    console.error("Erro ao deletar contato:", error);
    return {
      success: false,
      error: getErrorMessage(error) || "Erro ao deletar contato",
    };
  }
}

// Função para obter estatísticas
export async function getContactsStats(): Promise<ApiResponse<Stats>> {
  try {
    const [allResponse, readResponse, unreadResponse] = await Promise.all([
      getAllContacts(),
      getReadContacts(),
      getUnreadContacts(),
    ]);

    if (
      !allResponse.success ||
      !readResponse.success ||
      !unreadResponse.success
    ) {
      return {
        success: false,
        error: "Erro ao buscar estatísticas",
      };
    }

    const total = allResponse.data?.length || 0;
    const read = readResponse.data?.length || 0;
    const unread = unreadResponse.data?.length || 0;

    // Cálculo simples de porcentagem
    const percentageChange =
      total > 0 ? Math.round((read / total) * 100) - 75 : 0;

    return {
      success: true,
      data: { total, read, unread, percentageChange },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error) || "Erro ao buscar estatísticas",
    };
  }
}

// Função para buscar um contato por ID
export async function getContactById(
  contactId: string
): Promise<ApiResponse<Contact>> {
  try {
    // Como não temos uma função getDoc no seu setup, vamos filtrar da lista
    const response = await getAllContacts();

    if (!response.success || !response.data) {
      return {
        success: false,
        error: "Erro ao buscar contato",
      };
    }

    const contact = response.data.find((c) => c.id === contactId);

    if (!contact) {
      return {
        success: false,
        error: "Contato não encontrado",
      };
    }

    return {
      success: true,
      data: contact,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error) || "Erro ao buscar contato",
    };
  }
}
