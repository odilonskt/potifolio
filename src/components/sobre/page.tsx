import Titan from "../titan/page";

interface SobreProps {
  descrition_softSkill: string;
  descrition_hardSkill: string;
  descrition_estudo: string;
  id: string;
}

export default function Sobre(props: SobreProps) {
  return (
    <div
      className="w-full flex flex-col items-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
      id={props.id}
    >
      <Titan title="Sobre:" />
      <div className="w-full max-w-4xl">
        <div
          className="rounded-xl text-white border-2 sm:border-3 lg:border-4 border-white p-4 sm:p-6 lg:p-8 mt-4 sm:mt-6 lg:mt-8 
                      bg-black/20 backdrop-blur-sm shadow-xl"
        >
          <p
            className="text-base sm:text-lg md:text-xl lg:text-2xl 
                       leading-relaxed sm:leading-loose md:leading-loose
                       text-justify sm:text-left"
          >
            {props.descrition_hardSkill}
          </p>
          <p
            className="text-base sm:text-lg md:text-xl lg:text-2xl 
                       leading-relaxed sm:leading-loose md:leading-loose
                       text-justify sm:text-left"
          >
            {props.descrition_softSkill}
          </p>
          <p
            className="text-base sm:text-lg md:text-xl lg:text-2xl 
                       leading-relaxed sm:leading-loose md:leading-loose
                       text-justify sm:text-left"
          >
            {props.descrition_estudo}
          </p>
        </div>
      </div>
    </div>
  );
}
