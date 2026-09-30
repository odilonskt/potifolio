import { CheckCircle2, ExternalLink, Newspaper, Pencil, Plus } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/session";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { formatDay } from "@/lib/content/dates";
import { listAllPostsUncached } from "@/lib/content/repository";
import { localePath } from "@/lib/i18n/config";
import { common } from "@/lib/i18n/messages/common";
import { dashboard } from "@/lib/i18n/messages/dashboard";
import { getLocale } from "@/lib/i18n/server";

import { deletePostAction } from "../actions";
import { DeleteButton } from "../form-parts";
import { PageHeader } from "../page-header";

type Props = { searchParams: Promise<{ salvo?: string }> };

export default async function BlogDashboardPage({ searchParams }: Props) {
  await requireAdmin();
  const locale = await getLocale();
  const t = dashboard[locale];
  const { salvo } = await searchParams;
  const posts = await listAllPostsUncached();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.blog.title}
        description={t.blog.description}
        action={
          <Button asChild>
            <Link href={localePath(locale, "/dashboard/blog/novo")}>
              <Plus data-icon="inline-start" aria-hidden="true" />
              {t.blog.newPost}
            </Link>
          </Button>
        }
      />

      <div aria-live="polite">
        {salvo && (
          <Alert>
            <CheckCircle2 aria-hidden="true" />
            <AlertDescription>{t.blog.saved}</AlertDescription>
          </Alert>
        )}
      </div>

      {posts.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Newspaper aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>{t.blog.emptyTitle}</EmptyTitle>
            <EmptyDescription>{t.blog.emptyDescription}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href={localePath(locale, "/dashboard/blog/novo")}>{t.blog.writeFirst}</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <li key={post.id}>
              <Card className="py-4">
                <CardContent className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{post.title}</p>
                      <Badge variant={post.published ? "default" : "secondary"}>
                        {post.published ? t.common.published : t.common.draft}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t.blog.updatedAt(formatDay(post.updatedAt, locale))}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {post.published && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={localePath(locale, `/blog/${post.slug}`)} target="_blank" rel="noopener noreferrer">
                          <ExternalLink data-icon="inline-start" aria-hidden="true" />
                          {t.blog.view}
                          <span className="sr-only">
                            {" "}
                            {post.title} {common[locale].newTab}
                          </span>
                        </Link>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={localePath(locale, `/dashboard/blog/${post.id}`)}>
                        <Pencil data-icon="inline-start" aria-hidden="true" />
                        {t.common.edit}
                        <span className="sr-only"> {post.title}</span>
                      </Link>
                    </Button>
                    <DeleteButton id={post.id} itemName={post.title} action={deletePostAction} />
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
