import { ContactForm } from "@/components/contact-form/page";
import Projects from "@/components/projects/projects";
import Header from "@/components/heard/page";
import Hover3DCard from "@/components/HoverCard3D/page";
import JourneySections from "@/components/journey/journey-sections";
import { Section } from "@/components/section/section";
import Sobre from "@/components/sobre/page";
import Start from "@/components/start/page";
import TechMarquee from "@/components/tecnologia/page";

// Conteúdo do painel é cacheado e invalidado pelas server actions (updateTag)
export const revalidate = 3600;

const HIGHLIGHT_GIFS = [
  "https://i.pinimg.com/originals/d2/30/e9/d230e9383c6ddf256e583b5228e2bfb7.gif",
  "https://i.pinimg.com/originals/27/d6/ac/27d6ac185cd2c655fcd667d7938b37e4.gif",
];

export default function Home() {
  return (
    <>
      <Header />
      <main id="conteudo">
        <Start id="start" />
        <Sobre id="meio" />
        <JourneySections />

        <Section id="Tecnologia" title="Tecnologias" description="Ferramentas e linguagens que uso no dia a dia.">
          <TechMarquee />
        </Section>

        {/* overflow-x-clip: as áreas de detecção do hover-3d (daisyUI) passam da borda e alargavam a página no celular */}
        <Section id="Destaque" title="Destaque visual" description="Passe o mouse sobre as imagens para ver o efeito 3D." className="overflow-x-clip">
          <div className="grid gap-6 md:grid-cols-2">
            {HIGHLIGHT_GIFS.map((src) => (
              <div key={src} className="aspect-video">
                {/* Imagens decorativas: o texto da seção já descreve o conteúdo */}
                <Hover3DCard src={src} alt="" />
              </div>
            ))}
          </div>
        </Section>

        <Section id="Projeto" title="Projetos" description="Repositórios públicos no GitHub, do mais recente ao mais antigo.">
          <Projects />
        </Section>

        <Section id="Contato" title="Contato" description="Vagas, projetos ou só um oi: respondo em até 24 horas úteis." width="narrow">
          <ContactForm />
        </Section>
      </main>
    </>
  );
}
