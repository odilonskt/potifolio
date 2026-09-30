import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/session";
import { getPost } from "@/lib/content/repository";
import { dashboard } from "@/lib/i18n/messages/dashboard";
import { getLocale } from "@/lib/i18n/server";

import { PageHeader } from "../../page-header";
import { PostForm } from "../post-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  await requireAdmin();
  const t = dashboard[await getLocale()];
  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) notFound();

  const post = await getPost(id);
  if (!post) notFound();

  return (
    <>
      <PageHeader title={t.blog.editPost} description={t.blog.editPostDescription} />
      <Card>
        <CardContent>
          <PostForm post={post} />
        </CardContent>
      </Card>
    </>
  );
}
