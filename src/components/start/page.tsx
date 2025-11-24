"use client";
import { Download, Github, Linkedin } from "@deemlol/next-icons";
import Image from "next/image";
import NextLink from "next/link";
import { Button } from "../ui/button";
interface StartProps {
  id: string;
}

export default function Start({ id }: StartProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/odilon.pdf";
    link.download = "odilon.pdf";
    link.click();
  };
  return (
    <main id={id} className="text-white w-full">
      <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-8 lg:py-0 gap-8 lg:gap-12">
        <div className="flex items-center flex-shrink-0">
          <Image
            src="/perfil.svg"
            alt="Foto de perfil de Odilon - Desenvolvedor Full-Stack"
            width={350}
            height={350}
            priority={true}
            className="rounded-xl w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 object-cover shadow-lg"
          />
        </div>
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4 sm:gap-6 max-w-2xl">
          <h1 className=" text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight ">
            Desenvolvedor Full-Stack
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 max-w-lg">
            Criando soluções digitais inovadoras com tecnologias modernas
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-2 sm:mt-4 ">
            <NextLink
              href="https://www.linkedin.com/in/odilon-dev/"
              target="_blank"
            >
              <Linkedin
                size={32}
                color="white"
                className="hover:scale-110 transition-transform duration-200 hover:opacity-80"
              />
            </NextLink>

            <NextLink href="https://github.com/odilonskt" target="_blank">
              <Github
                size={32}
                color="white"
                className="hover:scale-110 transition-transform duration-200 hover:opacity-80"
              />
            </NextLink>

            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex gap-2 items-center text-black bg-white hover:bg-gray-100 px-4 py-2 sm:px-6 sm:py-3 min-w-[140px] sm:min-w-[160px] text-sm sm:text-base font-medium transition-all duration-200 hover:scale-105"
            >
              <Download size={20} color="black" />
              Meu CV
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
