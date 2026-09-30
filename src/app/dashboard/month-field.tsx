"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { FormState } from "@/lib/content/schemas";

import { FieldErrors } from "./form-parts";

// Campo de mês "mm/aaaa" com calendário. Substitui <input type="month">, que o
// Firefox e o Safari exibem como texto livre (e aí "03/2024" era recusado).
// O que vai para o servidor continua "aaaa-mm", num input escondido.

const MONTHS = Array.from({ length: 12 }, (_, index) => {
  const date = new Date(Date.UTC(2000, index, 1));
  return {
    short: new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" }).format(date).replace(".", ""),
    long: new Intl.DateTimeFormat("pt-BR", { month: "long", timeZone: "UTC" }).format(date),
  };
});

const DISPLAY_REGEX = /^(0[1-9]|1[0-2])\/(\d{4})$/;
const ISO_REGEX = /^(\d{4})-(0[1-9]|1[0-2])$/;

/** "2024-03" → "03/2024"; qualquer outra coisa fica como está */
function toDisplay(value: string): string {
  const match = ISO_REGEX.exec(value);
  return match ? `${match[2]}/${match[1]}` : value;
}

/** "03/2024" → "2024-03"; incompleto segue cru para o servidor apontar o erro */
function toIso(text: string): string {
  const match = DISPLAY_REGEX.exec(text);
  return match ? `${match[2]}-${match[1]}` : text;
}

/** Só números, com a barra depois do mês: "032024" → "03/2024" */
function mask(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 6);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function MonthField({
  state,
  name,
  label,
  defaultValue,
  disabled,
  required,
  children,
}: {
  state: FormState;
  name: string;
  label: string;
  /** "aaaa-mm" ou vazio */
  defaultValue: string;
  disabled?: boolean;
  required?: boolean;
  /** Conteúdo extra abaixo do campo (ex.: "trabalho aqui atualmente") */
  children?: React.ReactNode;
}) {
  const [text, setText] = useState(() => toDisplay(defaultValue));
  const [open, setOpen] = useState(false);
  const selected = ISO_REGEX.exec(toIso(text));
  const [year, setYear] = useState(() => (selected ? Number(selected[1]) : new Date().getFullYear()));

  const errors = state.fieldErrors?.[name];
  const hintId = `${name}-hint`;
  const describedBy = [hintId, errors ? `${name}-error` : ""].filter(Boolean).join(" ");

  const pick = (monthIndex: number) => {
    setText(`${String(monthIndex + 1).padStart(2, "0")}/${year}`);
    setOpen(false);
  };

  return (
    <Field data-invalid={errors ? true : undefined}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <div className="flex gap-2">
        <Input
          id={name}
          value={text}
          onChange={(event) => setText(mask(event.target.value))}
          placeholder="mm/aaaa"
          inputMode="numeric"
          autoComplete="off"
          maxLength={7}
          disabled={disabled}
          required={required}
          aria-invalid={errors ? true : undefined}
          aria-describedby={describedBy}
          className="tabular-nums"
        />
        <input type="hidden" name={name} value={toIso(text)} disabled={disabled} />

        <Popover
          open={open}
          onOpenChange={(next) => {
            // Abre no ano já escolhido
            if (next && selected) setYear(Number(selected[1]));
            setOpen(next);
          }}
        >
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="icon" disabled={disabled} aria-label={`Escolher no calendário: ${label}`}>
              <CalendarDays aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64">
            <div className="flex items-center justify-between">
              <Button type="button" variant="ghost" size="icon" onClick={() => setYear(year - 1)} aria-label={`Ano anterior, ${year - 1}`}>
                <ChevronLeft aria-hidden="true" />
              </Button>
              <p className="font-medium tabular-nums" aria-live="polite">
                {year}
              </p>
              <Button type="button" variant="ghost" size="icon" onClick={() => setYear(year + 1)} aria-label={`Próximo ano, ${year + 1}`}>
                <ChevronRight aria-hidden="true" />
              </Button>
            </div>
            <ul className="mt-2 grid grid-cols-3 gap-1">
              {MONTHS.map((month, index) => {
                const isSelected = selected !== null && Number(selected[1]) === year && Number(selected[2]) === index + 1;
                return (
                  <li key={month.long}>
                    <Button
                      type="button"
                      variant={isSelected ? "default" : "ghost"}
                      size="sm"
                      className="w-full capitalize"
                      aria-pressed={isSelected}
                      aria-label={`${month.long} de ${year}`}
                      onClick={() => pick(index)}
                    >
                      {month.short}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </PopoverContent>
        </Popover>
      </div>
      <FieldDescription id={hintId}>Formato mm/aaaa. Ex.: 03/2024.</FieldDescription>
      {children}
      <FieldErrors state={state} name={name} />
    </Field>
  );
}
