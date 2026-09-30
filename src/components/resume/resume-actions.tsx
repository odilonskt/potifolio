"use client";

import { Download, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Ações do currículo: baixar o PDF (principal) e imprimir. Somem na impressão. */
export function ResumeActions({ pdfHref, children }: { pdfHref: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <Button asChild size="lg">
        <a href={pdfHref} download>
          <Download data-icon="inline-start" aria-hidden="true" />
          Baixar currículo (PDF)
        </a>
      </Button>
      <Button type="button" variant="outline" size="lg" onClick={() => window.print()}>
        <Printer data-icon="inline-start" aria-hidden="true" />
        Imprimir
      </Button>
      {children}
    </div>
  );
}
