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

import { deletePostAction } from "../actions";
import { DeleteButton } from "../form-parts";

type Props = { searchParams: Promise<{ salvo?: string }> };

export default async function BlogDashboardPage({ searchParams }: Props) {
  await requireAdmin();
  const { salvo } = await searchParams;
  const posts = await listAllPostsUncached();

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-3 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Blog</h1>
        <Button asChild>
          <Link href="/dashboard/blog/novo">
            <Plus data-icon="inline-start" aria-hidden="true" />
            Novo post
          </Link>
        </Button>
      </div>

      <div aria-live="polite">
        {salvo && (
          <Alert>
            <CheckCircle2 aria-hidden="true" />
            <AlertDescription>Post salvo.</AlertDescription>
          </Alert>
        )}
      </div>

      {posts.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Newspaper aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Nenhum post ainda</EmptyTitle>
            <EmptyDescription>Escreva sobre algo que você aprendeu esta semana.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/dashboard/blog/novo">Escrever o primeiro post</Link>
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
                        {post.published ? "Publicado" : "Rascunho"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Atualizado em {formatDay(post.updatedAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {post.published && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink data-icon="inline-start" aria-hidden="true" />
                          Ver<span className="sr-only"> {post.title} (abre em nova aba)</span>
                        </Link>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/blog/${post.id}`}>
                        <Pencil data-icon="inline-start" aria-hidden="true" />
                        Editar<span className="sr-only"> {post.title}</span>
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
    </main>
  );
}
