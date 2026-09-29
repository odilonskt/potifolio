"use client";

import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { loginAction, type LoginFormState } from "@/app/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const initialState: LoginFormState = { message: "", success: false };

export function LoginForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state.success) router.push("/dashboard");
  }, [state.success, router]);

  const emailError = state.error?.email;
  const passwordError = state.error?.password;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>
          <h1 className="text-xl font-semibold">Entrar no painel</h1>
        </CardTitle>
        <CardDescription>Acesso restrito ao administrador do site.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-6" noValidate>
          <div aria-live="polite">
            {state.message && !state.success && (
              <Alert variant="destructive">
                <AlertCircle aria-hidden="true" />
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <FieldGroup>
            <Field data-invalid={emailError ? true : undefined}>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isPending}
                aria-invalid={emailError ? true : undefined}
                aria-describedby={emailError ? "email-error" : undefined}
              />
              <FieldError id="email-error" errors={emailError} />
            </Field>

            <Field data-invalid={passwordError ? true : undefined}>
              <FieldLabel htmlFor="password">Senha</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isPending}
                aria-invalid={passwordError ? true : undefined}
                aria-describedby={passwordError ? "password-error" : undefined}
              />
              <FieldError id="password-error" errors={passwordError} />
            </Field>
          </FieldGroup>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Spinner data-icon="inline-start" />}
            {isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
