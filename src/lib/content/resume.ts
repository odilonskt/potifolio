// lib/content/resume.ts
// Currículo editado no painel: validação, conteúdo inicial e a "visão" pronta para
// exibir (página, impressão e PDF usam a mesma visão, então saem sempre iguais).
import { z } from "zod";

// ─── Validação ────────────────────────────────────────────────────────────────

const text = (label: string, min: number, max: number) =>
  z.string().trim().min(min, min > 0 ? `${label}: obrigatório` : undefined).max(max, `${label}: até ${max} caracteres`);

const optionalText = (label: string, max: number) =>
  z.preprocess((value) => (value === "" || value === null ? undefined : value), text(label, 0, max).optional());

const httpsUrl = z
  .string()
  .trim()
  .max(300)
  .url("Link inválido")
  .refine((value) => value.startsWith("https://"), "Use um link https://");

const optionalUrl = z.preprocess((value) => (value === "" || value === null ? undefined : value), httpsUrl.optional());

/** Tópicos: linhas vazias são descartadas */
const bullets = (max: number) =>
  z
    .array(z.string())
    .transform((items) => items.map((item) => item.trim()).filter(Boolean))
    .pipe(z.array(z.string().max(300, "Tópico: até 300 caracteres")).max(max, `No máximo ${max} tópicos`));

const linkSchema = z.object({ label: text("Rótulo do link", 1, 40), url: httpsUrl });

const experienceSchema = z.object({
  role: text("Cargo", 2, 100),
  organization: optionalText("Empresa", 100),
  period: text("Período", 2, 60),
  bullets: bullets(8),
});

const projectSchema = z.object({
  name: text("Nome do projeto", 2, 120),
  context: optionalText("Contexto", 60),
  bullets: bullets(6),
  linkLabel: optionalText("Rótulo do link", 30),
  linkUrl: optionalUrl,
});

const educationSchema = z.object({
  course: text("Curso", 2, 120),
  institution: text("Instituição", 2, 120),
  period: text("Período", 2, 60),
  details: optionalText("Detalhes", 200),
});

const courseSchema = z.object({
  name: text("Nome do curso", 2, 160),
  details: optionalText("Detalhes", 100),
  url: optionalUrl,
});

const skillGroupSchema = z.object({
  label: text("Grupo", 2, 40),
  items: text("Habilidades", 2, 300),
});

export const resumeInputSchema = z.object({
  name: text("Nome", 2, 80),
  headline: text("Cargo", 2, 80),
  stack: optionalText("Stack em destaque", 120),
  summary: text("Resumo", 20, 1500),
  // Privados: só no PDF baixado pelo painel, nunca na página pública
  email: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.string().trim().email("E-mail inválido").max(120).optional(),
  ),
  phone: optionalText("Telefone", 30),
  location: optionalText("Cidade", 80),
  links: z.array(linkSchema).max(6, "No máximo 6 links"),
  skills: z.array(skillGroupSchema).max(8, "No máximo 8 grupos de habilidades"),
  experience: z.array(experienceSchema).max(10, "No máximo 10 experiências"),
  projects: z.array(projectSchema).max(10, "No máximo 10 projetos"),
  education: z.array(educationSchema).max(6, "No máximo 6 formações"),
  courses: z.array(courseSchema).max(12, "No máximo 12 cursos"),
  availability: optionalText("Disponibilidade", 200),
  published: z.boolean(),
});

export type ResumeInput = z.infer<typeof resumeInputSchema>;
export type Resume = ResumeInput & { updatedAt?: string };
export type ResumeLink = z.infer<typeof linkSchema>;
export type ResumeExperience = z.infer<typeof experienceSchema>;
export type ResumeProject = z.infer<typeof projectSchema>;
export type ResumeEducation = z.infer<typeof educationSchema>;
export type ResumeCourse = z.infer<typeof courseSchema>;
export type ResumeSkillGroup = z.infer<typeof skillGroupSchema>;

/** Nomes das seções nas mensagens de erro ("Experiência 2 › Cargo: obrigatório") */
const SECTION_LABELS: Record<string, string> = {
  links: "Link",
  skills: "Habilidade",
  experience: "Experiência",
  projects: "Projeto",
  education: "Formação",
  courses: "Curso",
};

export function describeIssue(issue: z.core.$ZodIssue): string {
  const [section, index] = issue.path;
  const where =
    typeof section === "string" && typeof index === "number" && SECTION_LABELS[section]
      ? `${SECTION_LABELS[section]} ${index + 1} › `
      : "";
  return `${where}${issue.message}`;
}

// ─── Conteúdo inicial ─────────────────────────────────────────────────────────
// Montado a partir do currículo em PDF (versão consolidada). Sem e-mail, telefone
// ou cidade: esses campos ficam vazios e são preenchidos, se quiser, no painel.

export const RESUME_SEED: Resume = {
  name: "Odilon de Campos",
  headline: "Desenvolvedor Full Stack Júnior",
  stack: "JavaScript/TypeScript · React/Next.js · Node.js",
  summary:
    "Desenvolvedor Full Stack com base sólida em JavaScript/TypeScript, React/Next.js no front-end e Node.js (Express/NestJS) no back-end, com experiência em APIs RESTful, autenticação JWT e bancos de dados relacionais (MySQL/PostgreSQL). Atuo como instrutor front-end na PUC Minas e como freelancer full stack, entregando projetos reais do levantamento de requisitos à produção. Cursando Análise e Desenvolvimento de Sistemas na PUC Minas, como bolsista integral PROUNI, e formado pelo Programadores do Amanhã. Proativo, comunicativo e com rápida adaptação a novas tecnologias.",
  links: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/odilon-dev/" },
    { label: "GitHub", url: "https://github.com/odilonskt" },
    { label: "Portfólio", url: "https://potifolio-odilon.vercel.app" },
  ],
  skills: [
    { label: "Front-end", items: "HTML, CSS, JavaScript, TypeScript, React, Next.js (App Router, SSR/SSG/ISR), Tailwind CSS" },
    { label: "Back-end", items: "Node.js, Express, NestJS, APIs RESTful, autenticação JWT, arquitetura em camadas" },
    { label: "Banco de dados", items: "PostgreSQL, MySQL, Prisma, TypeORM, Firebase/Firestore" },
    { label: "Ferramentas", items: "Git/GitHub, Docker (básico), Swagger/OpenAPI, Jest, React Hook Form, Zod" },
    { label: "Idiomas", items: "Português (nativo), Inglês (intermediário)" },
    { label: "Em aprendizado", items: "Claude Code, AWS Cloud Practitioner, React Native" },
  ],
  experience: [
    {
      role: "Instrutor Front-end",
      organization: "PUC Minas",
      period: "Ago/2026 – Atual",
      bullets: [
        "Condução de meetups semanais aprofundando conteúdos de front-end, com materiais e exemplos práticos",
        "Mentoria e suporte técnico a alunos na resolução de dúvidas e no desenvolvimento de atividades",
        "Stack: HTML, CSS, JavaScript e TypeScript",
      ],
    },
    {
      role: "Desenvolvedor Full Stack Freelancer",
      period: "2025 – Atual",
      bullets: [
        "Desenvolvimento e manutenção de aplicações web full stack sob demanda com React/Next.js e Node.js",
        "Criação e consumo de APIs REST, correção de bugs e refatoração de código",
        "Levantamento de requisitos em comunicação direta com os clientes",
        "Entregas em produção: e-commerce 013 Calçados e sistema de estoque Code Lab (detalhes em Projetos)",
      ],
    },
  ],
  projects: [
    {
      name: "013 Calçados — E-commerce",
      context: "Freelance · Next.js",
      bullets: [
        "Listagem, busca e navegação de produtos; formulários com React Hook Form e Zod",
        "SSR e ISR para SEO e performance; autenticação e proteção de rotas no front-end",
      ],
      linkLabel: "Deploy",
      linkUrl: "https://013calcados.vercel.app",
    },
    {
      name: "Code Lab — Sistema de Controle de Estoque",
      context: "Freelance · Full Stack",
      bullets: [
        "Back-end com Node.js, Express, TypeScript, Prisma e PostgreSQL, autenticação JWT e documentação Swagger/OpenAPI",
        "Front-end com React, Vite e React Router; aplicação completa em produção",
      ],
      linkLabel: "Deploy",
      linkUrl: "https://code-lab-front.vercel.app",
    },
    {
      name: "Portfólio Web Pessoal",
      context: "Next.js · Firebase",
      bullets: ["Next.js, TypeScript, Tailwind CSS e Firebase, com autenticação e painel administrativo"],
      linkLabel: "Repositório",
      linkUrl: "https://github.com/odilonskt/potifolio",
    },
    {
      name: "Galeria de Fotos / Pokédex",
      context: "Next.js",
      bullets: ["Consumo da PokéAPI com Server Components, Server Actions e SSG com ISR"],
      linkLabel: "Deploy",
      linkUrl: "https://galeria-fotos-orcin.vercel.app/",
    },
    {
      name: "API REST de Doações Solidárias",
      context: "Back-end",
      bullets: [
        "Node.js, Express, Prisma e Neon Postgres, com testes automatizados em Jest",
        "Rotas para usuários, campanhas, doações, feedbacks e logs, com validação e arquitetura em camadas",
      ],
      linkLabel: "Repositório",
      linkUrl: "https://github.com/Desiree2522/M4---PROJETO-FINAL",
    },
    {
      name: "Plataforma Demais Pet — Landing Page",
      context: "Next.js",
      bullets: ["Landing page responsiva, com foco em acessibilidade (A11y) e HTML semântico"],
      linkLabel: "Deploy",
      linkUrl: "https://demaispet.vercel.app",
    },
    {
      name: "Shit Go — Plataforma Gamificada",
      context: "Hackathon Codecon Universe 2026",
      bullets: ["Front-end em equipe com Next.js, React, TypeScript e Tailwind CSS; rankings e sistema de pontuação"],
      linkLabel: "Repositório",
      linkUrl: "https://github.com/Oh-shit-here-we-go-again",
    },
  ],
  education: [
    {
      course: "Tecnólogo em Análise e Desenvolvimento de Sistemas",
      institution: "PUC Minas",
      period: "Ago/2025 – Dez/2027 (previsto)",
      details: "Bolsista integral PROUNI (100%)",
    },
    {
      course: "Desenvolvimento Web Full Stack — 720 h",
      institution: "Programadores do Amanhã",
      period: "Jul/2024 – Jul/2025",
      details: "JavaScript, Node.js, Express, Sequelize, MySQL e React; projetos em squads",
    },
    {
      course: "Técnico em Administração",
      institution: "Cesec Sete Lagoas / Pronatec",
      period: "Concluído em 2023",
    },
  ],
  courses: [
    {
      name: "Docker do Zero: Construa, Teste e Implemente Containers",
      details: "Udemy · 5 h · 2026",
      url: "https://www.udemy.com/certificate/UC-18bb938d-3188-4c18-86ad-6c0feecce39c/",
    },
    {
      name: "GitHub Copilot Dev Days LATAM",
      details: "2 h · 2026",
      url: "https://ellastech.thinkific.com/certificates/vr4wjtynga",
    },
    { name: "Hackathon Codecon Universe 2026", details: "Certificado de participação" },
    { name: "Programação Front-End com JavaScript e jQuery" },
  ],
  availability: "100% remoto, híbrido ou presencial; disponível para viagens e mudança.",
  published: false,
};

// ─── Visão para exibição ──────────────────────────────────────────────────────

export type ResumeView = Omit<Resume, "email" | "phone" | "location" | "published" | "updatedAt"> & {
  /** Vazio na versão pública */
  contact: string[];
};

/**
 * `includePrivate: false` (página e PDF públicos) remove e-mail, telefone e cidade:
 * o portfólio não publica dados pessoais de contato.
 */
export function buildResumeView(resume: Resume, { includePrivate }: { includePrivate: boolean }): ResumeView {
  const { email, phone, location } = resume;
  return {
    name: resume.name,
    headline: resume.headline,
    stack: resume.stack,
    summary: resume.summary,
    links: resume.links,
    skills: resume.skills,
    experience: resume.experience,
    projects: resume.projects,
    education: resume.education,
    courses: resume.courses,
    availability: resume.availability,
    contact: includePrivate ? [email, phone, location].filter((value): value is string => Boolean(value)) : [],
  };
}
