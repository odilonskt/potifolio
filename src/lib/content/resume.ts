// lib/content/resume.ts
// Currículo editado no painel: validação, conteúdo inicial e a "visão" pronta para
// exibir (página, impressão e PDF usam a mesma visão, então saem sempre iguais).
// Cada idioma tem a sua versão do currículo; a publicação é controlada pela versão pt.
import { z } from "zod";

import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { resume as resumeMessages } from "@/lib/i18n/messages/resume";

// ─── Validação ────────────────────────────────────────────────────────────────

/** Schema com as mensagens de erro no idioma de quem edita. */
export function createResumeSchema(locale: Locale = DEFAULT_LOCALE) {
  const v = resumeMessages[locale].validation;
  const l = v.labels;

  const text = (label: string, min: number, max: number) =>
    z.string().trim().min(min, min > 0 ? v.required(label) : undefined).max(max, v.tooLong(label, max));

  const optionalText = (label: string, max: number) =>
    z.preprocess((value) => (value === "" || value === null ? undefined : value), text(label, 0, max).optional());

  const httpsUrl = z
    .string()
    .trim()
    .max(300)
    .url(v.invalidLink)
    .refine((value) => value.startsWith("https://"), v.httpsOnly);

  const optionalUrl = z.preprocess((value) => (value === "" || value === null ? undefined : value), httpsUrl.optional());

  /** Tópicos: linhas vazias são descartadas */
  const bullets = (max: number) =>
    z
      .array(z.string())
      .transform((items) => items.map((item) => item.trim()).filter(Boolean))
      .pipe(z.array(z.string().max(300, v.bulletTooLong)).max(max, v.maxItems(max, v.lists.bullets)));

  return z.object({
    name: text(l.name, 2, 80),
    headline: text(l.headline, 2, 80),
    stack: optionalText(l.stack, 120),
    summary: text(l.summary, 20, 1500),
    // Contato: obrigatório e impresso no PDF (para empresas chamarem), mas nunca
    // exibido na página pública, para robôs não coletarem os dados
    email: z.string().trim().min(1, { error: v.required(l.email), abort: true }).email(v.invalidEmail).max(120),
    phone: z
      .string()
      .trim()
      .min(1, { error: v.required(l.phone), abort: true })
      .max(30)
      .refine((value) => /^[0-9+()\s-]{10,20}$/.test(value), v.invalidPhone),
    location: optionalText(l.location, 80),
    links: z.array(z.object({ label: text(l.linkLabel, 1, 40), url: httpsUrl })).max(6, v.maxItems(6, v.lists.links)),
    skills: z
      .array(z.object({ label: text(l.group, 2, 40), items: text(l.skills, 2, 300) }))
      .max(8, v.maxItems(8, v.lists.skills)),
    experience: z
      .array(
        z.object({
          role: text(l.role, 2, 100),
          organization: optionalText(l.organization, 100),
          period: text(l.period, 2, 60),
          bullets: bullets(8),
        }),
      )
      .max(10, v.maxItems(10, v.lists.experience)),
    projects: z
      .array(
        z.object({
          name: text(l.projectName, 2, 120),
          context: optionalText(l.context, 60),
          bullets: bullets(6),
          linkLabel: optionalText(l.linkLabel, 30),
          linkUrl: optionalUrl,
        }),
      )
      .max(10, v.maxItems(10, v.lists.projects)),
    education: z
      .array(
        z.object({
          course: text(l.course, 2, 120),
          institution: text(l.institution, 2, 120),
          period: text(l.period, 2, 60),
          details: optionalText(l.details, 200),
        }),
      )
      .max(6, v.maxItems(6, v.lists.education)),
    courses: z
      .array(z.object({ name: text(l.courseName, 2, 160), details: optionalText(l.details, 100), url: optionalUrl }))
      .max(12, v.maxItems(12, v.lists.courses)),
    availability: optionalText(l.availability, 200),
    published: z.boolean(),
  });
}

export type ResumeInput = z.infer<ReturnType<typeof createResumeSchema>>;
export type Resume = ResumeInput & { updatedAt?: string };
export type ResumeLink = ResumeInput["links"][number];
export type ResumeExperience = ResumeInput["experience"][number];
export type ResumeProject = ResumeInput["projects"][number];
export type ResumeEducation = ResumeInput["education"][number];
export type ResumeCourse = ResumeInput["courses"][number];
export type ResumeSkillGroup = ResumeInput["skills"][number];

const SECTION_KEYS = ["links", "skills", "experience", "projects", "education", "courses"] as const;

/** "Experiência 2 › Cargo: obrigatório" / "Experience 2 › Role: required" */
export function describeIssue(issue: z.core.$ZodIssue, locale: Locale = DEFAULT_LOCALE): string {
  const sections = resumeMessages[locale].validation.sections;
  const [section, index] = issue.path;
  const known = SECTION_KEYS.find((key) => key === section);
  const where = known && typeof index === "number" ? `${sections[known]} ${index + 1} › ` : "";
  return `${where}${issue.message}`;
}

// ─── Conteúdo inicial ─────────────────────────────────────────────────────────
// Montado a partir do currículo em PDF (versão consolidada) e traduzido. E-mail e
// celular não ficam no código: são preenchidos no painel (obrigatórios para salvar).

const LINKS = {
  linkedin: "https://www.linkedin.com/in/odilon-dev/",
  github: "https://github.com/odilonskt",
  portfolio: "https://potifolio-odilon.vercel.app",
  calcados: "https://013calcados.vercel.app",
  codeLab: "https://code-lab-front.vercel.app",
  repoPortfolio: "https://github.com/odilonskt/potifolio",
  pokedex: "https://galeria-fotos-orcin.vercel.app/",
  donations: "https://github.com/Desiree2522/M4---PROJETO-FINAL",
  demaisPet: "https://demaispet.vercel.app",
  shitGo: "https://github.com/Oh-shit-here-we-go-again",
  docker: "https://www.udemy.com/certificate/UC-18bb938d-3188-4c18-86ad-6c0feecce39c/",
  copilot: "https://ellastech.thinkific.com/certificates/vr4wjtynga",
};

const SEED_PT: Resume = {
  name: "Odilon de Campos",
  headline: "Desenvolvedor Full Stack Júnior",
  email: "",
  phone: "",
  stack: "JavaScript/TypeScript · React/Next.js · Node.js",
  summary:
    "Desenvolvedor Full Stack com base sólida em JavaScript/TypeScript, React/Next.js no front-end e Node.js (Express/NestJS) no back-end, com experiência em APIs RESTful, autenticação JWT e bancos de dados relacionais (MySQL/PostgreSQL). Atuo como instrutor front-end na PUC Minas e como freelancer full stack, entregando projetos reais do levantamento de requisitos à produção. Cursando Análise e Desenvolvimento de Sistemas na PUC Minas, como bolsista integral PROUNI, e formado pelo Programadores do Amanhã. Proativo, comunicativo e com rápida adaptação a novas tecnologias.",
  links: [
    { label: "LinkedIn", url: LINKS.linkedin },
    { label: "GitHub", url: LINKS.github },
    { label: "Portfólio", url: LINKS.portfolio },
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
      linkUrl: LINKS.calcados,
    },
    {
      name: "Code Lab — Sistema de Controle de Estoque",
      context: "Freelance · Full Stack",
      bullets: [
        "Back-end com Node.js, Express, TypeScript, Prisma e PostgreSQL, autenticação JWT e documentação Swagger/OpenAPI",
        "Front-end com React, Vite e React Router; aplicação completa em produção",
      ],
      linkLabel: "Deploy",
      linkUrl: LINKS.codeLab,
    },
    {
      name: "Portfólio Web Pessoal",
      context: "Next.js · Firebase",
      bullets: ["Next.js, TypeScript, Tailwind CSS e Firebase, com autenticação e painel administrativo"],
      linkLabel: "Repositório",
      linkUrl: LINKS.repoPortfolio,
    },
    {
      name: "Galeria de Fotos / Pokédex",
      context: "Next.js",
      bullets: ["Consumo da PokéAPI com Server Components, Server Actions e SSG com ISR"],
      linkLabel: "Deploy",
      linkUrl: LINKS.pokedex,
    },
    {
      name: "API REST de Doações Solidárias",
      context: "Back-end",
      bullets: [
        "Node.js, Express, Prisma e Neon Postgres, com testes automatizados em Jest",
        "Rotas para usuários, campanhas, doações, feedbacks e logs, com validação e arquitetura em camadas",
      ],
      linkLabel: "Repositório",
      linkUrl: LINKS.donations,
    },
    {
      name: "Plataforma Demais Pet — Landing Page",
      context: "Next.js",
      bullets: ["Landing page responsiva, com foco em acessibilidade (A11y) e HTML semântico"],
      linkLabel: "Deploy",
      linkUrl: LINKS.demaisPet,
    },
    {
      name: "Shit Go — Plataforma Gamificada",
      context: "Hackathon Codecon Universe 2026",
      bullets: ["Front-end em equipe com Next.js, React, TypeScript e Tailwind CSS; rankings e sistema de pontuação"],
      linkLabel: "Repositório",
      linkUrl: LINKS.shitGo,
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
    { course: "Técnico em Administração", institution: "Cesec Sete Lagoas / Pronatec", period: "Concluído em 2023" },
  ],
  courses: [
    { name: "Docker do Zero: Construa, Teste e Implemente Containers", details: "Udemy · 5 h · 2026", url: LINKS.docker },
    { name: "GitHub Copilot Dev Days LATAM", details: "2 h · 2026", url: LINKS.copilot },
    { name: "Hackathon Codecon Universe 2026", details: "Certificado de participação" },
    { name: "Programação Front-End com JavaScript e jQuery" },
  ],
  availability: "100% remoto, híbrido ou presencial; disponível para viagens e mudança.",
  published: false,
};

const SEED_EN: Resume = {
  ...SEED_PT,
  headline: "Junior Full Stack Developer",
  summary:
    "Full Stack developer with a solid foundation in JavaScript/TypeScript, React/Next.js on the front end and Node.js (Express/NestJS) on the back end, experienced with RESTful APIs, JWT authentication and relational databases (MySQL/PostgreSQL). I work as a front-end instructor at PUC Minas and as a freelance full stack developer, delivering real projects from requirements gathering to production. Studying Systems Analysis and Development at PUC Minas on a full PROUNI scholarship, and a graduate of the Programadores do Amanhã program. Proactive, communicative and quick to adapt to new technologies.",
  links: [
    { label: "LinkedIn", url: LINKS.linkedin },
    { label: "GitHub", url: LINKS.github },
    { label: "Portfolio", url: LINKS.portfolio },
  ],
  skills: [
    { label: "Front-end", items: "HTML, CSS, JavaScript, TypeScript, React, Next.js (App Router, SSR/SSG/ISR), Tailwind CSS" },
    { label: "Back-end", items: "Node.js, Express, NestJS, RESTful APIs, JWT authentication, layered architecture" },
    { label: "Databases", items: "PostgreSQL, MySQL, Prisma, TypeORM, Firebase/Firestore" },
    { label: "Tools", items: "Git/GitHub, Docker (basic), Swagger/OpenAPI, Jest, React Hook Form, Zod" },
    { label: "Languages", items: "Portuguese (native), English (intermediate)" },
    { label: "Currently learning", items: "Claude Code, AWS Cloud Practitioner, React Native" },
  ],
  experience: [
    {
      role: "Front-end Instructor",
      organization: "PUC Minas",
      period: "Aug 2026 – Present",
      bullets: [
        "Lead weekly meetups that go deeper into front-end topics, with hands-on materials and examples",
        "Mentor students and provide technical support with questions and assignments",
        "Stack: HTML, CSS, JavaScript and TypeScript",
      ],
    },
    {
      role: "Freelance Full Stack Developer",
      period: "2025 – Present",
      bullets: [
        "Build and maintain full stack web applications on demand with React/Next.js and Node.js",
        "Create and consume REST APIs, fix bugs and refactor code",
        "Gather requirements in direct communication with clients",
        "Shipped to production: the 013 Calçados e-commerce and the Code Lab inventory system (see Projects)",
      ],
    },
  ],
  projects: [
    {
      name: "013 Calçados — E-commerce",
      context: "Freelance · Next.js",
      bullets: [
        "Product listing, search and navigation; forms with React Hook Form and Zod",
        "SSR and ISR for SEO and performance; front-end authentication and route protection",
      ],
      linkLabel: "Live",
      linkUrl: LINKS.calcados,
    },
    {
      name: "Code Lab — Inventory Management System",
      context: "Freelance · Full Stack",
      bullets: [
        "Back end with Node.js, Express, TypeScript, Prisma and PostgreSQL, JWT authentication and Swagger/OpenAPI docs",
        "Front end with React, Vite and React Router; complete application running in production",
      ],
      linkLabel: "Live",
      linkUrl: LINKS.codeLab,
    },
    {
      name: "Personal Portfolio Website",
      context: "Next.js · Firebase",
      bullets: ["Next.js, TypeScript, Tailwind CSS and Firebase, with authentication and an admin dashboard"],
      linkLabel: "Repository",
      linkUrl: LINKS.repoPortfolio,
    },
    {
      name: "Photo Gallery / Pokédex",
      context: "Next.js",
      bullets: ["Consumes the PokéAPI with Server Components, Server Actions and SSG with ISR"],
      linkLabel: "Live",
      linkUrl: LINKS.pokedex,
    },
    {
      name: "Solidarity Donations REST API",
      context: "Back end",
      bullets: [
        "Node.js, Express, Prisma and Neon Postgres, with automated tests in Jest",
        "Routes for users, campaigns, donations, feedback and logs, with validation and layered architecture",
      ],
      linkLabel: "Repository",
      linkUrl: LINKS.donations,
    },
    {
      name: "Demais Pet Platform — Landing Page",
      context: "Next.js",
      bullets: ["Responsive landing page focused on accessibility (A11y) and semantic HTML"],
      linkLabel: "Live",
      linkUrl: LINKS.demaisPet,
    },
    {
      name: "Shit Go — Gamified Platform",
      context: "Hackathon Codecon Universe 2026",
      bullets: ["Team front end with Next.js, React, TypeScript and Tailwind CSS; rankings and a points system"],
      linkLabel: "Repository",
      linkUrl: LINKS.shitGo,
    },
  ],
  education: [
    {
      course: "Associate Degree in Systems Analysis and Development",
      institution: "PUC Minas",
      period: "Aug 2025 – Dec 2027 (expected)",
      details: "Full PROUNI scholarship (100%)",
    },
    {
      course: "Full Stack Web Development — 720 h",
      institution: "Programadores do Amanhã",
      period: "Jul 2024 – Jul 2025",
      details: "JavaScript, Node.js, Express, Sequelize, MySQL and React; squad-based projects",
    },
    { course: "Technical Degree in Business Administration", institution: "Cesec Sete Lagoas / Pronatec", period: "Completed in 2023" },
  ],
  courses: [
    { name: "Docker from Scratch: Build, Test and Deploy Containers", details: "Udemy · 5 h · 2026", url: LINKS.docker },
    { name: "GitHub Copilot Dev Days LATAM", details: "2 h · 2026", url: LINKS.copilot },
    { name: "Hackathon Codecon Universe 2026", details: "Certificate of participation" },
    { name: "Front-End Programming with JavaScript and jQuery" },
  ],
  availability: "Open to fully remote, hybrid or on-site work; available to travel and relocate.",
};

const SEED_ES: Resume = {
  ...SEED_PT,
  headline: "Desarrollador Full Stack Junior",
  summary:
    "Desarrollador Full Stack con una base sólida en JavaScript/TypeScript, React/Next.js en el front-end y Node.js (Express/NestJS) en el back-end, con experiencia en APIs RESTful, autenticación JWT y bases de datos relacionales (MySQL/PostgreSQL). Trabajo como instructor front-end en la PUC Minas y como freelancer full stack, entregando proyectos reales desde el levantamiento de requisitos hasta producción. Estudio Análisis y Desarrollo de Sistemas en la PUC Minas con beca completa PROUNI y soy egresado del programa Programadores do Amanhã. Proactivo, comunicativo y con rápida adaptación a nuevas tecnologías.",
  links: [
    { label: "LinkedIn", url: LINKS.linkedin },
    { label: "GitHub", url: LINKS.github },
    { label: "Portafolio", url: LINKS.portfolio },
  ],
  skills: [
    { label: "Front-end", items: "HTML, CSS, JavaScript, TypeScript, React, Next.js (App Router, SSR/SSG/ISR), Tailwind CSS" },
    { label: "Back-end", items: "Node.js, Express, NestJS, APIs RESTful, autenticación JWT, arquitectura en capas" },
    { label: "Bases de datos", items: "PostgreSQL, MySQL, Prisma, TypeORM, Firebase/Firestore" },
    { label: "Herramientas", items: "Git/GitHub, Docker (básico), Swagger/OpenAPI, Jest, React Hook Form, Zod" },
    { label: "Idiomas", items: "Portugués (nativo), Inglés (intermedio)" },
    { label: "Aprendiendo", items: "Claude Code, AWS Cloud Practitioner, React Native" },
  ],
  experience: [
    {
      role: "Instructor Front-end",
      organization: "PUC Minas",
      period: "Ago/2026 – Actualidad",
      bullets: [
        "Conducción de meetups semanales que profundizan en contenidos de front-end, con materiales y ejemplos prácticos",
        "Mentoría y soporte técnico a estudiantes en la resolución de dudas y el desarrollo de actividades",
        "Stack: HTML, CSS, JavaScript y TypeScript",
      ],
    },
    {
      role: "Desarrollador Full Stack Freelancer",
      period: "2025 – Actualidad",
      bullets: [
        "Desarrollo y mantenimiento de aplicaciones web full stack a medida con React/Next.js y Node.js",
        "Creación y consumo de APIs REST, corrección de bugs y refactorización de código",
        "Levantamiento de requisitos en comunicación directa con los clientes",
        "Entregas en producción: el e-commerce 013 Calçados y el sistema de inventario Code Lab (detalles en Proyectos)",
      ],
    },
  ],
  projects: [
    {
      name: "013 Calçados — E-commerce",
      context: "Freelance · Next.js",
      bullets: [
        "Listado, búsqueda y navegación de productos; formularios con React Hook Form y Zod",
        "SSR e ISR para SEO y rendimiento; autenticación y protección de rutas en el front-end",
      ],
      linkLabel: "Deploy",
      linkUrl: LINKS.calcados,
    },
    {
      name: "Code Lab — Sistema de Control de Inventario",
      context: "Freelance · Full Stack",
      bullets: [
        "Back-end con Node.js, Express, TypeScript, Prisma y PostgreSQL, autenticación JWT y documentación Swagger/OpenAPI",
        "Front-end con React, Vite y React Router; aplicación completa en producción",
      ],
      linkLabel: "Deploy",
      linkUrl: LINKS.codeLab,
    },
    {
      name: "Portafolio Web Personal",
      context: "Next.js · Firebase",
      bullets: ["Next.js, TypeScript, Tailwind CSS y Firebase, con autenticación y panel administrativo"],
      linkLabel: "Repositorio",
      linkUrl: LINKS.repoPortfolio,
    },
    {
      name: "Galería de Fotos / Pokédex",
      context: "Next.js",
      bullets: ["Consumo de la PokéAPI con Server Components, Server Actions y SSG con ISR"],
      linkLabel: "Deploy",
      linkUrl: LINKS.pokedex,
    },
    {
      name: "API REST de Donaciones Solidarias",
      context: "Back-end",
      bullets: [
        "Node.js, Express, Prisma y Neon Postgres, con pruebas automatizadas en Jest",
        "Rutas para usuarios, campañas, donaciones, feedbacks y logs, con validación y arquitectura en capas",
      ],
      linkLabel: "Repositorio",
      linkUrl: LINKS.donations,
    },
    {
      name: "Plataforma Demais Pet — Landing Page",
      context: "Next.js",
      bullets: ["Landing page responsive, enfocada en accesibilidad (A11y) y HTML semántico"],
      linkLabel: "Deploy",
      linkUrl: LINKS.demaisPet,
    },
    {
      name: "Shit Go — Plataforma Gamificada",
      context: "Hackathon Codecon Universe 2026",
      bullets: ["Front-end en equipo con Next.js, React, TypeScript y Tailwind CSS; rankings y sistema de puntos"],
      linkLabel: "Repositorio",
      linkUrl: LINKS.shitGo,
    },
  ],
  education: [
    {
      course: "Tecnólogo en Análisis y Desarrollo de Sistemas",
      institution: "PUC Minas",
      period: "Ago/2025 – Dic/2027 (previsto)",
      details: "Beca completa PROUNI (100%)",
    },
    {
      course: "Desarrollo Web Full Stack — 720 h",
      institution: "Programadores do Amanhã",
      period: "Jul/2024 – Jul/2025",
      details: "JavaScript, Node.js, Express, Sequelize, MySQL y React; proyectos en squads",
    },
    { course: "Técnico en Administración", institution: "Cesec Sete Lagoas / Pronatec", period: "Finalizado en 2023" },
  ],
  courses: [
    { name: "Docker desde Cero: Construye, Prueba e Implementa Contenedores", details: "Udemy · 5 h · 2026", url: LINKS.docker },
    { name: "GitHub Copilot Dev Days LATAM", details: "2 h · 2026", url: LINKS.copilot },
    { name: "Hackathon Codecon Universe 2026", details: "Certificado de participación" },
    { name: "Programación Front-End con JavaScript y jQuery" },
  ],
  availability: "Disponible para trabajo 100% remoto, híbrido o presencial; disponible para viajar y mudarme.",
};

export const RESUME_SEED: Record<Locale, Resume> = { pt: SEED_PT, en: SEED_EN, es: SEED_ES };

// ─── Visão para exibição ──────────────────────────────────────────────────────

export type ResumeView = Omit<Resume, "email" | "phone" | "location" | "published" | "updatedAt"> & {
  /** Vazio na página pública */
  contact: string[];
};

/**
 * `withContact: true` para o PDF (e a prévia do painel): leva e-mail, celular e cidade.
 * `withContact: false` para a página pública: esses dados nem chegam ao HTML.
 */
export function buildResumeView(resume: Resume, { withContact }: { withContact: boolean }): ResumeView {
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
    contact: withContact ? [email, phone, location].filter((value): value is string => Boolean(value)) : [],
  };
}
