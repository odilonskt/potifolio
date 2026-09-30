// lib/resume-pdf.tsx
// PDF do currículo gerado no servidor (@react-pdf/renderer). Mesma ResumeView da
// página HTML. Helvetica embutida: cobre acentos do português e é lida por ATS.
import "server-only";

import { Document, Font, Link, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { ResumeView } from "@/lib/content/resume";
import { HTML_LANG, type Locale } from "@/lib/i18n/config";
import { resume as resumeMessages } from "@/lib/i18n/messages/resume";

type ResumeMessages = (typeof resumeMessages)["pt"];

// Sem hifenização automática: nomes de tecnologia não podem virar "Ex-press"
Font.registerHyphenationCallback((word) => [word]);

const ACCENT = "#1f3a68";

const styles = StyleSheet.create({
  page: { paddingVertical: 36, paddingHorizontal: 44, fontFamily: "Helvetica", fontSize: 9.5, lineHeight: 1.4, color: "#111" },
  header: { alignItems: "center", marginBottom: 10 },
  name: { fontFamily: "Helvetica-Bold", fontSize: 20, lineHeight: 1.2, color: ACCENT, textTransform: "uppercase" },
  headline: { fontSize: 11, marginTop: 3, color: "#444" },
  meta: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: 4, color: "#444" },
  metaItem: { marginHorizontal: 5 },
  link: { color: "#1a56b8", textDecoration: "none" },
  section: { marginTop: 8 },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10.5,
    color: ACCENT,
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: ACCENT,
    paddingBottom: 2,
    marginBottom: 5,
  },
  entry: { marginBottom: 6 },
  entryHead: { flexDirection: "row", justifyContent: "space-between" },
  bold: { fontFamily: "Helvetica-Bold" },
  muted: { color: "#555" },
  italic: { fontFamily: "Helvetica-Oblique", color: "#555" },
  bullet: { flexDirection: "row", paddingLeft: 8, marginTop: 1 },
  bulletMark: { width: 8 },
  bulletText: { flex: 1 },
  skillRow: { flexDirection: "row", marginBottom: 2 },
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Bullets({ items }: { items: string[] }) {
  return items.map((item) => (
    <View key={item} style={styles.bullet}>
      <Text style={styles.bulletMark}>•</Text>
      <Text style={styles.bulletText}>{item}</Text>
    </View>
  ));
}

function EntryHead({ title, subtitle, period }: { title: string; subtitle?: string; period?: string }) {
  return (
    <View style={styles.entryHead}>
      <Text>
        <Text style={styles.bold}>{title}</Text>
        {subtitle ? <Text style={styles.muted}> · {subtitle}</Text> : null}
      </Text>
      {period ? <Text style={styles.italic}>{period}</Text> : null}
    </View>
  );
}

const shortUrl = (url: string) => url.replace(/^https:\/\//, "").replace(/\/$/, "");

function ResumePdf({ resume, t, locale }: { resume: ResumeView; t: ResumeMessages; locale: Locale }) {
  return (
    <Document title={t.pdfTitle(resume.name)} author={resume.name} language={HTML_LANG[locale]}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{resume.name}</Text>
          <Text style={styles.headline}>
            {resume.headline}
            {resume.stack ? ` • ${resume.stack}` : ""}
          </Text>
          {resume.contact.length > 0 && (
            <View style={styles.meta}>
              {resume.contact.map((item) => (
                <Text key={item} style={styles.metaItem}>
                  {item}
                </Text>
              ))}
            </View>
          )}
          <View style={styles.meta}>
            {resume.links.map((link) => (
              <Link key={link.url} src={link.url} style={[styles.metaItem, styles.link]}>
                {link.label}: {shortUrl(link.url)}
              </Link>
            ))}
          </View>
        </View>

        <Section title={t.sections.profile}>
          <Text>{resume.summary}</Text>
        </Section>

        {resume.skills.length > 0 && (
          <Section title={t.sections.skills}>
            {resume.skills.map((group) => (
              <Text key={group.label} style={styles.skillRow}>
                <Text style={styles.bold}>{group.label}: </Text>
                {group.items}
              </Text>
            ))}
          </Section>
        )}

        {resume.experience.length > 0 && (
          <Section title={t.sections.experience}>
            {resume.experience.map((item) => (
              <View key={`${item.role}-${item.period}`} style={styles.entry} wrap={false}>
                <EntryHead title={item.role} subtitle={item.organization} period={item.period} />
                <Bullets items={item.bullets} />
              </View>
            ))}
          </Section>
        )}

        {resume.projects.length > 0 && (
          <Section title={t.sections.projects}>
            {resume.projects.map((project) => (
              <View key={project.name} style={styles.entry} wrap={false}>
                <EntryHead title={project.name} subtitle={project.context} />
                <Bullets items={project.bullets} />
                {project.linkUrl ? (
                  <Text>
                    {project.linkLabel || t.link}:{" "}
                    <Link src={project.linkUrl} style={styles.link}>
                      {shortUrl(project.linkUrl)}
                    </Link>
                  </Text>
                ) : null}
              </View>
            ))}
          </Section>
        )}

        {resume.education.length > 0 && (
          <Section title={t.sections.education}>
            {resume.education.map((item) => (
              <View key={`${item.course}-${item.institution}`} style={styles.entry} wrap={false}>
                <EntryHead title={item.course} period={item.period} />
                <Text style={styles.italic}>
                  {item.institution}
                  {item.details ? ` — ${item.details}` : ""}
                </Text>
              </View>
            ))}
          </Section>
        )}

        {resume.courses.length > 0 && (
          <Section title={t.sections.courses}>
            <Bullets items={resume.courses.map((course) => (course.details ? `${course.name} (${course.details})` : course.name))} />
          </Section>
        )}

        {resume.availability && (
          <Text style={{ marginTop: 8 }}>
            <Text style={styles.bold}>{t.sections.availability}: </Text>
            {resume.availability}
          </Text>
        )}
      </Page>
    </Document>
  );
}

/** Resposta pronta para download. */
export async function resumePdfResponse(resume: ResumeView, locale: Locale, headers: HeadersInit = {}): Promise<Response> {
  const t = resumeMessages[locale];
  const buffer = await renderToBuffer(<ResumePdf resume={resume} t={t} locale={locale} />);
  const filename = `${t.fileName}-${resume.name.normalize("NFD").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase()}.pdf`;
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      ...headers,
    },
  });
}
