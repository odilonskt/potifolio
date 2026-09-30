import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Markdown } from "@/components/blog/markdown";
import { ReadAloud } from "@/components/blog/read-aloud";
import Header from "@/components/heard/page";
import { Badge } from "@/components/ui/badge";
import { formatDay, readingTime } from "@/lib/content/dates";
import { getPublishedPostBySlug } from "@/lib/content/repository";
import { slugSchema } from "@/lib/content/schemas";
import { markdownToSpeech, splitForSpeech } from "@/lib/content/speech";
import { localize } from "@/lib/content/translations";
import { HTML_LANG, languageAlternates, localePath, OG_LOCALE } from "@/lib/i18n/config";
import { blog } from "@/lib/i18n/messages/blog";
import { common } from "@/lib/i18n/messages/common";
import { getLocale } from "@/lib/i18n/server";

export const revalidate = 3600;

// Posts são gerados sob demanda na primeira visita e depois servidos do cache (ISR)
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

async function loadPost(params: Props["params"]) {
  const { slug } = await params;
  if (!slugSchema.safeParse(slug).success) return null;
  return getPublishedPostBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await getLocale();
  const original = await loadPost(params);
  // Chamar notFound() aqui faz robôs de busca (metadados bloqueantes) receberem HTTP 404
  if (!original) notFound();
  const post = localize(original, locale);

  return {
    title: `${post.title} | ${blog[locale].postTitleSuffix}`,
    description: post.excerpt,
    alternates: languageAlternates(locale, `/blog/${post.slug}`),
    openGraph: {
      type: "article",
      locale: OG_LOCALE[locale],
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      tags: post.tags,
      images: post.coverUrl ? [{ url: post.coverUrl, alt: post.coverAlt ?? post.title }] : undefined,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const locale = await getLocale();
  const t = blog[locale];
  const original = await loadPost(params);
  if (!original) notFound();
  const post = localize(original, locale);
  // Sem tradução do texto: avisa e marca o idioma (leitores de tela pronunciam certo)
  const inPortuguese = locale !== "pt" && !original.translations?.[locale]?.content;
  // Leitura em voz alta no idioma real do texto (português quando não há tradução)
  const contentLocale = inPortuguese ? "pt" : locale;
  const speech = splitForSpeech(
    [`${post.title}.`, post.excerpt, markdownToSpeech(post.content, blog[contentLocale].readAloud.codeBlock)].join("\n"),
  );

  return (
    <>
      <Header />
      <main id="conteudo" className="mx-auto w-full max-w-3xl px-4 pt-16 pb-28 sm:pt-32">
        <Link
          href={localePath(locale, "/blog")}
          className="inline-flex items-center gap-2 rounded-sm text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t.allPosts}
        </Link>

        <article className="mt-8" lang={inPortuguese ? HTML_LANG.pt : undefined}>
          {inPortuguese && (
            <p lang={HTML_LANG[locale]} className="mb-6 rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
              {t.onlyInPortuguese}
            </p>
          )}
          <header className="flex flex-col gap-4 border-b border-border pb-8">
            <h1 className="text-3xl font-bold tracking-tight text-balance text-foreground sm:text-5xl">
              {post.title}
            </h1>
            <p className="text-lg text-muted-foreground">{post.excerpt}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {post.publishedAt && <time dateTime={post.publishedAt}>{formatDay(post.publishedAt, locale)}</time>}
              <span>{readingTime(post.content, locale)}</span>
              {post.tags.length > 0 && (
                <ul className="flex flex-wrap gap-2" aria-label={t.tags}>
                  {post.tags.map((tag) => (
                    <li key={tag}>
                      <Badge variant="secondary">{tag}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </header>

          <ReadAloud chunks={speech} contentLocale={contentLocale} />

          {post.coverUrl && (
            <Image
              src={post.coverUrl}
              alt={post.coverAlt ?? ""}
              width={1200}
              height={630}
              priority
              sizes="(min-width: 768px) 768px, 100vw"
              className="mt-8 aspect-[1200/630] w-full rounded-2xl border border-border object-cover"
            />
          )}

          <Markdown content={post.content} className="mt-10" newTabLabel={common[locale].newTab} />
        </article>
      </main>
    </>
  );
}
