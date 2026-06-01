"use client";

import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TitanProps {
  title: string;
  subtitle?: string;
  id?: string;
  className?: string;
}

// ─── Light Rays CSS ───────────────────────────────────────────────────────────

const lightRayStyle = `
  @keyframes ray-pulse {
    0%, 100% { opacity: 0.12; transform: scaleY(1); }
    50%       { opacity: 0.22; transform: scaleY(1.04); }
  }
  @keyframes dot-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }
  .titan-ray {
    animation: ray-pulse 4s ease-in-out infinite;
  }
  .titan-ray:nth-child(2) { animation-delay: 0.6s; }
  .titan-ray:nth-child(3) { animation-delay: 1.2s; }
  .titan-ray:nth-child(4) { animation-delay: 1.8s; }
  .titan-ray:nth-child(5) { animation-delay: 2.4s; }
  .titan-dot {
    animation: dot-blink 2.5s ease-in-out infinite;
  }
`;

// ─── Light Rays Background ────────────────────────────────────────────────────

/**
 * Renders radiating light rays behind the title for a subtle "spotlight" effect.
 * Purely decorative — hidden from assistive technology.
 */
function LightRays() {
  const rays = [
    {
      left: "48%",
      width: "2px",
      height: "60%",
      color: "from-sky-400/30 to-transparent",
    },
    {
      left: "44%",
      width: "3px",
      height: "50%",
      color: "from-indigo-400/20 to-transparent",
    },
    {
      left: "52%",
      width: "3px",
      height: "55%",
      color: "from-sky-300/20 to-transparent",
    },
    {
      left: "40%",
      width: "2px",
      height: "40%",
      color: "from-indigo-300/15 to-transparent",
    },
    {
      left: "57%",
      width: "2px",
      height: "45%",
      color: "from-sky-400/15 to-transparent",
    },
  ];

  return (
    <div
      className="absolute inset-0 flex items-end justify-center pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {rays.map((ray, i) => (
        <div
          key={i}
          className={cn(
            "titan-ray absolute bottom-1/2 bg-gradient-to-t origin-bottom",
            ray.color,
          )}
          style={{
            left: ray.left,
            width: ray.width,
            height: ray.height,
          }}
        />
      ))}

      {/* Ambient glow */}
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-20 bg-sky-500/5 rounded-full blur-3xl" />
    </div>
  );
}

// ─── Decorative Divider ───────────────────────────────────────────────────────

function Divider() {
  return (
    <div
      className="flex items-center justify-center gap-3 mt-5"
      aria-hidden="true"
    >
      <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-sky-500/50" />
      <span className="titan-dot w-1.5 h-1.5 rounded-full bg-sky-400" />
      <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-indigo-500/50" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Section heading with an ambient light-ray effect.
 *
 * Accessibility:
 * - Renders a semantic `<section>` with `aria-labelledby` pointing to the `<h2>`.
 * - The decorative rays and glow elements are `aria-hidden`.
 * - `<h2>` is used so this can be composed inside a `<main>` without skipping heading levels.
 */
export default function Titan({ title, subtitle, id, className }: TitanProps) {
  const headingId = id ?? `section-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <>
      <style>{lightRayStyle}</style>

      <section
        aria-labelledby={headingId}
        suppressHydrationWarning
        className={cn(
          "relative w-full py-12 sm:py-16 overflow-hidden",
          className,
        )}
      >
        <LightRays />

        <div className="relative z-10 text-center px-4">
          {/* Eyebrow label — helps screen readers understand section purpose */}
          <p className="text-[11px] tracking-[0.35em] text-slate-500 uppercase mb-3">
            {subtitle ?? "Seção"}
          </p>

          <h2
            id={headingId}
            className="text-2xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight"
          >
            {title}
          </h2>

          {subtitle && (
            <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-md mx-auto">
              {subtitle}
            </p>
          )}

          <Divider />
        </div>
      </section>
    </>
  );
}
