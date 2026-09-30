// lib/resume-pdf.tsx
// PDF do currículo gerado no servidor (@react-pdf/renderer). Mesma ResumeView da
// página HTML. Helvetica embutida: cobre acentos do português e é lida por ATS.
import "server-only";

import { Document, Link, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { ResumeEntry, ResumeView } from "@/lib/content/resume";

const styles = StyleSheet.create({
  page: { paddingVertical: 40, paddingHorizontal: 48, fontFamily: "Helvetica", fontSize: 10, lineHeight: 1.45, color: "#111" },
  header: { borderBottomWidth: 1, borderBottomColor: "#ccc", paddingBottom: 12, marginBottom: 14 },
  name: { fontFamily: "Helvetica-Bold", fontSize: 22, lineHeight: 1.2 },
  role: { fontSize: 12, marginTop: 4, color: "#333" },
  meta: { flexDirection: "row", flexWrap: "wrap", marginTop: 6, color: "#444" },
  metaItem: { marginRight: 12 },
  link: { color: "#00629a", textDecoration: "none" },
  section: { marginBottom: 12 },
  sectionTitle: { fontFamily: "Helvetica-Bold", fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6, color: "#333" },
  entry: { marginBottom: 8 },
  entryHead: { flexDirection: "row", justifyContent: "space-between" },
  entryTitle: { fontFamily: "Helvetica-Bold" },
  muted: { color: "#555" },
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Entries({ entries }: { entries: ResumeEntry[] }) {
  return entries.map((entry) => (
    <View key={`${entry.title}-${entry.organization}-${entry.period}`} style={styles.entry} wrap={false}>
      <View style={styles.entryHead}>
        <Text>
          <Text style={styles.entryTitle}>{entry.title}</Text>
          <Text style={styles.muted}> · {entry.organization}</Text>
        </Text>
        <Text style={styles.muted}>{entry.period}</Text>
      </View>
      <Text>{entry.description}</Text>
    </View>
  ));
}

function ResumePdf({ resume }: { resume: ResumeView }) {
  const sections = [
    { title: "Experiência", entries: resume.work },
    { title: "Formação", entries: resume.education },
    { title: "Certificados", entries: resume.certificates },
  ].filter((section) => section.entries.length > 0);

  return (
    <Document title={`Currículo – ${resume.name}`} author={resume.name} language="pt-BR">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{resume.name}</Text>
          <Text style={styles.role}>{resume.role}</Text>
          <View style={styles.meta}>
            {resume.contact.map((item) => (
              <Text key={item} style={styles.metaItem}>
                {item}
              </Text>
            ))}
            {resume.links.map((link) => (
              <Link key={link.url} src={link.url} style={[styles.metaItem, styles.link]}>
                {link.url.replace(/^https:\/\//, "")}
              </Link>
            ))}
          </View>
        </View>

        <Section title="Resumo">
          <Text>{resume.summary}</Text>
        </Section>

        {sections.map((section) => (
          <Section key={section.title} title={section.title}>
            <Entries entries={section.entries} />
          </Section>
        ))}

        {resume.skills.length > 0 && (
          <Section title="Competências técnicas">
            <Text>{resume.skills.join(" · ")}</Text>
          </Section>
        )}
        {resume.softSkills.length > 0 && (
          <Section title="Competências pessoais">
            <Text>{resume.softSkills.join(" · ")}</Text>
          </Section>
        )}
        {resume.languages.length > 0 && (
          <Section title="Idiomas">
            {resume.languages.map((language) => (
              <Text key={language}>{language}</Text>
            ))}
          </Section>
        )}
      </Page>
    </Document>
  );
}

/** Resposta pronta para download. */
export async function resumePdfResponse(resume: ResumeView, headers: HeadersInit = {}): Promise<Response> {
  const buffer = await renderToBuffer(<ResumePdf resume={resume} />);
  const filename = `curriculo-${resume.name.normalize("NFD").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase()}.pdf`;
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      ...headers,
    },
  });
}
