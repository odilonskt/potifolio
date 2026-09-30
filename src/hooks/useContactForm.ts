"use client";

import { useState } from "react";

import { useMessages } from "@/lib/i18n/client";
import { home } from "@/lib/i18n/messages/home";
import { ContactFormData } from "@/lib/schemas/contact-form";

export function useContactForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const t = useMessages(home).contact;

  // antispam: campo honeypot + tempo de preenchimento (validados no servidor)
  const submitForm = async (data: ContactFormData & { website?: string; elapsedMs?: number }) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(t.invalidResponse);
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t.httpError(response.status));
      }

      setSuccess(true);
      return { success: true, id: result.id };
    } catch (err) {
      const message = err instanceof Error ? err.message : t.unknownError;
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
