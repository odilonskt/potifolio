interface TitanProps {
  title: string;
}

export default function Titan(props: TitanProps) {
  return (
    <>
      <h1 className="text-white text-center font-bold   m-6 text-4xl md:text-5xl lg:text-6xl">
        {props.title}
      </h1>
    </>
  );
}
