import Image from "next/image";

interface Hover3DCardProps {
  src: string;
  /** Vazio quando a imagem é só decorativa */
  alt: string;
}

/**
 * Card com inclinação 3D no hover (componente hover-3d do daisyUI).
 * A imagem passa pelo /_next/image: o navegador do visitante não acessa o host externo.
 */
export default function Hover3DCard({ src, alt }: Hover3DCardProps) {
  return (
    <div className="hover-3d size-full">
      <figure className="size-full overflow-hidden rounded-2xl border border-border">
        <Image
          src={src}
          alt={alt}
          width={600}
          height={400}
          sizes="(min-width: 1024px) 480px, 100vw"
          className="size-full object-cover"
        />
      </figure>

      {/* 8 divs exigidas pelo hover-3d do daisyUI (áreas de detecção do mouse) */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} aria-hidden="true" />
      ))}
    </div>
  );
}
