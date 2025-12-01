interface TitanProps {
  title: string;
  id?: string;
}

export default function Titan(props: TitanProps) {
  return (
    <>
      <h1
        className="text-white text-center font-bold   m-6 text-4xl md:text-5xl lg:text-6xl  leading-tight drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
        id={props.id}
      >
        {props.title}
      </h1>
    </>
  );
}
