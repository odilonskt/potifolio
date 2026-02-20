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

// Função: Combinada - palavras com link ficam em strong+link, outras em strong apenas
function formatarTextoComLinksENegrito(
  texto: string,
  palavrasLinks: PalavraLink[],
  palavrasNegrito: string[],
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
      (p) => p.palavra.toLowerCase() === parte.toLowerCase(),
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
      (p) => p.toLowerCase() === parte.toLowerCase(),
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
      className="w-full flex flex-col items-center px-3 xs:px-4 sm:px-6 lg:px-8 py-8 xs:py-10 sm:py-12 md:py-16 lg:py-20 relative"
      id={props.id}
    >
      {/* Decorative Background Elements */}
      <div className="hidden lg:block absolute top-20 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10" />
      <div className="hidden lg:block absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10" />

      <Titan title="Sobre:" />

      <div className="w-full max-w-5xl mt-6 sm:mt-8 lg:mt-10">
        {/* Hard Skills Section */}
        <div className="group mb-6 sm:mb-8 lg:mb-10">
          <div className="relative" suppressHydrationWarning>
            {/* Gradient Border Effect */}
            <div
              className="absolute -inset-0.5 bg-linear-to-r from-blue-600 via-blue-700 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"
              suppressHydrationWarning
            />

            <div
              className="relative bg-linear-to-br from-gray-950 to-black border border-gray-800 hover:border-gray-700 rounded-2xl p-6 xs:p-7 sm:p-8 md:p-10 transition-all duration-300 backdrop-blur-sm"
              suppressHydrationWarning
            >
              <div
                className="flex items-center gap-3 mb-4 sm:mb-5"
                suppressHydrationWarning
              >
                <div className="w-1.5 h-8 bg-linear-to-b from-blue-500 to-cyan-500 rounded-full" />
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Competências Técnicas
                </h3>
              </div>

              <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed sm:leading-loose md:leading-loose text-justify sm:text-left">
                {formatarTextoComLinksENegrito(
                  props.descrition_hardSkill,
                  palavrasComLinks,
                  palavrasNegritoHardSkills,
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Soft Skills Section */}
        <div className="group mb-6 sm:mb-8 lg:mb-10">
          <div className="relative" suppressHydrationWarning>
            {/* Gradient Border Effect */}
            <div
              className="absolute -inset-0.5 bg-linear-to-r from-purple-600 via-purple-500 to-green-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"
              suppressHydrationWarning
            />

            <div
              className="relative bg-linear-to-br from-gray-950 to-black border border-gray-800 hover:border-gray-700 rounded-2xl p-6 xs:p-7 sm:p-8 md:p-10 transition-all duration-300 backdrop-blur-sm"
              suppressHydrationWarning
            >
              <div
                className="flex items-center gap-3 mb-4 sm:mb-5"
                suppressHydrationWarning
              >
                <div className="w-1.5 h-8 bg-linear-to-b from-purple-500 to-green-500 rounded-full" />
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-linear-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                  Competências Pessoais
                </h3>
              </div>

              <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed sm:leading-loose md:leading-loose text-justify sm:text-left">
                {formatarTextoComLinksENegrito(
                  props.descrition_softSkill,
                  palavrasComLinks,
                  palavrasNegritoSoftSkills,
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="group">
          <div className="relative" suppressHydrationWarning>
            {/* Gradient Border Effect */}
            <div
              className="absolute -inset-0.5 bg-linear-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"
              suppressHydrationWarning
            />

            <div
              className="relative bg-linear-to-br from-gray-950 to-black border border-gray-800 hover:border-gray-700 rounded-2xl p-6 xs:p-7 sm:p-8 md:p-10 transition-all duration-300 backdrop-blur-sm"
              suppressHydrationWarning
            >
              <div
                className="flex items-center gap-3 mb-4 sm:mb-5"
                suppressHydrationWarning
              >
                <div className="w-1.5 h-8 bg-linear-to-b from-green-500 to-emerald-500 rounded-full" />
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Formação e Certificações
                </h3>
              </div>

              <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed sm:leading-loose md:leading-loose text-justify sm:text-left">
                {formatarTextoComLinksENegrito(
                  props.descrition_estudo,
                  palavrasComLinks,
                  palavrasNegritoEstudo,
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
