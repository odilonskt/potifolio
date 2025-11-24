import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="bg-black text-white p-4 pl-20 flex items-center justify-between gap-2
      w-full  text-center  "
    >
      <Image
        src="/favicon.svg"
        alt="Perfil"
        width={50}
        height={50}
        className="ml-4"
      />
      <p>&copy; {new Date().getFullYear()} Odilon</p>
      <div className="w-6"></div>
    </footer>
  );
}
