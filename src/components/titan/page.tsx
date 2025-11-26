interface TitanProps {
  title: string;
  id?: string;
}

export default function Titan(props: TitanProps) {
  return (
    <>
      <h1
        className="text-white text-center font-bold   m-6 text-4xl md:text-5xl lg:text-6xl"
        id={props.id}
      >
        {props.title}
      </h1>
    </>
  );
}
