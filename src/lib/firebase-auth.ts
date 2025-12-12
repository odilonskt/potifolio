//lib/firebase/schemas/firebase-auth.ts
import { signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { auth } from "./firebase";

// Interfaces de retorno
export interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface LogoutResult {
  success: boolean;
  error?: string;
}

export interface TokenVerificationResult {
  valid: boolean;
  uid?: string;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Interface para erros do Firebase
interface FirebaseAuthError {
  code: string;
  message: string;
  name: string;
}

// Type guard para verificar se é erro do Firebase
function isFirebaseAuthError(error: unknown): error is FirebaseAuthError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as Record<string, unknown>).code === "string" &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string" &&
    "name" in error &&
    typeof (error as Record<string, unknown>).name === "string"
  );
}

// Mapeamento de códigos de erro para mensagens amigáveis
const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Credenciais inválidas",
  "auth/user-not-found": "Usuário não encontrado",
  "auth/wrong-password": "Senha incorreta",
  "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde",
  "auth/invalid-email": "Email inválido",
  "auth/user-disabled": "Usuário desativado",
  "auth/operation-not-allowed": "Operação não permitida",
  "auth/network-request-failed": "Erro de conexão. Verifique sua internet",
} as const;

// Tipo para os códigos de erro
type FirebaseAuthErrorCode = keyof typeof ERROR_MESSAGES;

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error: unknown) {
    let errorMessage = "Erro ao fazer login";

    if (isFirebaseAuthError(error)) {
      // Verifica se o código está no nosso mapeamento
      if (error.code in ERROR_MESSAGES) {
        errorMessage = ERROR_MESSAGES[error.code as FirebaseAuthErrorCode];
      } else {
        // Usa a mensagem padrão do Firebase
        errorMessage = error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error("Erro de autenticação:", error);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function logoutUser(): Promise<LogoutResult> {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao fazer logout";

    console.error("Erro no logout:", error);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// Função para verificar token no servidor
export async function verifyIdToken(
  token: string
): Promise<TokenVerificationResult> {
  try {
    // Implemente a verificação real com Firebase Admin SDK
    // Exemplo de implementação:
    // const admin = await import("firebase-admin");
    // const decodedToken = await admin.auth().verifyIdToken(token);

    return {
      valid: true,
      uid: "user-id-example",
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Token inválido";

    return {
      valid: false,
      error: errorMessage,
    };
  }
}

export interface AuthService {
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<LogoutResult>;
  getCurrentUser: () => User | null;
  verifyToken: (token: string) => Promise<TokenVerificationResult>;
}

// Implementação opcional como serviço
export const authService: AuthService = {
  login: loginUser,
  logout: logoutUser,
  getCurrentUser: getCurrentUser,
  verifyToken: verifyIdToken,
};

export function validateCredentials(credentials: LoginCredentials): {
  isValid: boolean;
  errors?: {
    email?: string;
    password?: string;
  };
} {
  const errors: {
    email?: string;
    password?: string;
  } = {};

  if (!credentials.email || !credentials.email.includes("@")) {
    errors.email = "Email inválido";
  }

  if (!credentials.password || credentials.password.length < 6) {
    errors.password = "Senha deve ter no mínimo 6 caracteres";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}
