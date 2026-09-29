"use client";

import { AlertCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { useFormStatus } from "react-dom";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { FormState } from "@/lib/content/schemas";

export function SubmitButton({ children, pendingLabel }: { children: React.ReactNode; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending}>
      {pending && <Spinner data-icon="inline-start" />}
      {pending ? pendingLabel : children}
    </Button>
  );
}

/** Mensagem geral do formulário, anunciada por leitores de tela. */
export function FormMessage({ state }: { state: FormState }) {
  return (
    <div aria-live="polite">
      {state.status === "error" && state.message && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export function fieldProps(state: FormState, name: string) {
  const errors = state.fieldErrors?.[name];
  return {
    id: name,
    name,
    "aria-invalid": errors ? true : undefined,
    "aria-describedby": errors ? `${name}-error` : undefined,
  } as const;
}

export function FieldErrors({ state, name }: { state: FormState; name: string }) {
  return <FieldError id={`${name}-error`} errors={state.fieldErrors?.[name]} />;
}

export function ImageField({
  state,
  name,
  label,
  currentUrl,
  removeName,
}: {
  state: FormState;
  name: string;
  label: string;
  currentUrl?: string | null;
  removeName: string;
}) {
  const invalid = Boolean(state.fieldErrors?.[name]);
  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      {currentUrl && (
        <div className="flex items-center gap-4">
          <Image
            src={currentUrl}
            alt="Imagem atual"
            width={64}
            height={64}
            className="size-16 rounded-lg border border-border object-cover"
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" name={removeName} className="size-4 accent-primary" />
            Remover imagem atual
          </label>
        </div>
      )}
      <Input
        {...fieldProps(state, name)}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
      />
      <FieldDescription>JPG, PNG, WebP ou AVIF, até 2 MB.</FieldDescription>
      <FieldErrors state={state} name={name} />
    </Field>
  );
}

/** Exclusão com confirmação. A action verifica a sessão de admin no servidor. */
export function DeleteButton({
  id,
  itemName,
  action,
}: {
  id: string;
  itemName: string;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive">
          <Trash2 data-icon="inline-start" aria-hidden="true" />
          Excluir<span className="sr-only"> {itemName}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir “{itemName}”?</AlertDialogTitle>
          <AlertDialogDescription>
            O item e a imagem dele serão apagados. Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={action}>
          <input type="hidden" name="id" value={id} />
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
            <AlertDialogAction type="submit">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
