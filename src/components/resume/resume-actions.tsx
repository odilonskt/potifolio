"use client";

import { Download, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Barra de ações do currículo; some na impressão. */
export function ResumeActions({ pdfHref, children }: { pdfHref: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <Button type="button" onClick={() => window.print()}>
        <Printer data-icon="inline-start" aria-hidden="true" />
        Imprimir ou salvar PDF
      </Button>
      <Button variant="outline" asChild>
        <a href={pdfHref} download>
          <Download data-icon="inline-start" aria-hidden="true" />
          Baixar PDF
        </a>
      </Button>
      {children}
    </div>
  );
}
