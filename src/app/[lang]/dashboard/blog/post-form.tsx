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
import { initialFormState, POST_TRANSLATABLE, type Post } from "@/lib/content/schemas";
import { useLocale } from "@/lib/i18n/client";
import { localePath } from "@/lib/i18n/config";
import { common } from "@/lib/i18n/messages/common";
import { dashboard } from "@/lib/i18n/messages/dashboard";

import { savePostAction } from "../actions";
import { fieldProps, FieldErrors, FormMessage, ImageField, SubmitButton, TranslationFields } from "../form-parts";

export function PostForm({ post }: { post?: Post | null }) {
  const locale = useLocale();
  const t = dashboard[locale];
  const tb = t.blog;
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
          <FieldLabel htmlFor="title">{tb.postTitle}</FieldLabel>
          <Input {...fieldProps(state, "title")} defaultValue={text("title")} required maxLength={140} />
          {post && <FieldDescription>{tb.address(post.slug)}</FieldDescription>}
          <FieldErrors state={state} name="title" />
        </Field>

        <Field data-invalid={invalid("excerpt")}>
          <FieldLabel htmlFor="excerpt">{tb.excerpt}</FieldLabel>
          <Textarea {...fieldProps(state, "excerpt")} defaultValue={text("excerpt")} rows={2} maxLength={300} required />
          <FieldDescription>{tb.excerptHint}</FieldDescription>
          <FieldErrors state={state} name="excerpt" />
        </Field>

        <Field data-invalid={invalid("content")}>
          <FieldLabel htmlFor="content">{tb.content}</FieldLabel>
          <Tabs defaultValue="write">
            <TabsList aria-label={tb.editorMode}>
              <TabsTrigger value="write">{tb.write}</TabsTrigger>
              <TabsTrigger value="preview">{tb.preview}</TabsTrigger>
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
                <Markdown content={content} newTabLabel={common[locale].newTab} />
              ) : (
                <p className="text-muted-foreground">{tb.previewEmpty}</p>
              )}
            </TabsContent>
          </Tabs>
          <FieldDescription>{tb.markdownHint}</FieldDescription>
          <FieldErrors state={state} name="content" />
        </Field>

        <Field data-invalid={invalid("tags")}>
          <FieldLabel htmlFor="tags">{tb.tags}</FieldLabel>
          <Input
            {...fieldProps(state, "tags")}
            defaultValue={values?.tags ?? post?.tags.join(", ") ?? ""}
            placeholder={tb.tagsPlaceholder}
            maxLength={200}
          />
          <FieldDescription>{tb.tagsHint}</FieldDescription>
          <FieldErrors state={state} name="tags" />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <ImageField state={state} name="cover" label={tb.cover} currentUrl={post?.coverUrl} removeName="removeCover" />
          <Field data-invalid={invalid("coverAlt")}>
            <FieldLabel htmlFor="coverAlt">{tb.coverAlt}</FieldLabel>
            <Input {...fieldProps(state, "coverAlt")} defaultValue={text("coverAlt")} maxLength={160} />
            <FieldDescription>{tb.coverAltHint}</FieldDescription>
            <FieldErrors state={state} name="coverAlt" />
          </Field>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border p-4">
          <Switch id="published" name="published" checked={published} onCheckedChange={setPublished} />
          <div className="flex flex-col gap-1">
            <Label htmlFor="published">{tb.publish}</Label>
            <p className="text-sm text-muted-foreground">{published ? tb.publishedHint : tb.draftHint}</p>
          </div>
        </div>

        <TranslationFields
          state={state}
          translations={post?.translations}
          fields={[
            { name: "title", label: tb.postTitle, max: POST_TRANSLATABLE.title },
            { name: "excerpt", label: tb.excerpt, max: POST_TRANSLATABLE.excerpt, rows: 2 },
            { name: "content", label: tb.content, max: POST_TRANSLATABLE.content, rows: 12, hint: tb.translationContentHint },
            { name: "coverAlt", label: tb.coverAlt, max: POST_TRANSLATABLE.coverAlt },
          ]}
        />
      </FieldGroup>

      <div className="flex flex-wrap gap-3">
        <SubmitButton pendingLabel={t.common.saving}>
          {published ? (post?.published ? t.common.save : tb.publishPost) : tb.saveDraft}
        </SubmitButton>
        <Button variant="outline" asChild>
          <Link href={localePath(locale, "/dashboard/blog")}>{t.common.cancel}</Link>
        </Button>
      </div>
    </form>
  );
}
