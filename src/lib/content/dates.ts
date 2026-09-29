// lib/content/dates.ts
// Formatação de períodos "YYYY-MM" para exibição em pt-BR.

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function toDate(month: string): Date {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(Date.UTC(year, monthIndex - 1, 1));
}

/** "2024-03" → "mar. de 2024" */
export function formatMonth(month: string): string {
  return monthFormatter.format(toDate(month));
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

/** Duração inclusiva: "1 ano e 3 meses", "8 meses". */
export function formatDuration(start: string, end?: string): string {
  const from = toDate(start);
  const to = toDate(end ?? currentMonth());
  const totalMonths =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    (to.getUTCMonth() - from.getUTCMonth()) +
    1;

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts = [
    years > 0 ? `${years} ${years === 1 ? "ano" : "anos"}` : "",
    months > 0 ? `${months} ${months === 1 ? "mês" : "meses"}` : "",
  ].filter(Boolean);

  return parts.join(" e ") || "1 mês";
}

const dayFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** ISO → "29 de setembro de 2026" */
export function formatDay(iso: string): string {
  return dayFormatter.format(new Date(iso));
}

/** Tempo de leitura estimado (~200 palavras/min). */
export function readingTime(markdown: string): string {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min de leitura`;
}
