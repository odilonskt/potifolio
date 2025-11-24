import Titan from "../titan/page";
interface LocalitionProps {
  id: string;
}
export default function Localition({ id }: LocalitionProps) {
  return (
    <div className="w-full flex flex-col items-center p-4 sm:p-6" id={id}>
      <Titan title="Localização:" />
      <div className="w-full max-w-6xl mt-4 sm:mt-8">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d58232.59861092424!2d-44.28143590726355!3d-19.45564031605963!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xa65aa48d5ab029%3A0x3158b7984cbbf15f!2sSete%20Lagoas%2C%20MG!5e1!3m2!1spt-BR!2sbr!4v1763884190149!5m2!1spt-BR!2sbr"
          width="100%"
          height="400"
          className="rounded-xl shadow-lg sm:h-[450px] md:h-[500px] lg:h-[600px]"
          loading="lazy"
          allowFullScreen
          title="Localização Sete Lagoas MG"
        />
      </div>
    </div>
  );
}
