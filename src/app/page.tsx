import { ContactForm } from "@/components/contact-form/page";
import GithubRepos from "@/components/Github-repos/gituhb-portifolio";
import Header from "@/components/heard/page";
import Sobre from "@/components/sobre/page";
import Start from "@/components/start/page";
import InfinityScrollAnimation from "@/components/tecnologia/page";
import Titan from "@/components/titan/page";
import Hover3DCard from "../components/HoverCard3D/page";

export default function Home() {
  return (
    <>
      {/* <link rel="icon" href="/favicon.svg" sizes="any" /> */}
      <main className="bg-slate-950">
        <Header />
        <Start id="start"></Start>

        <Sobre
          id="meio"
          descrition_hardSkill="Desenvolvedor Full-Stack com foco em JavaScript/TypeScript, Node.js (Express/Nest.js) e React/Next.js.

Experiência prática na criação de APIs RESTful e Single-Page Applications (SPA)
Proficiência em MySQL/PostgreSQL e Git/GitHub.
Interesse contínuo em aprimorar habilidades técnicas e explorar novas tecnologias."
          descrition_softSkill="Profissional curioso, proativo e comunicativo
Facilidade de aprendizado e adaptação a novas ferramentas.
Boa capacidade de trabalho em equipe.
Motivado a contribuir em projetos desafiadores e aprender com profissionais experientes."
          descrition_estudo="Cursando Análise e Desenvolvimento de Sistemas na PUC Minas
sou Formando em Desenvolvedor Web pelo programa Programadores do Amanhã, com foco em tecnologia e empregabilidade.

Buscando  oportunidade como Desenvolvedor Full Stack, para aplicar meus conhecimentos na prática."
        />
        <section id="Tecnologia" className="py-12 bg-slate-950">
          <Titan
            title="Tecnologias"
            subtitle="Ferramentas e linguagens que domino"
          />
          <div className="py-8">
            <InfinityScrollAnimation />
          </div>
        </section>
        <section
          id="Destaque"
          className="w-full bg-slate-950 py-8 xs:py-12 sm:py-16 md:py-20 px-3 xs:px-4 sm:px-6 md:px-8"
          suppressHydrationWarning
        >
          <div className="flex flex-col items-center justify-center gap-8 xs:gap-10 sm:gap-12 md:gap-16 max-w-7xl mx-auto">
            <Titan title="Destaque Visual" subtitle="Efeito 3D interativo" />

            <div className="w-full">
              <div className="flex flex-col lg:flex-row justify-center gap-4 xs:gap-6 sm:gap-8 md:gap-10 max-w-6xl mx-auto px-2">
                {/* Card Grande - Desktop */}
                <div className="w-full lg:w-2/3 h-40 xs:h-48 sm:h-56 md:h-64 lg:h-80">
                  <Hover3DCard
                    src="https://i.pinimg.com/originals/d2/30/e9/d230e9383c6ddf256e583b5228e2bfb7.gif"
                    alt="Efeito 3D interativo"
                  />
                </div>
                <div className="w-full lg:w-2/3 h-40 xs:h-48 sm:h-56 md:h-64 lg:h-80">
                  <Hover3DCard
                    src="https://i.pinimg.com/originals/27/d6/ac/27d6ac185cd2c655fcd667d7938b37e4.gif"
                    alt="Efeito 3D interativo"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="Projeto" className="bg-slate-950 py-12">
          <Titan
            title="Projetos"
            subtitle="Explore meus repositórios no GitHub"
          />
          <div className="py-8">
            <GithubRepos />
          </div>
        </section>

        <section className="py-12 bg-slate-950" id="Contato">
          <Titan title="Contato" subtitle="Vamos trabalhar juntos!" />
          <div className="py-8">
            <ContactForm />
          </div>
        </section>
      </main>
    </>
  );
}
