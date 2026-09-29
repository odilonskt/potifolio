import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/session";
import { getPost } from "@/lib/content/repository";

import { PageHeader } from "../../page-header";
import { PostForm } from "../post-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) notFound();

  const post = await getPost(id);
  if (!post) notFound();

  return (
    <>
      <PageHeader title="Editar post" description="As mudanças aparecem no blog assim que você salvar." />
      <Card>
        <CardContent>
          <PostForm post={post} />
        </CardContent>
      </Card>
    </>
  );
}
