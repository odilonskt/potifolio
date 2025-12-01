import { ContactForm } from "@/components/contact-form/page";
import Header from "@/components/heard/page";
import Localition from "@/components/localition/page";
import ProjectPage from "@/components/projetc/page";
import Sobre from "@/components/sobre/page";
import Start from "@/components/start/page";
import InfinityScrollAnimation from "@/components/tecnologia/page";
import { Mail, MapPin, Phone } from "lucide-react";

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
Buscando minha primeira oportunidade como Desenvolvedor Full Stack, para aplicar meus conhecimentos na prática."
        />
        <section id="Tecnologia" className="pt-8 sm:pt-16">
          <InfinityScrollAnimation />
          <Localition />
        </section>

        <section>
          <ProjectPage></ProjectPage>
        </section>

        <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
                Vamos Conversar
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tem um projeto em mente? Entre em contato e vamos transformar
                suas ideias em realidade.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Informações de contato */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-card rounded-xl border">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Telefone</h3>
                      <p className="text-muted-foreground">
                        +55 (11) 99999-9999
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-card rounded-xl border">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Email</h3>
                      <p className="text-muted-foreground">
                        contato@exemplo.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-card rounded-xl border">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Localização</h3>
                      <p className="text-muted-foreground">São Paulo, SP</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-2xl border">
                  <h3 className="font-semibold text-lg mb-3">
                    Horário de Atendimento
                  </h3>
                  <p className="text-muted-foreground">
                    Segunda a Sexta: 9h às 18h
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Respondo em até 24h úteis
                  </p>
                </div>
              </div>

              {/* Formulário */}
              <div className="bg-card p-8 rounded-2xl shadow-lg border">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">
                    Envie sua mensagem
                  </h2>
                  <p className="text-muted-foreground">
                    Preencha o formulário abaixo
                  </p>
                </div>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
