import { Download, Github, Linkedin } from "@deemlol/next-icons";
import Image from "next/image";
import NextLink from "next/link";
import { Button } from "../ui/button";

export default function Start() {
  return (
    <main
      className=" text-white  w-xl
    "
    >
      <div className="flex items-center m-20  p-10 ">
        <Image
          src="/perfil.png"
          alt="Perfil"
          width={250}
          height={250}
          className="rounded-xl w-40 h-40 md:w-60 md:h-60 object-cover"
        />
        <div className="flex  flex-col mt-6   justify-items-center md:items-start md: items-start gap-6 m-1">
          <h1 className="  text-2xl sm:text-3xl md:text-5xl font-bold text-center md:text-left ml-20  ">
            Desenvolvedor Full-Stack
          </h1>

          <div className="flex  justify-items-center ml-20  gap-6 mt-2 ">
            <NextLink href="https://linkedin.com/odilon-dev/" target="_blank">
              <Linkedin
                size={32}
                color="white"
                className="hover:scale-110 transition-transform"
              />
            </NextLink>

            <NextLink href="https://github.com/odilonskt" target="_blank">
              <Github
                size={32}
                color="white"
                className="hover:scale-110 transition-transform"
              />
            </NextLink>

            <Button
              variant="outline"
              className="flex gap-2 items-center text-black px-4 py-2 md: w-24"
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
