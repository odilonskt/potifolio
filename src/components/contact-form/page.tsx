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
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
      <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 md:p-8 lg:p-10 shadow-2xl">
        {/* Header responsivo */}
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-4 md:mb-6">
            <svg
              className="w-7 h-7 md:w-8 md:h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-3">
            Envie sua Mensagem
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Preencha o formulário abaixo e retornarei em até 24h úteis
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 md:space-y-8"
          >
            {/* Grid de Campos responsiva */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {/* Nome */}
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel className="text-sm font-medium text-gray-300">
                      Nome Completo <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Seu nome completo"
                        {...field}
                        className="h-11 sm:h-12 bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500 
                          hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary
                          transition-all duration-200 text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm text-red-400 mt-1" />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel className="text-sm font-medium text-gray-300">
                      E-mail <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="seu@email.com"
                        type="email"
                        {...field}
                        className="h-11 sm:h-12 bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500 
                          hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary
                          transition-all duration-200 text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm text-red-400 mt-1" />
                  </FormItem>
                )}
              />

              {/* Telefone */}
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel className="text-sm font-medium text-gray-300">
                      Telefone{" "}
                      <span className="text-gray-500 text-xs">(opcional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(11) 99999-9999"
                        {...field}
                        value={field.value || ""}
                        className="h-11 sm:h-12 bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500 
                          hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary
                          transition-all duration-200 text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm text-red-400 mt-1" />
                  </FormItem>
                )}
              />

              {/* Assunto */}
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel className="text-sm font-medium text-gray-300">
                      Assunto <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Sobre o que você quer conversar?"
                        {...field}
                        className="h-11 sm:h-12 bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500 
                          hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary
                          transition-all duration-200 text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm text-red-400 mt-1" />
                  </FormItem>
                )}
              />
            </div>

            {/* Mensagem (full width) */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center mb-2">
                    <FormLabel className="text-sm font-medium text-gray-300">
                      Mensagem <span className="text-red-500">*</span>
                    </FormLabel>
                    <span className="text-xs text-gray-500">
                      {field.value?.length || 0}/500
                    </span>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva detalhadamente sua necessidade ou projeto..."
                      className="min-h-[140px] sm:min-h-[160px] bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500 
                        hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary
                        transition-all duration-200 resize-none text-sm sm:text-base"
                      maxLength={500}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between mt-2">
                    <FormDescription className="text-xs text-gray-500">
                      Mínimo 10 caracteres
                    </FormDescription>
                    <FormMessage className="text-xs sm:text-sm text-red-400" />
                  </div>
                </FormItem>
              )}
            />

            {/* Status do Envio */}
            <div className="space-y-4">
              {success && (
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-900/30 to-green-800/20 border border-green-800/40 rounded-xl animate-fade-in">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-300">
                      Mensagem enviada com sucesso!
                    </p>
                    <p className="text-xs text-green-400/80 mt-1">
                      Agradeço seu contato. Responderei em até 24 horas úteis.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-800/40 rounded-xl animate-fade-in">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-300">
                      Erro ao enviar mensagem
                    </p>
                    <p className="text-xs text-red-400/80 mt-1">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Botão de Envio responsivo */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 sm:h-14 bg-gradient-to-r from-primary via-primary/90 to-primary 
                hover:from-primary/90 hover:via-primary/80 hover:to-primary/70
                text-white font-semibold text-base sm:text-lg
                rounded-xl shadow-lg hover:shadow-xl 
                transition-all duration-300 transform hover:-translate-y-0.5
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  <span className="text-sm sm:text-base">Enviando...</span>
                </>
              ) : (
                <>
                  <svg
                    className="mr-2 h-4 w-4 sm:h-5 sm:w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  <span className="text-sm sm:text-base">Enviar Mensagem</span>
                </>
              )}
            </Button>

            {/* Aviso de privacidade */}
            <div className="pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-500 text-center">
                Seus dados estão seguros. Nunca compartilhamos informações com
                terceiros.
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
