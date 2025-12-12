// types/auth.types.ts
import { User } from "firebase/auth";

// Tipos básicos
export interface LoginCredentials {
  email: string;
  password: string;
}

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

export interface UserSession {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  emailVerified: boolean;
  lastLoginAt?: string;
}

// Tipos para estado de autenticação
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Tipos para callbacks
export type AuthStateCallback = (user: User | null) => void;
export type LoginCallback = (result: LoginResult) => void;
export type LogoutCallback = (result: LogoutResult) => void;

// Tipos para configuração
export interface AuthConfig {
  persistence?: "local" | "session" | "none";
  onLogin?: LoginCallback;
  onLogout?: LogoutCallback;
  onAuthStateChange?: AuthStateCallback;
}

// Enums
export enum AuthErrorCode {
  INVALID_CREDENTIAL = "auth/invalid-credential",
  USER_NOT_FOUND = "auth/user-not-found",
  WRONG_PASSWORD = "auth/wrong-password",
  TOO_MANY_REQUESTS = "auth/too-many-requests",
  INVALID_EMAIL = "auth/invalid-email",
  USER_DISABLED = "auth/user-disabled",
  OPERATION_NOT_ALLOWED = "auth/operation-not-allowed",
  NETWORK_REQUEST_FAILED = "auth/network-request-failed",
  EMAIL_ALREADY_IN_USE = "auth/email-already-in-use",
  WEAK_PASSWORD = "auth/weak-password",
  REQUIRES_RECENT_LOGIN = "auth/requires-recent-login",
}

export enum AuthStatus {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}

// Tipo para erros mapeados
export type AuthErrorMessage = Record<string, string>;
