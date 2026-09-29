"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { Markdown } from "@/components/blog/markdown";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { initialFormState, type Post } from "@/lib/content/schemas";

import { savePostAction } from "../actions";
import { fieldProps, FieldErrors, FormMessage, ImageField, SubmitButton } from "../form-parts";

export function PostForm({ post }: { post?: Post | null }) {
  const [state, formAction] = useActionState(savePostAction, initialFormState);
  const values = state.values;
  const text = (name: "title" | "excerpt" | "coverAlt") => values?.[name] ?? post?.[name] ?? "";
  const invalid = (name: string) => Boolean(state.fieldErrors?.[name]) || undefined;

  // Conteúdo controlado para alimentar a pré-visualização
  const [content, setContent] = useState(values?.content ?? post?.content ?? "");
  const [published, setPublished] = useState(
    values ? values.published === "on" : (post?.published ?? false)
  );

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {post && <input type="hidden" name="id" value={post.id} />}
      <FormMessage state={state} />

      <FieldGroup>
        <Field data-invalid={invalid("title")}>
          <FieldLabel htmlFor="title">Título</FieldLabel>
          <Input {...fieldProps(state, "title")} defaultValue={text("title")} required maxLength={140} />
          {post && <FieldDescription>Endereço: /blog/{post.slug}</FieldDescription>}
          <FieldErrors state={state} name="title" />
        </Field>

        <Field data-invalid={invalid("excerpt")}>
          <FieldLabel htmlFor="excerpt">Resumo</FieldLabel>
          <Textarea {...fieldProps(state, "excerpt")} defaultValue={text("excerpt")} rows={2} maxLength={300} required />
          <FieldDescription>Aparece na lista de posts e no compartilhamento em redes sociais.</FieldDescription>
          <FieldErrors state={state} name="excerpt" />
        </Field>

        <Field data-invalid={invalid("content")}>
          <FieldLabel htmlFor="content">Conteúdo</FieldLabel>
          <Tabs defaultValue="write">
            <TabsList aria-label="Modo do editor">
              <TabsTrigger value="write">Escrever</TabsTrigger>
              <TabsTrigger value="preview">Pré-visualizar</TabsTrigger>
            </TabsList>
            {/* forceMount mantém o textarea no form mesmo na aba de pré-visualização */}
            <TabsContent value="write" forceMount className="data-[state=inactive]:hidden">
              <Textarea
                {...fieldProps(state, "content")}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={18}
                maxLength={50_000}
                className="font-mono text-sm"
                required
              />
            </TabsContent>
            <TabsContent value="preview" className="min-h-40 rounded-md border border-border p-4">
              {content.trim() ? (
                <Markdown content={content} />
              ) : (
                <p className="text-muted-foreground">Escreva algo para ver a pré-visualização.</p>
              )}
            </TabsContent>
          </Tabs>
          <FieldDescription>
            Markdown: **negrito**, ## subtítulo, [link](https://...), listas e blocos de código. HTML não é interpretado.
          </FieldDescription>
          <FieldErrors state={state} name="content" />
        </Field>

        <Field data-invalid={invalid("tags")}>
          <FieldLabel htmlFor="tags">Tags</FieldLabel>
          <Input
            {...fieldProps(state, "tags")}
            defaultValue={values?.tags ?? post?.tags.join(", ") ?? ""}
            placeholder="nextjs, carreira, estudos"
            maxLength={200}
          />
          <FieldDescription>Separe por vírgula. Até 8 tags.</FieldDescription>
          <FieldErrors state={state} name="tags" />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <ImageField state={state} name="cover" label="Capa (opcional)" currentUrl={post?.coverUrl} removeName="removeCover" />
          <Field data-invalid={invalid("coverAlt")}>
            <FieldLabel htmlFor="coverAlt">Texto alternativo da capa</FieldLabel>
            <Input {...fieldProps(state, "coverAlt")} defaultValue={text("coverAlt")} maxLength={160} />
            <FieldDescription>Descreva a imagem. Deixe vazio se ela for só decorativa.</FieldDescription>
            <FieldErrors state={state} name="coverAlt" />
          </Field>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border p-4">
          <Switch id="published" name="published" checked={published} onCheckedChange={setPublished} />
          <div className="flex flex-col gap-1">
            <Label htmlFor="published">Publicar no blog</Label>
            <p className="text-sm text-muted-foreground">
              {published ? "Visível para todos em /blog." : "Rascunho: só aparece aqui no painel."}
            </p>
          </div>
        </div>
      </FieldGroup>

      <div className="flex flex-wrap gap-3">
        <SubmitButton pendingLabel="Salvando...">
          {published ? (post?.published ? "Salvar alterações" : "Publicar post") : "Salvar rascunho"}
        </SubmitButton>
        <Button variant="outline" asChild>
          <Link href="/dashboard/blog">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
