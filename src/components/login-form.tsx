// components/login-form.tsx
"use client";

import { loginAction } from "@/app/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
          Entrando...
        </>
      ) : (
        "Entrar"
      )}
    </Button>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAction, {
    message: "",
    error: undefined,
    success: false,
  });

  // Redirecionar após login bem-sucedido
  useEffect(() => {
    if (state.success) {
      router.push("/dashboard");
    }
  }, [state.success, router]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Login Administrativo</CardTitle>
        <CardDescription>
          Entre com suas credenciais para acessar o painel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.message && !state.success && (
            <Alert variant={state.success ? "default" : "destructive"}>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@exemplo.com"
              required
              disabled={isPending}
            />
            {state.error?.email && (
              <p className="text-sm text-destructive">{state.error.email[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••"
              required
              disabled={isPending}
            />
            {state.error?.password && (
              <p className="text-sm text-destructive">
                {state.error.password[0]}
              </p>
            )}
          </div>

          <SubmitButton />

          <div className="text-center text-sm text-muted-foreground">
            <p>Credenciais de demonstração:</p>
            <p className="font-medium">admin@exemplo.com / senha123</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
