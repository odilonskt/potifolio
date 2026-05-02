import FuzzyText from "@/components/FuzzyText";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center">
      <div className="flex flex-col items-center gap-6">
        {/* Código 404 */}
        <FuzzyText baseIntensity={0.2} hoverIntensity={0.5} enableHover>
          404
        </FuzzyText>

        {/* Mensagem */}
        <p className="max-w-md text-sm text-slate-300">
          Ops! A página que você procura não foi encontrada.
        </p>

        {/* Ação */}
        <Link
          href="/"
          className="mt-2 rounded-xl bg-white px-5 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-200"
        >
          Voltar para o início
        </Link>
      </div>
    </main>
  );
}
