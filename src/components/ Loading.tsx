import Hover3DCard from "./HoverCard3D/page";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 overflow-hidden">
      {/* Glow de fundo */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow" />

      <div className="relative flex flex-col items-center gap-10">
        {/* Radial Progress */}
        <div
          className="radial-progress text-cyan-400 animate-spin-ultra-slow shadow-[0_0_25px_#22d3ee]"
          style={
            {
              "--value": 75,
              "--size": "5rem",
              "--thickness": "6px",
            } as React.CSSProperties
          }
        />

        {/* Loading dots */}
        <span className="loading loading-dots loading-lg text-cyan-400 opacity-80" />

        {/* Texto */}
        <p className="text-cyan-300 text-xs sm:text-sm tracking-[0.3em] uppercase animate-fade-in-out">
          Welcome
        </p>

        {/* Card 3D */}
        <div className="scale-75 sm:scale-90 md:scale-100 animate-float">
          <Hover3DCard
            src="https://i.pinimg.com/originals/79/2e/32/792e32b18700cae03cf1c7243746cfb6.gif"
            alt="Efeito 3D interativo"
          />
        </div>
      </div>
    </div>
  );
}
