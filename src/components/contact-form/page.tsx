"use client";

import { useContactForm } from "@/hooks/useContactForm";
import {
  ContactFormData,
  ContactFormInput,
  contactFormSchema,
} from "@/lib/schemas/contact-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

// Valores padrão compatíveis com o schema
const defaultValues: ContactFormInput = {
  nome: "",
  email: "",
  telefone: "",
  message: "",
  subject: "",
  lidor: false,
  create: new Date().toISOString(),
  id: "",
  update: "",
};

export function ContactForm() {
  const { submitForm, isLoading, error, success, reset } = useContactForm();

  // Use FormInput para o useForm e FormData para o submit
  const form = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
    mode: "onSubmit",
  });

  async function onSubmit(inputData: ContactFormInput) {
    // Converter para ContactFormData (após validação)
    const validatedData = contactFormSchema.parse(inputData);

    const formData: ContactFormData = {
      ...validatedData,
      id: validatedData.id || uuidv4(),
      update: new Date().toISOString(),
    };

    const result = await submitForm(formData);

    if (result.success) {
      form.reset(defaultValues);
      reset();
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Nome */}
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo *</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input placeholder="seu@email.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Telefone */}
          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="(11) 99999-9999"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Assunto */}
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assunto *</FormLabel>
                <FormControl>
                  <Input placeholder="Assunto da mensagem" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mensagem */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mensagem *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Mínimo 10 caracteres, máximo 500 caracteres
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status do Envio */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-green-800 text-sm">
                Mensagem enviada com sucesso! Entrarei em contato em breve.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Botão de Envio */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Mensagem"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
