import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/session";
import { getPost } from "@/lib/content/repository";

import { PostForm } from "../post-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) notFound();

  const post = await getPost(id);
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-4xl p-3 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1>Editar post</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PostForm post={post} />
        </CardContent>
      </Card>
    </main>
  );
}
