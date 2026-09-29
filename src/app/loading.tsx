// Loading minimalista: um anel fino e um texto discreto.
// - Aparece com fade depois de 200ms, então navegações rápidas não "piscam".
// - Anunciado a leitores de tela (role="status").
// - Com "movimento reduzido", as animações são desligadas pelo CSS global.
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid min-h-dvh place-items-center bg-background"
    >
      <div className="loading-fade flex flex-col items-center gap-4">
        <span
          aria-hidden="true"
          className="size-8 rounded-full border-2 border-border border-t-brand motion-safe:animate-spin [animation-duration:900ms]"
        />
        <span className="text-sm text-muted-foreground">Carregando…</span>
      </div>
    </div>
  );
}
