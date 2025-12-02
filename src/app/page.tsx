import { ContactForm } from "@/components/contact-form/page";
import Header from "@/components/heard/page";
import Localition from "@/components/localition/page";
import ProjectPage from "@/components/projetc/page";
import Sobre from "@/components/sobre/page";
import Start from "@/components/start/page";
import InfinityScrollAnimation from "@/components/tecnologia/page";
import Titan from "@/components/titan/page";

export default function Home() {
  return (
    <>
      <link rel="icon" href="/favicon.svg" sizes="any" />
      <main>
        <Header />
        <Start id="start"></Start>
        <Sobre
          id="meio"
          descrition_hardSkill="Desenvolvedor Full-Stack com foco em JavaScript/TypeScript, Node.js (Express/Nest.js) e React/Next.js
Experiência prática na criação de APIs RESTful e Single-Page Applications (SPA)
Proficiência em MySQL/PostgreSQL e Git/GitHub
Interesse contínuo em aprimorar habilidades técnicas e explorar novas tecnologias."
          descrition_softSkill="Profissional curioso, proativo e comunicativo
Facilidade de aprendizado e adaptação a novas ferramentas
Boa capacidade de trabalho em equipe
Motivado a contribuir em projetos desafiadores e aprender com profissionais experientes."
          descrition_estudo="Cursando Análise e Desenvolvimento de Sistemas na PUC Minas
sou Formando em Desenvolvedor Web pelo programa Programadores do Amanhã, com foco em tecnologia e empregabilidade
Buscando  oportunidade como Desenvolvedor Full Stack, para aplicar meus conhecimentos na prática."
        />
        <section id="Tecnologia" className="pt-8 sm:pt-16">
          <InfinityScrollAnimation />
          <Localition id="location" />
        </section>

        <section id="Projeto">
          <ProjectPage />
        </section>

        <section className="py-20 bg-black" id="Contato">
          <Titan title="Contato: " />
          <ContactForm />
        </section>
      </main>
    </>
  );
}
