import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/session";

import { PageHeader } from "../../page-header";
import { PostForm } from "../post-form";

export default async function NewPostPage() {
  await requireAdmin();

  return (
    <>
      <PageHeader title="Novo post" description="Escreva em Markdown e use a pré-visualização antes de publicar." />
      <Card>
        <CardContent>
          <PostForm />
        </CardContent>
      </Card>
    </>
  );
}
