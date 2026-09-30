import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/session";
import { dashboard } from "@/lib/i18n/messages/dashboard";
import { getLocale } from "@/lib/i18n/server";

import { PageHeader } from "../../page-header";
import { PostForm } from "../post-form";

export default async function NewPostPage() {
  await requireAdmin();
  const t = dashboard[await getLocale()];

  return (
    <>
      <PageHeader title={t.blog.newPost} description={t.blog.newPostDescription} />
      <Card>
        <CardContent>
          <PostForm />
        </CardContent>
      </Card>
    </>
  );
}
