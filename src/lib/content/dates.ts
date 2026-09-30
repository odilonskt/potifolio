// lib/content/dates.ts
// Formatação de períodos "YYYY-MM" e datas no idioma da página.
import { DEFAULT_LOCALE, HTML_LANG, type Locale } from "@/lib/i18n/config";
import { home } from "@/lib/i18n/messages/home";

const monthFormatters = new Map<Locale, Intl.DateTimeFormat>();
const dayFormatters = new Map<Locale, Intl.DateTimeFormat>();

function monthFormatter(locale: Locale) {
  let formatter = monthFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(HTML_LANG[locale], { month: "short", year: "numeric", timeZone: "UTC" });
    monthFormatters.set(locale, formatter);
  }
  return formatter;
}

function toDate(month: string): Date {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(Date.UTC(year, monthIndex - 1, 1));
}

/** "2024-03" → "mar. de 2024" / "Mar 2024" / "mar 2024" */
export function formatMonth(month: string, locale: Locale = DEFAULT_LOCALE): string {
  return monthFormatter(locale).format(toDate(month));
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

/** Duração inclusiva: "1 ano e 3 meses", "1 year and 3 months". */
export function formatDuration(start: string, end: string | undefined, locale: Locale = DEFAULT_LOCALE): string {
  const t = home[locale].dates;
  const from = toDate(start);
  const to = toDate(end ?? currentMonth());
  const totalMonths =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth()) + 1;

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts = [years > 0 ? t.years(years) : "", months > 0 ? t.months(months) : ""].filter(Boolean);

  return parts.join(` ${t.and} `) || t.months(1);
}

/** ISO → "29 de setembro de 2026" / "September 29, 2026" */
export function formatDay(iso: string, locale: Locale = DEFAULT_LOCALE): string {
  let formatter = dayFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(HTML_LANG[locale], { day: "numeric", month: "long", year: "numeric" });
    dayFormatters.set(locale, formatter);
  }
  return formatter.format(new Date(iso));
}

/** Tempo de leitura estimado (~200 palavras/min). */
export function readingTime(markdown: string, locale: Locale = DEFAULT_LOCALE): string {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return home[locale].dates.readingTime(Math.max(1, Math.round(words / 200)));
}
