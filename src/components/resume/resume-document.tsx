import type { ResumeView } from "@/lib/content/resume";
import { slugify } from "@/lib/content/schemas";
import { HTML_LANG, type Locale } from "@/lib/i18n/config";
import { common } from "@/lib/i18n/messages/common";
import { resume as resumeMessages } from "@/lib/i18n/messages/resume";
import { cn } from "@/lib/utils";

// Folha A4 do currículo. Na tela segue o tema; na impressão sai sempre preto no
// branco (papel e leitura por ATS), por isso as classes print: fixas.

const linkClass =
  "rounded-sm underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring print:no-underline";

function ExternalLink({ href, newTab, children }: { href: string; newTab: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {children}
      <span className="sr-only"> {newTab}</span>
      {/* No papel o link não é clicável: mostra o endereço */}
      <span className="hidden print:inline"> ({href.replace(/^https:\/\//, "")})</span>
    </a>
  );
}

function Bullets({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed marker:text-muted-foreground">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function EntryHeader({ title, subtitle, period }: { title: string; subtitle?: string; period?: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h3 className="font-medium">
        {title}
        {subtitle && <span className="font-normal text-muted-foreground print:text-black/75"> · {subtitle}</span>}
      </h3>
      {period && <p className="text-sm text-muted-foreground tabular-nums print:text-black/75">{period}</p>}
    </div>
  );
}

export function ResumeDocument({
  resume,
  locale,
  actions,
  className,
}: {
  resume: ResumeView;
  /** Idioma do conteúdo: títulos das seções e atributo lang */
  locale: Locale;
  /** Botões exibidos no cabeçalho (download etc.); somem na impressão */
  actions?: React.ReactNode;
  className?: string;
}) {
  const t = resumeMessages[locale].sections;
  const newTab = common[locale].newTab;
  return (
    <article
      lang={HTML_LANG[locale]}
      aria-labelledby="curriculo-nome"
      className={cn(
        "mx-auto flex w-full max-w-[210mm] flex-col gap-7 rounded-lg border border-border bg-card p-6 text-card-foreground sm:p-10",
        "print:max-w-none print:gap-5 print:rounded-none print:border-0 print:bg-white print:p-0 print:text-black",
        className,
      )}
    >
      <header className="flex flex-col gap-3 border-b border-border pb-6 print:border-black/20 print:pb-4">
        <div className="flex flex-col gap-1">
          <h1 id="curriculo-nome" className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {resume.name}
          </h1>
          <p className="text-lg text-brand print:text-black">{resume.headline}</p>
          {resume.stack && <p className="text-sm text-muted-foreground print:text-black/75">{resume.stack}</p>}
        </div>

        {(resume.contact.length > 0 || resume.links.length > 0) && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground print:text-black/75">
            {resume.contact.map((item) => (
              <li key={item}>{item}</li>
            ))}
            {resume.links.map((link) => (
              <li key={link.url}>
                <ExternalLink href={link.url} newTab={newTab}>
                  {link.label}
                </ExternalLink>
              </li>
            ))}
          </ul>
        )}

        {actions && <div className="pt-2 print:hidden">{actions}</div>}
      </header>

      <ResumeSection title={t.summary}>
        <p className="leading-relaxed">{resume.summary}</p>
      </ResumeSection>

      {resume.experience.length > 0 && (
        <ResumeSection title={t.experience}>
          <ul className="flex flex-col gap-5">
            {resume.experience.map((item) => (
              <li key={`${item.role}-${item.period}`} className="break-inside-avoid">
                <EntryHeader title={item.role} subtitle={item.organization} period={item.period} />
                <Bullets items={item.bullets} />
              </li>
            ))}
          </ul>
        </ResumeSection>
      )}

      {resume.projects.length > 0 && (
        <ResumeSection title={t.projects}>
          <ul className="flex flex-col gap-5">
            {resume.projects.map((project) => (
              <li key={project.name} className="break-inside-avoid">
                <EntryHeader title={project.name} subtitle={project.context} />
                <Bullets items={project.bullets} />
                {project.linkUrl && (
                  <p className="mt-1 text-sm text-muted-foreground print:text-black/75">
                    <ExternalLink href={project.linkUrl} newTab={newTab}>
                      {project.linkLabel || resumeMessages[locale].viewProject}
                    </ExternalLink>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </ResumeSection>
      )}

      {resume.skills.length > 0 && (
        <ResumeSection title={t.skills}>
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[10rem_1fr]">
            {resume.skills.map((group) => (
              <div key={group.label} className="contents">
                <dt className="font-medium">{group.label}</dt>
                <dd className="mb-2 text-muted-foreground sm:mb-0 print:text-black/80">{group.items}</dd>
              </div>
            ))}
          </dl>
        </ResumeSection>
      )}

      {resume.education.length > 0 && (
        <ResumeSection title={t.education}>
          <ul className="flex flex-col gap-4">
            {resume.education.map((item) => (
              <li key={`${item.course}-${item.institution}`} className="break-inside-avoid">
                <EntryHeader title={item.course} subtitle={item.institution} period={item.period} />
                {item.details && <p className="mt-1 text-sm text-muted-foreground print:text-black/75">{item.details}</p>}
              </li>
            ))}
          </ul>
        </ResumeSection>
      )}

      {resume.courses.length > 0 && (
        <ResumeSection title={t.courses}>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm marker:text-muted-foreground">
            {resume.courses.map((course) => (
              <li key={course.name}>
                {course.url ? (
                  <ExternalLink href={course.url} newTab={newTab}>
                    {course.name}
                  </ExternalLink>
                ) : (
                  course.name
                )}
                {course.details && <span className="text-muted-foreground print:text-black/75"> · {course.details}</span>}
              </li>
            ))}
          </ul>
        </ResumeSection>
      )}

      {resume.availability && (
        <ResumeSection title={t.availability}>
          <p className="text-sm">{resume.availability}</p>
        </ResumeSection>
      )}
    </article>
  );
}

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  const id = `curriculo-${slugify(title)}`;
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className="text-xs font-semibold tracking-widest text-muted-foreground uppercase print:text-black">
        {title}
      </h2>
      {children}
    </section>
  );
}
