import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

// Decorativo: é usado dentro de botões que já dizem "Salvando...", "Entrando..." etc.
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      aria-hidden="true"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
