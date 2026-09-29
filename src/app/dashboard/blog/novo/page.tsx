import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/session";

import { PostForm } from "../post-form";

export default async function NewPostPage() {
  await requireAdmin();

  return (
    <main className="mx-auto max-w-4xl p-3 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1>Novo post</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PostForm />
        </CardContent>
      </Card>
    </main>
  );
}
