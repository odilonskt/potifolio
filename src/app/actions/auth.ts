"use server";

import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export type LoginFormState = {
  message: string;
  error?: {
    email?: string[];
    password?: string[];
  };
  success?: boolean;
};

export async function loginAction(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  try {
    // Validação com Zod
    const validatedFields = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!validatedFields.success) {
      return {
        message: "Por favor, corrija os erros abaixo.",
        error: validatedFields.error.flatten().fieldErrors,
        success: false,
      };
    }

    const { email, password } = validatedFields.data;

    // Autenticação com Firebase
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Obter token de ID
    const token = await userCredential.user.getIdToken();

    // Salvar o token em cookies (httpOnly para segurança)
    const cookiesStore = await cookies();
    cookiesStore.set({
      name: "session",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
    });

    return {
      message: "Login realizado com sucesso!",
      success: true,
    };
  } catch (error: unknown) {
    let errorMessage = "Erro ao fazer login";

    if (error instanceof Error && "code" in error) {
      const firebaseError = error as { code: string };
      if (firebaseError.code === "auth/invalid-credential") {
        errorMessage = "Credenciais inválidas";
      } else if (firebaseError.code === "auth/user-not-found") {
        errorMessage = "Usuário não encontrado";
      } else if (firebaseError.code === "auth/wrong-password") {
        errorMessage = "Senha incorreta";
      } else if (firebaseError.code === "auth/too-many-requests") {
        errorMessage = "Muitas tentativas. Tente novamente mais tarde";
      } else if (firebaseError.code === "auth/invalid-email") {
        errorMessage = "Email inválido";
      }
    }

    return {
      message: errorMessage,
      success: false,
    };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  return {
    authenticated: !!session?.value,
    token: session?.value || null,
  };
}
