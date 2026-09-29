import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { requireAdmin } from "@/lib/auth/session";
import { getAllContacts } from "@/lib/firebase-contacts";

import { ContactsInbox } from "./contacts-inbox";
import { PageHeader } from "./page-header";

export default async function ContactsPage() {
  await requireAdmin();
  const result = await getAllContacts();

  return (
    <>
      <PageHeader title="Contatos" description="Mensagens enviadas pelo formulário do site." />

      {result.success ? (
        <ContactsInbox initialContacts={result.data ?? []} />
      ) : (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>Não foi possível carregar as mensagens</AlertTitle>
          <AlertDescription>Recarregue a página. Se continuar, confira as credenciais do Firebase Admin.</AlertDescription>
        </Alert>
      )}
    </>
  );
}
