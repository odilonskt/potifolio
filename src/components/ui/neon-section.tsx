"use client";

interface NeonSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function NeonSection({
  children,
  className = "",
  id,
}: NeonSectionProps) {
  return (
    <section
      id={id}
      className={`relative py-12 md:py-16 lg:py-20 bg-slate-950 overflow-hidden ${className}`}
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-neon" />
        <div className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-neon" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
