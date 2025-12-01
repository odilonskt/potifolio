import Titan from "../titan/page";

interface SobreProps {
  descrition_softSkill: string;
  descrition_hardSkill: string;
  descrition_estudo: string;
  id: string;
}

function formatarTextoComNegrito(texto: string, palavrasNegrito: string[]) {
  if (!palavrasNegrito.length) return texto;

  const regex = new RegExp(`(${palavrasNegrito.join("|")})`, "gi");
  const partes = texto.split(regex);

  return partes.map((parte, index) =>
    palavrasNegrito.some(
      (palavra) => parte.toLowerCase() === palavra.toLowerCase()
    ) ? (
      <strong key={index} className="font-bold text-white ">
        {parte}
      </strong>
    ) : (
      <span key={index}>{parte}</span>
    )
  );
}

export default function Sobre(props: SobreProps) {
  const palavrasHardSkills = [
    "Full Stack",
    "JavaScript",
    "TypeScript",
    "Node.js",
    "Express",
    "React",
    "APIs RESTful",
    "Single-Page Applications",
    "SPA",
    "MySQL",
    "Git",
    "GitHub",
    "JavaScript/TypeScript",
    "Nest.js",
    "Next.js",
    "GitHub",
    "Git/GitHub ",
    "Hub",
    "PostgreSQL",
  ];

  const palavrasSoftSkills = [
    "curioso",
    "proativo",
    "comunicativo",
    "aprendizado",
    "adaptação",
    "trabalho em equipe",
  ];

  const palavrasEstudo = [
    "Análise e Desenvolvimento de Sistemas",
    "PUC Minas",
    "Desenvolvedor Web",
    "Programadores do Amanhã",
    "Desenvolvedor Full Stack",
  ];
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
            {formatarTextoComNegrito(
              props.descrition_hardSkill,
              palavrasHardSkills
            )}
          </p>
          <br></br>
          <p
            className="text-base sm:text-lg md:text-xl lg:text-2xl 
                       leading-relaxed sm:leading-loose md:leading-loose
                       text-justify sm:text-left"
          >
            {formatarTextoComNegrito(
              props.descrition_softSkill,
              palavrasSoftSkills
            )}
          </p>
          <br></br>
          <p
            className="text-base sm:text-lg md:text-xl lg:text-2xl 
                       leading-relaxed sm:leading-loose md:leading-loose
                       text-justify sm:text-left"
          >
            {formatarTextoComNegrito(props.descrition_estudo, palavrasEstudo)}
          </p>
        </div>
        <br></br>
      </div>
    </div>
  );
}
