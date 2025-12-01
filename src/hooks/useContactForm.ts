"use client";

import { ContactFormData } from "@/lib/schemas/contact-form";
import { useState } from "react";

export function useContactForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitForm = async (data: ContactFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    console.log("Enviando dados:", data);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("Status da resposta:", response.status);
      console.log("Content-Type:", response.headers.get("content-type"));

      // Verificar se é JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // Se não for JSON, ler como texto para debug
        const text = await response.text();
        console.error("Resposta não é JSON:", text.substring(0, 200));
        throw new Error(`Resposta inválida do servidor: ${response.status}`);
      }

      const result = await response.json();
      console.log("Resposta JSON:", result);

      if (!response.ok) {
        throw new Error(
          result.error || `Erro ${response.status}: ${response.statusText}`
        );
      }

      setSuccess(true);
      return { success: true, id: result.id };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      console.error("Erro no envio:", err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    submitForm,
    isLoading,
    error,
    success,
    reset,
  };
}
