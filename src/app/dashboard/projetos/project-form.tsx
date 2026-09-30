"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { initialFormState, MAX_PROJECT_IMAGES, type Project } from "@/lib/content/schemas";

import { saveProjectAction } from "../actions";
import { fieldProps, FieldErrors, FormMessage, SubmitButton } from "../form-parts";

export function ProjectForm({ project }: { project?: Project | null }) {
  const [state, formAction] = useActionState(saveProjectAction, initialFormState);
  const values = state.values;
  const value = (name: "title" | "summary" | "repoUrl" | "demoUrl" | "imageAlt") =>
    values?.[name] ?? project?.[name] ?? "";
  const invalid = (name: string) => Boolean(state.fieldErrors?.[name]) || undefined;

  // Controlados: o React reseta o formulário após a action e perderia as escolhas em caso de erro
  const [published, setPublished] = useState(project?.published ?? true);
  const [removed, setRemoved] = useState<Set<string>>(() => new Set());
  const images = project?.images ?? [];
  const slotsLeft = MAX_PROJECT_IMAGES - (images.length - removed.size);

  const toggleRemoved = (path: string, checked: boolean) =>
    setRemoved((current) => {
      const next = new Set(current);
      if (checked) next.add(path);
      else next.delete(path);
      return next;
    });

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {project && <input type="hidden" name="id" value={project.id} />}
      <FormMessage state={state} />

      <FieldGroup>
        <Field data-invalid={invalid("title")}>
          <FieldLabel htmlFor="title">Nome do projeto</FieldLabel>
          <Input {...fieldProps(state, "title")} defaultValue={value("title")} required maxLength={80} />
          <FieldErrors state={state} name="title" />
        </Field>

        <Field data-invalid={invalid("summary")}>
          <FieldLabel htmlFor="summary">Resumo</FieldLabel>
          <Textarea {...fieldProps(state, "summary")} defaultValue={value("summary")} rows={3} required maxLength={400} />
          <FieldDescription>O problema que o projeto resolve e o seu papel nele. Até 400 caracteres.</FieldDescription>
          <FieldErrors state={state} name="summary" />
        </Field>

        <Field data-invalid={invalid("tags")}>
          <FieldLabel htmlFor="tags">Tecnologias</FieldLabel>
          <Input
            {...fieldProps(state, "tags")}
            defaultValue={values?.tags ?? project?.tags.join(", ") ?? ""}
            placeholder="Next.js, TypeScript, Firebase"
          />
          <FieldDescription>Separadas por vírgula. Até 8.</FieldDescription>
          <FieldErrors state={state} name="tags" />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={invalid("repoUrl")}>
            <FieldLabel htmlFor="repoUrl">Link do código (opcional)</FieldLabel>
            <Input {...fieldProps(state, "repoUrl")} type="url" inputMode="url" placeholder="https://github.com/..." defaultValue={value("repoUrl")} />
            <FieldErrors state={state} name="repoUrl" />
          </Field>
          <Field data-invalid={invalid("demoUrl")}>
            <FieldLabel htmlFor="demoUrl">Link online (opcional)</FieldLabel>
            <Input {...fieldProps(state, "demoUrl")} type="url" inputMode="url" placeholder="https://" defaultValue={value("demoUrl")} />
            <FieldErrors state={state} name="demoUrl" />
          </Field>
        </div>

        <FieldSet>
          <FieldLegend>Imagens</FieldLegend>
          <FieldDescription>
            Até {MAX_PROJECT_IMAGES} por projeto; a primeira vira a capa. JPG, PNG, WebP ou AVIF, até 2 MB cada e 4 MB
            somadas por envio.
          </FieldDescription>

          {images.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {images.map((image, index) => (
                <li key={image.path} className="flex flex-col gap-2">
                  <Image
                    src={image.url}
                    alt={`Imagem ${index + 1} atual`}
                    width={160}
                    height={90}
                    className="aspect-video w-full rounded-md border border-border object-cover data-[removed=true]:opacity-40"
                    data-removed={removed.has(image.path)}
                  />
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      name="removeImages"
                      value={image.path}
                      checked={removed.has(image.path)}
                      onChange={(event) => toggleRemoved(image.path, event.target.checked)}
                      className="size-4 accent-primary"
                    />
                    Remover<span className="sr-only"> imagem {index + 1}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}

          <Field data-invalid={invalid("images")}>
            <FieldLabel htmlFor="images">
              {images.length > 0 ? "Adicionar imagens" : "Enviar imagens"}
            </FieldLabel>
            <Input
              {...fieldProps(state, "images")}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={slotsLeft <= 0}
            />
            <FieldDescription>
              {slotsLeft > 0
                ? `Você ainda pode adicionar ${slotsLeft} ${slotsLeft === 1 ? "imagem" : "imagens"}.`
                : "Limite atingido: marque “Remover” em alguma imagem para enviar outra."}
            </FieldDescription>
            <FieldErrors state={state} name="images" />
          </Field>

          <Field data-invalid={invalid("imageAlt")}>
            <FieldLabel htmlFor="imageAlt">Texto alternativo das imagens</FieldLabel>
            <Input {...fieldProps(state, "imageAlt")} defaultValue={value("imageAlt")} maxLength={160} />
            <FieldDescription>Obrigatório quando há imagens. Ex.: “Tela inicial do app de finanças”.</FieldDescription>
            <FieldErrors state={state} name="imageAlt" />
          </Field>
        </FieldSet>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={invalid("order")}>
            <FieldLabel htmlFor="order">Ordem</FieldLabel>
            <Input
              {...fieldProps(state, "order")}
              type="number"
              inputMode="numeric"
              min={0}
              max={99}
              defaultValue={values?.order ?? String(project?.order ?? 0)}
            />
            <FieldDescription>Menor aparece primeiro. Empate: o mais novo primeiro.</FieldDescription>
            <FieldErrors state={state} name="order" />
          </Field>

          <div className="flex items-start gap-3 sm:pt-7">
            <Switch id="published" name="published" checked={published} onCheckedChange={setPublished} aria-describedby="published-hint" />
            <div className="flex flex-col gap-1">
              <Label htmlFor="published">Publicado</Label>
              <FieldDescription id="published-hint">Desligado, o projeto fica salvo como rascunho e não aparece na home.</FieldDescription>
            </div>
          </div>
        </div>
      </FieldGroup>

      <div className="flex flex-wrap gap-3">
        <SubmitButton pendingLabel="Salvando...">{project ? "Salvar alterações" : "Cadastrar projeto"}</SubmitButton>
        {project && (
          <Button variant="outline" asChild>
            <Link href="/dashboard/projetos">Cancelar edição</Link>
          </Button>
        )}
      </div>
    </form>
  );
}
