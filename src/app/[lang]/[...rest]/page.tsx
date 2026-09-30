import { notFound } from "next/navigation";

// Qualquer endereço que não existe dentro de /pt, /en ou /es cai aqui e mostra o
// not-found.tsx do idioma (com o layout do site), em vez do 404 padrão do Next.
// Gerada sob demanda como estática: o 404 sai com o <html lang> do layout.
export function generateStaticParams() {
  return [];
}

export default function CatchAll() {
  notFound();
}
