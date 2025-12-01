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

  const form = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
    mode: "onSubmit",
  });

  async function onSubmit(inputData: ContactFormInput) {
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
    <div className="w-full space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Grid de Campos */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Nome */}
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-white">
                    Nome *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Seu nome"
                      {...field}
                      className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 hover:border-gray-600 focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-400" />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-white">
                    Email *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="seu@email.com"
                      type="email"
                      {...field}
                      className="bg-gray-900/50 border-gray-700  placeholder:text-gray-500 hover:border-gray-600 focus:border-primary text-white"
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-400" />
                </FormItem>
              )}
            />

            {/* Telefone */}
            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-white">
                    Telefone
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(11) 99999-9999"
                      {...field}
                      value={field.value || ""}
                      className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 hover:border-gray-600 focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-400" />
                </FormItem>
              )}
            />

            {/* Assunto */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-white">
                    Assunto *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Assunto"
                      {...field}
                      className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 hover:border-gray-600 focus:border-primary "
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-400" />
                </FormItem>
              )}
            />
          </div>

          {/* Mensagem */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-white">
                  Mensagem *
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    className="min-h-[100px] bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 hover:border-gray-600 focus:border-primary"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Mínimo 10 caracteres, máximo 500 caracteres
                </FormDescription>
                <FormMessage className="text-sm text-red-400" />
              </FormItem>
            )}
          />

          {/* Status do Envio */}
          {success && (
            <div className="flex items-center gap-3 p-3 bg-green-900/30 border border-green-800/50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-300">Sucesso!</p>
                <p className="text-xs text-green-400/80">
                  Mensagem enviada. Entrarei em contato em breve.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-3 bg-red-900/30 border border-red-800/50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-300">Erro</p>
                <p className="text-xs text-red-400/80">{error}</p>
              </div>
            </div>
          )}

          {/* Botão de Envio */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3"
          >
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
