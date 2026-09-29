// lib/content/profile.ts
// Conteúdo fixo do portfólio (textos e links). Separado dos componentes para que
// editar o texto não exija mexer em layout.

export const PROFILE = {
  name: "Odilon de Campos",
  role: "Desenvolvedor Full-Stack",
  bio: "Criando soluções digitais com tecnologias modernas. Apaixonado por código limpo, performance e experiência do usuário.",
  resumeUrl:
    "https://docs.google.com/document/d/1p8Dg2LF-acbwpfGUGaTkE2P543XlWjN9Bu5pX3V18Ts/edit?usp=sharing",
  photos: ["/perfil.svg", "/perfil-3.jpeg", "/perfil-4.jpeg"],
} as const;

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

export const ABOUT: AboutBlock[] = [
  {
    title: "Competências técnicas",
    paragraphs: [
      "Desenvolvedor Full-Stack com foco em JavaScript/TypeScript, Node.js (Express/Nest.js) e React/Next.js.",
      "Experiência prática na criação de APIs RESTful e Single-Page Applications (SPA). Proficiência em MySQL/PostgreSQL e Git/GitHub.",
      "Interesse contínuo em aprimorar habilidades técnicas e explorar novas tecnologias.",
    ],
    highlights: [
      { text: "Full-Stack" },
      { text: "JavaScript/TypeScript" },
      { text: "Node.js" },
      { text: "Express/Nest.js" },
      { text: "React/Next.js" },
      { text: "APIs RESTful" },
      { text: "Single-Page Applications" },
      { text: "MySQL/PostgreSQL" },
      { text: "Git/GitHub" },
    ],
  },
  {
    title: "Competências pessoais",
    paragraphs: [
      "Profissional curioso, proativo e comunicativo, com facilidade de aprendizado e adaptação a novas ferramentas.",
      "Boa capacidade de trabalho em equipe e motivação para contribuir em projetos desafiadores e aprender com profissionais experientes.",
    ],
    highlights: [
      { text: "curioso" },
      { text: "proativo" },
      { text: "comunicativo" },
      { text: "trabalho em equipe" },
    ],
  },
  {
    title: "Formação",
    paragraphs: [
      "Cursando Análise e Desenvolvimento de Sistemas na PUC Minas.",
      "Formado em Desenvolvimento Web pelo programa Programadores do Amanhã, com foco em tecnologia e empregabilidade.",
      "Buscando oportunidade como Desenvolvedor Full-Stack para aplicar meus conhecimentos na prática.",
    ],
    highlights: [
      { text: "Análise e Desenvolvimento de Sistemas" },
      { text: "PUC Minas" },
      { text: "Programadores do Amanhã", href: "https://programadoresdoamanha.org.br/pt" },
    ],
  },
];

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
