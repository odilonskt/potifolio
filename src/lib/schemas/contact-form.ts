import { z } from "zod";

export const contactFormSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z
    .string()
    .nonempty("Telefone é obrigatório")
    .regex(/^[0-9+()\s-]+$/, "Telefone inválido")
    .min(10, "Telefone deve ter pelo menos 10 caracteres")
    .max(20, "Telefone deve ter no máximo 20 caracteres"),
  message: z
    .string()
    .min(10, "Mensagem deve ter pelo menos 10 caracteres")
    .max(500, "Mensagem deve ter no máximo 500 caracteres"),
  subject: z
    .string()
    .min(5, "Assunto deve ter pelo menos 5 caracteres")
    .max(100, "Assunto deve ter no máximo 100 caracteres"),
  // Todos os campos devem ter default
  create: z.string().default(() => new Date().toISOString()),
  id: z.string().default(""),
  lidor: z.boolean().default(false),
  update: z.string().default(""),
});

// Criar um tipo mais específico para o formulário
export type ContactFormInput = z.input<typeof contactFormSchema>;
export type ContactFormData = z.output<typeof contactFormSchema>;
