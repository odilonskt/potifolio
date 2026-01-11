import Image from "next/image";

interface Hover3DCardProps {
  src: string;
  alt: string;
}

export default function Hover3DCard({ src, alt }: Hover3DCardProps) {
  return (
    <div className="hover-3d w-full h-full">
      {/* Conteúdo */}
      <figure className="w-full h-full aspect-video rounded-xl xs:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <Image
          src={src}
          alt={alt}
          width={600}
          height={400}
          className="rounded-xl xs:rounded-2xl object-cover w-full h-full"
          priority
        />
      </figure>

      {/* 8 divs obrigatórias para o efeito 3D */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} />
      ))}
    </div>
  );
}
