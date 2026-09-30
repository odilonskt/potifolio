import { cn } from "@/lib/utils";

// Mesmo desenho de src/app/icon.svg, mas com tokens do tema: acompanha a classe
// .dark do next-themes (o favicon só enxerga o prefers-color-scheme do sistema)
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-9", className)}>
      <rect width="32" height="32" rx="8" className="fill-brand dark:fill-background" />
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="7.5"
        className="fill-none stroke-none dark:stroke-brand/30"
      />
      <circle
        cx="16"
        cy="16"
        r="9"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="42 14.55"
        className="fill-none stroke-background dark:stroke-brand"
      />
      <circle cx="22.2" cy="9.5" r="2.2" className="fill-background dark:fill-brand" />
    </svg>
  );
}
