import Header from "@/components/heard/page";
import Localition from "@/components/localition/page";
import Sobre from "@/components/sobre/page";
import Start from "@/components/start/page";
import InfinityScrollAnimation from "@/components/tecnologia/page";

export default function Home() {
  return (
    <>
      <link rel="icon" href="/favicon.svg" sizes="any" />
      <main>
        <Header />
        <Start id="start"></Start>
        <Sobre
          id="meio"
          descrition="Sou Desenvolvedor Full Stack  focado em JavaScript/TypeScript, Node.js e React, com experiência prática na criação de APIs RESTful e Single-Page Applications (SPA). Tenho proficiência em MySQL e Git/GitHub, além de interesse constante em aprimorar minhas habilidades técnicas. Atualmente, curso Análise e Desenvolvimento de Sistemas na PUC Minas e sou formando pelo programa Programadores do Amanhã, iniciativa de formação intensiva em tecnologia e empregabilidade. Busco minha primeira oportunidade como Desenvolvedor Full Stack em Desenvolvimento, onde possa aplicar meus conhecimentos, aprender com profissionais experientes e contribuir para projetos desafiadores. Sou curioso, proativo e comunicativo, com facilidade de aprendizado e gosto por trabalhar em equipe. Acredito na tecnologia como ferramenta de transformação e estou pronto para colocar meu potencial em prática."
        />
        <InfinityScrollAnimation />
        <Localition id="fim" />
      </main>
    </>
  );
}
