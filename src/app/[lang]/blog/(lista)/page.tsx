import type { Metadata } from "next";
import Link from "next/link";

import Header from "@/components/heard/page";
import { Badge } from "@/components/ui/badge";
import { formatDay, readingTime } from "@/lib/content/dates";
import { getPublishedPosts } from "@/lib/content/repository";
import { localize } from "@/lib/content/translations";
import { languageAlternates, localePath } from "@/lib/i18n/config";
import { blog } from "@/lib/i18n/messages/blog";
import { getLocale } from "@/lib/i18n/server";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = blog[locale];
  return { title: t.metaTitle, description: t.metaDescription, alternates: languageAlternates(locale, "/blog") };
}

export default async function BlogPage() {
  const locale = await getLocale();
  const t = blog[locale];
  const posts = (await getPublishedPosts()).map((post) => localize(post, locale));

  return (
    <>
      <Header />
      <main id="conteudo" className="mx-auto w-full max-w-3xl px-4 pt-16 pb-28 sm:pt-32">
        <header className="flex flex-col gap-3 border-b border-border pb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">{t.title}</h1>
          <p className="max-w-prose text-lg text-muted-foreground">{t.intro}</p>
        </header>

        {posts.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">{t.empty}</p>
        ) : (
          <ol className="flex flex-col" aria-label={t.postsLabel}>
            {posts.map((post) => (
              <li key={post.id} className="border-b border-border">
                <article className="group relative grid gap-2 py-8 sm:grid-cols-[10rem_1fr] sm:gap-8">
                  {post.publishedAt && (
                    <time dateTime={post.publishedAt} className="text-sm text-muted-foreground sm:pt-1">
                      {formatDay(post.publishedAt, locale)}
                    </time>
                  )}
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-semibold text-foreground group-hover:text-brand">
                      {/* O link cobre o card inteiro, mas o nome acessível é só o título */}
                      <Link
                        href={localePath(locale, `/blog/${post.slug}`)}
                        className="rounded-sm after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-muted-foreground">{post.excerpt}</p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-sm text-muted-foreground">
                      <span>{readingTime(post.content, locale)}</span>
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        )}
      </main>
    </>
  );
}
