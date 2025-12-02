import Link from "next/link";
import Titan from "../titan/page";

interface SobreProps {
  descrition_softSkill: string;
  descrition_hardSkill: string;
  descrition_estudo: string;
  id?: string;
}

interface PalavraLink {
  palavra: string;
  href: string;
  descricao?: string;
  target: string;
}

// Função 1: Apenas negrito
function formatarTextoComNegrito(texto: string, palavrasNegrito: string[]) {
  if (!palavrasNegrito.length) return texto;

  const regex = new RegExp(`(${palavrasNegrito.join("|")})`, "gi");
  const partes = texto.split(regex);

  return partes.map((parte, index) =>
    palavrasNegrito.some(
      (palavra) => parte.toLowerCase() === palavra.toLowerCase()
    ) ? (
      <strong key={index} className="font-bold text-white">
        {parte}
      </strong>
    ) : (
      <span key={index}>{parte}</span>
    )
  );
}

// Função 2: Apenas links (com strong incluído)
function formatarTextoComLinks(texto: string, palavrasLinks: PalavraLink[]) {
  if (!palavrasLinks.length) return texto;

  const regex = new RegExp(
    `(${palavrasLinks.map((p) => p.palavra).join("|")})`,
    "gi"
  );
  const partes = texto.split(regex);

  return partes.map((parte, index) => {
    const palavraLink = palavrasLinks.find(
      (p) => parte.toLowerCase() === p.palavra.toLowerCase()
    );

    if (palavraLink) {
      return (
        <strong key={index}>
          <Link
            href={palavraLink.href}
            className="font-bold text-white hover:text-blue-400 transition-colors duration-300 underline underline-offset-4"
            title={palavraLink.descricao || `Ir para ${palavraLink.palavra}`}
            target={palavraLink.target}
          >
            {parte}
          </Link>
        </strong>
      );
    }

    return <span key={index}>{parte}</span>;
  });
}

// Função 3: Combinada - palavras com link ficam em strong+link, outras em strong apenas
function formatarTextoComLinksENegrito(
  texto: string,
  palavrasLinks: PalavraLink[],
  palavrasNegrito: string[]
) {
  if (!palavrasLinks.length && !palavrasNegrito.length) return texto;

  // Combinar todas as palavras para o regex
  const todasPalavras = [
    ...palavrasLinks.map((p) => p.palavra),
    ...palavrasNegrito,
  ];

  const regex = new RegExp(`(${todasPalavras.join("|")})`, "gi");
  const partes = texto.split(regex);

  return partes.map((parte, index) => {
    if (!parte) return null;

    // Primeiro verificar se é uma palavra com link
    const palavraLink = palavrasLinks.find(
      (p) => p.palavra.toLowerCase() === parte.toLowerCase()
    );

    if (palavraLink) {
      return (
        <strong key={index}>
          <Link
            href={palavraLink.href}
            className="font-bold text-white hover:text-blue-400 transition-colors duration-300 underline underline-offset-4"
            title={palavraLink.descricao || `Ir para ${palavraLink.palavra}`}
            target={palavraLink.target}
          >
            {parte}
          </Link>
        </strong>
      );
    }

    // Depois verificar se é uma palavra para negrito (sem link)
    const palavraNegrito = palavrasNegrito.find(
      (p) => p.toLowerCase() === parte.toLowerCase()
    );

    if (palavraNegrito) {
      return (
        <strong key={index} className="font-bold text-white">
          {parte}
        </strong>
      );
    }

    return <span key={index}>{parte}</span>;
  });
}

const palavrasComLinks: PalavraLink[] = [
  // {
  //   palavra: "Full Stack",
  //   href: "#",
  //   descricao: "Desenvolvedor Full Stack",
  // },
  // {
  //   palavra: "JavaScript",
  //   href: "#",
  //   descricao: "Linguagem JavaScript",
  // },
  // {
  //   palavra: "TypeScript",
  //   href: "#",
  //   descricao: "Linguagem TypeScript",
  // },
  // {
  //   palavra: "Node.js",
  //   href: "#",
  //   descricao: "Runtime Node.js",
  // },
  // {
  //   palavra: "Express",
  //   href: "#",
  //   descricao: "Framework Express",
  // },
  // {
  //   palavra: "React",
  //   href: "#",
  //   descricao: "Biblioteca React",
  // },
  // {
  //   palavra: "Next.js",
  //   href: "#",
  //   descricao: "Framework Next.js",
  // },
  // {
  //   palavra: "Nest.js",
  //   href: "#",
  //   descricao: "Framework NestJS",
  // },
  // {
  //   palavra: "MySQL",
  //   href: "#",
  //   descricao: "Banco MySQL",
  // },
  // {
  //   palavra: "PostgreSQL",
  //   href: "#",
  //   descricao: "Banco PostgreSQL",
  // },
  // {
  //   palavra: "Git",
  //   href: "#",
  //   descricao: "Sistema Git",
  // },
  // {
  //   palavra: "GitHub",
  //   href: "#",
  //   descricao: "Plataforma GitHub",
  // },
  {
    palavra: "Programadores do Amanhã",
    href: "https://programadoresdoamanha.org.br/pt",
    descricao: "Programa Programadores do Amanhã",
    target: "_blank",
  },
];

const palavrasNegritoHardSkills = [
  "Full-Stack",
  "JavaScript/TypeScript",
  "Node.js",
  "Express/Nest.js",
  "React/Next.js",
  "APIs RESTful",
  "Single-Page Applications",
  "SPA",
  "MySQL/PostgreSQL",
  "Git/GitHub",
];

const palavrasNegritoSoftSkills = [
  "curioso",
  "proativo",
  "comunicativo",
  "aprendizado",
  "adaptação",
  "equipe",
  "desafiadores",
];

const palavrasNegritoEstudo = [
  "Análise e Desenvolvimento de Sistemas",
  "PUC Minas",
  "Desenvolvedor Web",
  "Programadores do Amanhã",
  "Desenvolvedor Full Stack",
];

export default function Sobre(props: SobreProps) {
  return (
    <div
      className="w-full flex flex-col items-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
      id={props.id}
    >
      <Titan title="Sobre:" />
      <div className="w-full max-w-4xl">
        <div
          className="rounded-xl text-white border-2 sm:border-3 lg:border-4 border-white p-4 sm:p-6 lg:p-8 mt-4 sm:mt-6 lg:mt-8 
                      bg-black/20 backdrop-blur-sm shadow-xl"
        >
          <p
            className="text-base sm:text-lg md:text-xl lg:text-2xl 
                       leading-relaxed sm:leading-loose md:leading-loose
                       text-justify sm:text-left"
          >
            {formatarTextoComLinksENegrito(
              props.descrition_hardSkill,
              palavrasComLinks.filter((link) =>
                [
                  "Full Stack",
                  "JavaScript",
                  "TypeScript",
                  "Node.js",
                  "Express",
                  "React",
                  "Next.js",
                  "Nest.js",
                  "MySQL",
                  "PostgreSQL",
                  "Git",
                  "GitHub",
                ].includes(link.palavra)
              ),
              palavrasNegritoHardSkills
            )}
          </p>
          <br></br>
          <p
            className="text-base sm:text-lg md:text-xl lg:text-2xl 
                       leading-relaxed sm:leading-loose md:leading-loose
                       text-justify sm:text-left"
          >
            {formatarTextoComLinksENegrito(
              props.descrition_softSkill,
              palavrasComLinks.filter((link) =>
                ["curioso", "proativo", "comunicativo", "aprendizado"].includes(
                  link.palavra
                )
              ),
              palavrasNegritoSoftSkills
            )}
          </p>
          <br></br>
          <p
            className="text-base sm:text-lg md:text-xl lg:text-2xl 
                       leading-relaxed sm:leading-loose md:leading-loose
                       text-justify sm:text-left"
          >
            {formatarTextoComLinksENegrito(
              props.descrition_estudo,
              palavrasComLinks.filter((link) =>
                [
                  "Análise e Desenvolvimento de Sistemas",
                  "PUC Minas",
                  "Desenvolvedor Web",
                  "Programadores do Amanhã",
                  "Desenvolvedor Full Stack",
                ].includes(link.palavra)
              ),
              palavrasNegritoEstudo
            )}
          </p>
        </div>
        <br></br>
      </div>
    </div>
  );
}
