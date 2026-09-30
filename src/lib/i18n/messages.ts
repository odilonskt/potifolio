// lib/i18n/messages.ts
// Cada área do site tem seu módulo de mensagens com as 3 línguas lado a lado.
// O português define o formato; inglês e espanhol precisam ter exatamente as
// mesmas chaves (o TypeScript acusa qualquer tradução faltando).
import type { Locale } from "./config";

type Widen<T> = T extends string
  ? string
  : T extends (...args: infer A) => infer R
    ? (...args: A) => Widen<R>
    : T extends readonly (infer U)[]
      ? readonly Widen<U>[]
      : T extends object
        ? { [K in keyof T]: Widen<T[K]> }
        : T;

export type Messages<T> = Record<Locale, T>;

export function defineMessages<T>(pt: T, others: Record<Exclude<Locale, "pt">, Widen<T>>): Messages<Widen<T>> {
  return { pt: pt as Widen<T>, ...others };
}
