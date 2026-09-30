import { z } from "zod";

import { home } from "@/lib/i18n/messages/home";

type ContactValidation = (typeof home)["pt"]["contact"]["validation"];

/** Mesmo schema no navegador e na API, com as mensagens no idioma de quem envia. */
export function createContactFormSchema(v: ContactValidation) {
  return z.object({
    nome: z.string().min(2, v.nameMin).max(50, v.nameMax),
    email: z.string().email(v.email),
    // Opcional (minimização de dados, LGPD): só valida o formato quando preenchido
    telefone: z
      .string()
      .trim()
      .max(20, v.phoneMax)
      .refine((value) => value === "" || /^[0-9+()\s-]{10,20}$/.test(value), v.phone)
      .default(""),
    message: z.string().min(10, v.messageMin).max(500, v.messageMax),
    subject: z.string().min(5, v.subjectMin).max(100, v.subjectMax),
    // Todos os campos devem ter default
    create: z.string().default(() => new Date().toISOString()),
    id: z.string().default(""),
    lidor: z.boolean().default(false),
    update: z.string().default(""),
  });
}

export const contactFormSchema = createContactFormSchema(home.pt.contact.validation);

// Criar um tipo mais específico para o formulário
export type ContactFormInput = z.input<typeof contactFormSchema>;
export type ContactFormData = z.output<typeof contactFormSchema>;
