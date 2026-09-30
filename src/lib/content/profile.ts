// lib/content/profile.ts
// Conteúdo fixo do portfólio (textos e links), nos três idiomas. Separado dos
// componentes para que editar o texto não exija mexer em layout.
import type { Locale } from "@/lib/i18n/config";
import { defineMessages } from "@/lib/i18n/messages";

export const PROFILE = {
  name: "Odilon de Campos",
  resumeUrl:
    "https://docs.google.com/document/d/1p8Dg2LF-acbwpfGUGaTkE2P543XlWjN9Bu5pX3V18Ts/edit?usp=sharing",
  photos: ["/perfil.svg", "/perfil-3.jpeg", "/perfil-4.jpeg"],
} as const;

/** Cargo e bio em cada idioma */
export const PROFILE_TEXT = defineMessages(
  {
    role: "Desenvolvedor Full Stack",
    bio: "Criando soluções digitais com tecnologias modernas. Apaixonado por código limpo, performance e experiência do usuário.",
  },
  {
    en: {
      role: "Full Stack Developer",
      bio: "Building digital products with modern technologies. Passionate about clean code, performance and user experience.",
    },
    es: {
      role: "Desarrollador Full Stack",
      bio: "Creando soluciones digitales con tecnologías modernas. Apasionado por el código limpio, el rendimiento y la experiencia del usuario.",
    },
  },
);

export const SOCIAL_LINKS = [
  { name: "GitHub", href: "https://github.com/odilonskt" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/odilon-dev/" },
  { name: "Instagram", href: "https://www.instagram.com/odilon_skt/" },
] as const;

export type SocialName = (typeof SOCIAL_LINKS)[number]["name"];

/** Trecho destacado em negrito, opcionalmente com link. */
export type Highlight = { text: string; href?: string };

export type AboutBlock = {
  title: string;
  /** Parágrafos; cada item vira um <p> */
  paragraphs: string[];
  highlights: Highlight[];
};

const TECH_HIGHLIGHTS: Highlight[] = [
  { text: "Full-Stack" },
  { text: "JavaScript/TypeScript" },
  { text: "Node.js" },
  { text: "Express/Nest.js" },
  { text: "React/Next.js" },
  { text: "APIs RESTful" },
  { text: "Single-Page Applications" },
  { text: "MySQL/PostgreSQL" },
  { text: "Git/GitHub" },
];

const EDUCATION_HIGHLIGHTS = (course: string): Highlight[] => [
  { text: course },
  { text: "PUC Minas" },
  { text: "Programadores do Amanhã", href: "https://programadoresdoamanha.org.br/pt" },
];

// Os trechos em "highlights" precisam aparecer exatamente no texto de cada idioma
export const ABOUT: Record<Locale, AboutBlock[]> = {
  pt: [
    {
      title: "Competências técnicas",
      paragraphs: [
        "Desenvolvedor Full-Stack com foco em JavaScript/TypeScript, Node.js (Express/Nest.js) e React/Next.js.",
        "Experiência prática na criação de APIs RESTful e Single-Page Applications (SPA). Proficiência em MySQL/PostgreSQL e Git/GitHub.",
        "Interesse contínuo em aprimorar habilidades técnicas e explorar novas tecnologias.",
      ],
      highlights: TECH_HIGHLIGHTS,
    },
    {
      title: "Competências pessoais",
      paragraphs: [
        "Profissional curioso, proativo e comunicativo, com facilidade de aprendizado e adaptação a novas ferramentas.",
        "Boa capacidade de trabalho em equipe e motivação para contribuir em projetos desafiadores e aprender com profissionais experientes.",
      ],
      highlights: [{ text: "curioso" }, { text: "proativo" }, { text: "comunicativo" }, { text: "trabalho em equipe" }],
    },
    {
      title: "Formação",
      paragraphs: [
        "Cursando Análise e Desenvolvimento de Sistemas na PUC Minas.",
        "Formado em Desenvolvimento Web pelo programa Programadores do Amanhã, com foco em tecnologia e empregabilidade.",
        "Buscando oportunidade como Desenvolvedor Full-Stack para aplicar meus conhecimentos na prática.",
      ],
      highlights: EDUCATION_HIGHLIGHTS("Análise e Desenvolvimento de Sistemas"),
    },
  ],
  en: [
    {
      title: "Technical skills",
      paragraphs: [
        "Full-Stack developer focused on JavaScript/TypeScript, Node.js (Express/Nest.js) and React/Next.js.",
        "Hands-on experience building APIs RESTful and Single-Page Applications (SPA). Proficient in MySQL/PostgreSQL and Git/GitHub.",
        "Always improving my technical skills and exploring new technologies.",
      ],
      highlights: TECH_HIGHLIGHTS,
    },
    {
      title: "Soft skills",
      paragraphs: [
        "Curious, proactive and communicative professional who learns fast and adapts easily to new tools.",
        "Strong teamwork skills and motivated to contribute to challenging projects and learn from experienced professionals.",
      ],
      highlights: [{ text: "Curious" }, { text: "proactive" }, { text: "communicative" }, { text: "teamwork" }],
    },
    {
      title: "Education",
      paragraphs: [
        "Studying Systems Analysis and Development at PUC Minas.",
        "Graduated in Web Development from the Programadores do Amanhã program, focused on technology and employability.",
        "Looking for an opportunity as a Full-Stack Developer to put my knowledge into practice.",
      ],
      highlights: EDUCATION_HIGHLIGHTS("Systems Analysis and Development"),
    },
  ],
  es: [
    {
      title: "Competencias técnicas",
      paragraphs: [
        "Desarrollador Full-Stack enfocado en JavaScript/TypeScript, Node.js (Express/Nest.js) y React/Next.js.",
        "Experiencia práctica en la creación de APIs RESTful y Single-Page Applications (SPA). Dominio de MySQL/PostgreSQL y Git/GitHub.",
        "Interés constante en mejorar mis habilidades técnicas y explorar nuevas tecnologías.",
      ],
      highlights: TECH_HIGHLIGHTS,
    },
    {
      title: "Competencias personales",
      paragraphs: [
        "Profesional curioso, proactivo y comunicativo, con facilidad para aprender y adaptarse a nuevas herramientas.",
        "Buena capacidad de trabajo en equipo y motivación para contribuir en proyectos desafiantes y aprender de profesionales con experiencia.",
      ],
      highlights: [{ text: "curioso" }, { text: "proactivo" }, { text: "comunicativo" }, { text: "trabajo en equipo" }],
    },
    {
      title: "Formación",
      paragraphs: [
        "Cursando Análisis y Desarrollo de Sistemas en la PUC Minas.",
        "Formado en Desarrollo Web por el programa Programadores do Amanhã, enfocado en tecnología y empleabilidad.",
        "Buscando una oportunidad como Desarrollador Full-Stack para aplicar mis conocimientos en la práctica.",
      ],
      highlights: EDUCATION_HIGHLIGHTS("Análisis y Desarrollo de Sistemas"),
    },
  ],
};

export const TECHNOLOGIES = [
  "Next.js",
  "React",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "NestJS",
  "Express",
  "PostgreSQL",
  "Docker",
  "Tailwind",
  "Git",
  "Firebase",
  "CSS3",
  "RESTful",
] as const;

export type Technology = (typeof TECHNOLOGIES)[number];
