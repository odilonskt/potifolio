import type { ResumeEntry, ResumeView } from "@/lib/content/resume";
import { slugify } from "@/lib/content/schemas";
import { cn } from "@/lib/utils";

// Folha A4 do currículo. Na tela segue o tema; na impressão sai sempre preto no
// branco (papel e leitura por ATS), por isso as classes print: fixas.

export function ResumeDocument({ resume, className }: { resume: ResumeView; className?: string }) {
  const sections: { title: string; entries: ResumeEntry[] }[] = [
    { title: "Experiência", entries: resume.work },
    { title: "Formação", entries: resume.education },
    { title: "Certificados", entries: resume.certificates },
  ];

  return (
    <article
      aria-labelledby="curriculo-nome"
      className={cn(
        "mx-auto flex w-full max-w-[210mm] flex-col gap-6 rounded-lg border border-border bg-card p-6 text-card-foreground sm:p-10",
        "print:max-w-none print:gap-5 print:rounded-none print:border-0 print:bg-white print:p-0 print:text-black",
        className,
      )}
    >
      <header className="flex flex-col gap-2 border-b border-border pb-5 print:border-black/20">
        <h1 id="curriculo-nome" className="text-3xl font-semibold tracking-tight">
          {resume.name}
        </h1>
        <p className="text-lg text-brand print:text-black">{resume.role}</p>
        {(resume.contact.length > 0 || resume.links.length > 0) && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground print:text-black/75">
            {resume.contact.map((item) => (
              <li key={item}>{item}</li>
            ))}
            {resume.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {link.label}
                  <span className="sr-only"> (abre em nova aba)</span>
                  {/* No papel o link não é clicável: mostra o endereço */}
                  <span className="hidden print:inline"> ({link.url.replace(/^https:\/\//, "")})</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>

      <ResumeSection title="Resumo">
        <p className="leading-relaxed">{resume.summary}</p>
      </ResumeSection>

      {sections
        .filter((section) => section.entries.length > 0)
        .map((section) => (
          <ResumeSection key={section.title} title={section.title}>
            <ul className="flex flex-col gap-4">
              {section.entries.map((entry) => (
                <li key={`${entry.title}-${entry.organization}-${entry.period}`} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="font-medium">
                      {entry.title}
                      <span className="font-normal text-muted-foreground print:text-black/75"> · {entry.organization}</span>
                    </h3>
                    <p className="text-sm text-muted-foreground print:text-black/75">{entry.period}</p>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed whitespace-pre-line">{entry.description}</p>
                </li>
              ))}
            </ul>
          </ResumeSection>
        ))}

      {resume.skills.length > 0 && (
        <ResumeSection title="Competências técnicas">
          <p className="text-sm leading-relaxed">{resume.skills.join(" · ")}</p>
        </ResumeSection>
      )}

      {resume.softSkills.length > 0 && (
        <ResumeSection title="Competências pessoais">
          <p className="text-sm leading-relaxed">{resume.softSkills.join(" · ")}</p>
        </ResumeSection>
      )}

      {resume.languages.length > 0 && (
        <ResumeSection title="Idiomas">
          <ul className="flex flex-col gap-1 text-sm">
            {resume.languages.map((language) => (
              <li key={language}>{language}</li>
            ))}
          </ul>
        </ResumeSection>
      )}
    </article>
  );
}

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  const id = `curriculo-${slugify(title)}`;
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className="text-xs font-semibold tracking-widest text-muted-foreground uppercase print:text-black">{title}</h2>
      {children}
    </section>
  );
}
