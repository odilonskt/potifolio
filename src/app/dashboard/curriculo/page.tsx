import { CheckCircle2, Download, ExternalLink, Eye } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/session";
import { getResumeUncached } from "@/lib/content/repository";
import { RESUME_SEED } from "@/lib/content/resume";

import { PageHeader } from "../page-header";
import { ResumeForm } from "./resume-form";

type Props = { searchParams: Promise<{ salvo?: string }> };

export default async function ResumeDashboardPage({ searchParams }: Props) {
  await requireAdmin();
  const { salvo } = await searchParams;
  const saved = await getResumeUncached();
  const resume = saved ?? RESUME_SEED;

  return (
    <>
      <PageHeader
        title="Currículo"
        description="Edite cada seção do currículo, gere o PDF ou publique em /curriculo para quem quiser baixar."
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Card className="order-2 lg:order-1">
          <CardHeader>
            <CardTitle>{saved ? "Editar currículo" : "Novo currículo"}</CardTitle>
            {!saved && (
              <CardDescription>Rascunho montado a partir do seu currículo em PDF. Nada é salvo até você clicar em salvar.</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <ResumeForm resume={resume} />
          </CardContent>
        </Card>

        <aside aria-labelledby="resume-output-title" className="order-1 flex flex-col gap-4 self-start lg:order-2">
          <h2 id="resume-output-title" className="font-semibold text-foreground">
            Gerar
          </h2>

          <div aria-live="polite">
            {salvo && (
              <Alert>
                <CheckCircle2 aria-hidden="true" />
                <AlertDescription>
                  Currículo salvo.{saved?.published ? " A página pública já mostra a nova versão." : ""}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/curriculo/visualizar">
                <Eye data-icon="inline-start" aria-hidden="true" />
                Visualizar e imprimir
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="/dashboard/curriculo/pdf" download>
                <Download data-icon="inline-start" aria-hidden="true" />
                Baixar PDF
              </a>
            </Button>
            {saved?.published && (
              <Button variant="outline" asChild>
                <Link href="/curriculo" target="_blank">
                  <ExternalLink data-icon="inline-start" aria-hidden="true" />
                  Ver página pública
                  <span className="sr-only"> (abre em nova aba)</span>
                </Link>
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Os PDFs (do painel e o que o visitante baixa) levam e-mail, celular e cidade. A página pública
            /curriculo não mostra esses dados.
          </p>
        </aside>
      </div>
    </>
  );
}
