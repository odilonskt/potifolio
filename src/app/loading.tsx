"use client";

import Hover3DCard from "../components/HoverCard3D/page";

export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
      suppressHydrationWarning
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-pink-900/20 animate-pulse" />

      {/* Neon glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-bounce" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" />
      <div
        className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-15"
        style={{ animation: "float 6s ease-in-out infinite" }}
      />

      <div className="flex flex-col items-center gap-6 relative z-10">
        {/* Neon animated title */}
        <div className="relative">
          <h1
            className="text-3xl sm:text-4xl font-bold uppercase tracking-widest"
            style={{
              background: "linear-gradient(90deg, #00ffff, #ff00ff, #00ffff)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradient-shift 3s linear infinite",
              filter:
                "drop-shadow(0 0 10px #00ffff) drop-shadow(0 0 20px #ff00ff)",
            }}
          >
            Loading
          </h1>
        </div>

        {/* Enhanced loading dots with neon effect */}
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-cyan-400"
              style={{
                animation: `bounce 1.4s infinite`,
                animationDelay: `${i * 0.16}s`,
                boxShadow: "0 0 10px #00ffff, 0 0 20px #0099ff",
              }}
            />
          ))}
        </div>

        {/* Dynamic text with neon pulse */}
        <p
          className="text-xs sm:text-sm tracking-widest uppercase font-mono"
          style={{
            background: "linear-gradient(90deg, #00ffff, #ff00ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "text-glow 2s ease-in-out infinite",
            filter: "drop-shadow(0 0 8px #00ffff)",
          }}
        >
          Preparando a magia ✨
        </p>

        {/* Card 3D with neon frame */}
        <div className="relative scale-75 sm:scale-90 md:scale-100">
          <div
            className="absolute -inset-1 rounded-lg opacity-75"
            style={{
              background: "linear-gradient(45deg, #00ffff, #ff00ff, #00ffff)",
              backgroundSize: "200% auto",
              animation: "gradient-shift 3s linear infinite",
              filter: "blur(8px)",
            }}
          />
          <div className="relative">
            <Hover3DCard
              src="https://i.pinimg.com/originals/79/2e/32/792e32b18700cae03cf1c7243746cfb6.gif"
              alt="Efeito 3D interativo"
            />
          </div>
        </div>

        {/* Bottom neon accent line */}
        <div
          className="w-32 h-1 rounded-full mt-4"
          style={{
            background:
              "linear-gradient(90deg, transparent, #00ffff, #ff00ff, transparent)",
            boxShadow: "0 0 20px #00ffff, 0 0 40px #ff00ff",
            animation: "pulse-glow 2s ease-in-out infinite",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% center;
          }
          50% {
            background-position: 100% center;
          }
          100% {
            background-position: 0% center;
          }
        }

        @keyframes text-glow {
          0%,
          100% {
            text-shadow: 0 0 8px #00ffff, 0 0 16px #0099ff;
          }
          50% {
            text-shadow: 0 0 16px #ff00ff, 0 0 32px #ff0099;
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff;
          }
          50% {
            box-shadow: 0 0 20px #ff00ff, 0 0 40px #ff00ff;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
