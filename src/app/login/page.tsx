// app/login/page.tsx
import { getSession } from "@/app/actions/auth";
import { LoginForm } from "@/components/login-form";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Login | Sistema Administrativo",
  description: "Faça login para acessar o painel administrativo",
};

export default async function LoginPage() {
  const session = await getSession();

  // Se já estiver autenticado, redirecionar
  if (session.authenticated) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <LoginForm />
    </div>
  );
}
