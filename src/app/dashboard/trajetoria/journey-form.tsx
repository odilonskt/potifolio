"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  initialFormState,
  JOURNEY_KIND_LABELS,
  JOURNEY_KINDS,
  type JourneyItem,
} from "@/lib/content/schemas";

import { saveJourneyAction } from "../actions";
import { fieldProps, FieldErrors, FormMessage, ImageField, SubmitButton } from "../form-parts";
import { MonthField } from "../month-field";

const KIND_HINTS: Record<JourneyItem["kind"], string> = {
  work: "Emprego, estágio ou freelance",
  education: "Graduação, curso ou bootcamp",
  certificate: "Certificação com data de emissão",
};

export function JourneyForm({ item }: { item?: JourneyItem | null }) {
  const [state, formAction] = useActionState(saveJourneyAction, initialFormState);
  const values = state.values;
  const value = (name: keyof JourneyItem) =>
    values?.[name] ?? (item?.[name] as string | undefined | null) ?? "";

  const [kind, setKind] = useState<JourneyItem["kind"]>(
    (values?.kind as JourneyItem["kind"]) ?? item?.kind ?? "work"
  );
  const [isCurrent, setIsCurrent] = useState(
    values ? values.current === "on" : item ? !item.endDate : false
  );
  const isCertificate = kind === "certificate";
  const invalid = (name: string) => Boolean(state.fieldErrors?.[name]) || undefined;

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {item && <input type="hidden" name="id" value={item.id} />}
      <FormMessage state={state} />

      <FieldGroup>
        <FieldSet>
          <FieldLegend>Tipo</FieldLegend>
          <RadioGroup
            name="kind"
            value={kind}
            onValueChange={(next) => setKind(next as JourneyItem["kind"])}
            className="grid gap-3 sm:grid-cols-3"
          >
            {JOURNEY_KINDS.map((option) => (
              <Label
                key={option}
                htmlFor={`kind-${option}`}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10"
              >
                <RadioGroupItem id={`kind-${option}`} value={option} className="mt-0.5" />
                <span className="flex flex-col gap-1">
                  <span>{JOURNEY_KIND_LABELS[option]}</span>
                  <span className="text-xs font-normal text-muted-foreground">{KIND_HINTS[option]}</span>
                </span>
              </Label>
            ))}
          </RadioGroup>
          <FieldErrors state={state} name="kind" />
        </FieldSet>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={invalid("title")}>
            <FieldLabel htmlFor="title">{isCertificate ? "Nome do certificado" : kind === "work" ? "Cargo" : "Curso"}</FieldLabel>
            <Input {...fieldProps(state, "title")} defaultValue={value("title")} required maxLength={120} />
            <FieldErrors state={state} name="title" />
          </Field>

          <Field data-invalid={invalid("organization")}>
            <FieldLabel htmlFor="organization">{kind === "work" ? "Empresa" : "Instituição"}</FieldLabel>
            <Input {...fieldProps(state, "organization")} defaultValue={value("organization")} required maxLength={120} />
            <FieldErrors state={state} name="organization" />
          </Field>
        </div>

        <Field data-invalid={invalid("description")}>
          <FieldLabel htmlFor="description">Descrição</FieldLabel>
          <Textarea
            {...fieldProps(state, "description")}
            defaultValue={value("description")}
            rows={4}
            required
            maxLength={1200}
          />
          <FieldDescription>O que você fez, aprendeu ou conquistou. Até 1200 caracteres.</FieldDescription>
          <FieldErrors state={state} name="description" />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <MonthField
            state={state}
            name="startDate"
            label={isCertificate ? "Emitido em" : "Início"}
            defaultValue={value("startDate")}
            required
          />

          {!isCertificate && (
            <MonthField state={state} name="endDate" label="Término" defaultValue={value("endDate")} disabled={isCurrent}>
              <div className="flex items-center gap-2">
                <Switch id="current" name="current" checked={isCurrent} onCheckedChange={setIsCurrent} />
                <Label htmlFor="current" className="font-normal">
                  {kind === "work" ? "Trabalho aqui atualmente" : "Estou cursando"}
                </Label>
              </div>
            </MonthField>
          )}
        </div>
        {/* Certificados não têm término */}
        {isCertificate && <input type="hidden" name="current" value="" />}

        <Field data-invalid={invalid("link")}>
          <FieldLabel htmlFor="link">Link (opcional)</FieldLabel>
          <Input
            {...fieldProps(state, "link")}
            type="url"
            inputMode="url"
            placeholder="https://"
            defaultValue={value("link")}
          />
          <FieldDescription>
            {isCertificate ? "Link de verificação da credencial." : "Site da empresa ou do curso."}
          </FieldDescription>
          <FieldErrors state={state} name="link" />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <ImageField
            state={state}
            name="image"
            label="Imagem ou logo (opcional)"
            currentUrl={item?.imageUrl}
            removeName="removeImage"
          />
          <Field data-invalid={invalid("imageAlt")}>
            <FieldLabel htmlFor="imageAlt">Texto alternativo da imagem</FieldLabel>
            <Input {...fieldProps(state, "imageAlt")} defaultValue={value("imageAlt")} maxLength={160} />
            <FieldDescription>Descreva a imagem para quem usa leitor de tela. Ex.: “Logo da PUC Minas”.</FieldDescription>
            <FieldErrors state={state} name="imageAlt" />
          </Field>
        </div>
      </FieldGroup>

      <div className="flex flex-wrap gap-3">
        <SubmitButton pendingLabel="Salvando...">{item ? "Salvar alterações" : "Adicionar à trajetória"}</SubmitButton>
        {item && (
          <Button variant="outline" asChild>
            <Link href="/dashboard/trajetoria">Cancelar edição</Link>
          </Button>
        )}
      </div>
    </form>
  );
}
