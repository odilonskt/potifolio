import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { requireAdmin } from "@/lib/auth/session";
import { getAllContacts } from "@/lib/firebase-contacts";
import { dashboard } from "@/lib/i18n/messages/dashboard";
import { getLocale } from "@/lib/i18n/server";

import { ContactsInbox } from "./contacts-inbox";
import { PageHeader } from "./page-header";

export default async function ContactsPage() {
  await requireAdmin();
  const t = dashboard[await getLocale()].contacts;
  const result = await getAllContacts();

  return (
    <>
      <PageHeader title={t.title} description={t.description} />

      {result.success ? (
        <ContactsInbox initialContacts={result.data ?? []} />
      ) : (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>{t.loadErrorTitle}</AlertTitle>
          <AlertDescription>{t.loadErrorDescription}</AlertDescription>
        </Alert>
      )}
    </>
  );
}
