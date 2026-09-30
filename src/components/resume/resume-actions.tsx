"use client";

import { Download, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import { resume } from "@/lib/i18n/messages/resume";

/** Ações do currículo: baixar o PDF (principal) e imprimir. Somem na impressão. */
export function ResumeActions({ pdfHref, locale, children }: { pdfHref: string; locale: Locale; children?: React.ReactNode }) {
  const t = resume[locale];
  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <Button asChild size="lg">
        <a href={pdfHref} download>
          <Download data-icon="inline-start" aria-hidden="true" />
          {t.download}
        </a>
      </Button>
      <Button type="button" variant="outline" size="lg" onClick={() => window.print()}>
        <Printer data-icon="inline-start" aria-hidden="true" />
        {t.print}
      </Button>
      {children}
    </div>
  );
}
