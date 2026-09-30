"use client";

import { Headphones, Pause, Play, Square } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMessages } from "@/lib/i18n/client";
import { HTML_LANG, type Locale } from "@/lib/i18n/config";
import { blog } from "@/lib/i18n/messages/blog";

// Leitura do post em voz alta, com duas vozes:
// - "system": Web Speech API do navegador. Instantânea, nenhum dado sai do aparelho.
// - "ai": Piper (modelo open-source, licença MIT) rodando no navegador via WebAssembly.
//   Só é baixado quando o visitante escolhe essa voz (aviso de download e de privacidade).

type Engine = "system" | "ai";
type Status = "idle" | "loading" | "playing" | "paused" | "finished" | "error";

/** Uma voz Piper por idioma do conteúdo (todas "medium": ~60 MB cada) */
const PIPER_VOICES: Record<Locale, string> = {
  pt: "pt_BR-faber-medium",
  en: "en_US-hfc_female-medium",
  es: "es_MX-ald-medium",
};
const PIPER_SIZE = "≈ 60 MB";

/** Arquivos WebAssembly servidos pelo próprio site (scripts/copy-tts-assets.mjs) */
const WASM_PATHS = {
  onnxWasm: "/tts/ort/",
  piperData: "/tts/piper_phonemize.data",
  piperWasm: "/tts/piper_phonemize.wasm",
};

const RATES = [0.75, 1, 1.25, 1.5] as const;

type PiperSession = { predict(text: string): Promise<Blob> };

const noopSubscribe = () => () => {};
const hasSpeechSynthesis = () => typeof window !== "undefined" && "speechSynthesis" in window;

/** Melhor voz do sistema para o idioma: exata (pt-BR), depois pela língua (pt), preferindo as locais. */
function pickSystemVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const base = lang.split("-")[0].toLowerCase();
  const matches = voices.filter((voice) => voice.lang.toLowerCase().startsWith(base));
  return (
    matches.find((voice) => voice.lang.toLowerCase() === lang.toLowerCase() && voice.localService) ??
    matches.find((voice) => voice.lang.toLowerCase() === lang.toLowerCase()) ??
    matches.find((voice) => voice.localService) ??
    matches[0]
  );
}

export function ReadAloud({ chunks, contentLocale }: { chunks: string[]; contentLocale: Locale }) {
  const t = useMessages(blog).readAloud;
  const lang = HTML_LANG[contentLocale];
  const systemAvailable = useSyncExternalStore(noopSubscribe, hasSpeechSynthesis, () => true);

  const [engine, setEngine] = useState<Engine>("system");
  const [status, setStatus] = useState<Status>("idle");
  const [index, setIndex] = useState(0);
  const [rate, setRate] = useState<(typeof RATES)[number]>(1);
  const [download, setDownload] = useState<number | null>(null);

  // Cada leitura tem um id: callbacks de uma leitura parada são ignorados
  const runRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sessionRef = useRef<PiperSession | null>(null);
  const urlsRef = useRef<string[]>([]);
  const rateRef = useRef(rate);
  rateRef.current = rate;

  const activeEngine: Engine = systemAvailable ? engine : "ai";
  const busy = status === "loading" || status === "playing" || status === "paused";

  function cleanup() {
    runRef.current += 1;
    if (hasSpeechSynthesis()) window.speechSynthesis.cancel();
    audioRef.current?.pause();
    audioRef.current = null;
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsRef.current = [];
  }

  // Para a leitura ao sair da página
  useEffect(() => cleanup, []);

  // Velocidade muda também durante a leitura com a voz de IA
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate]);

  // ─── Voz do sistema ─────────────────────────────────────────────────────────

  function speakSystem(run: number, at: number) {
    if (run !== runRef.current) return;
    if (at >= chunks.length) {
      setStatus("finished");
      return;
    }
    setIndex(at);
    const utterance = new SpeechSynthesisUtterance(chunks[at]);
    utterance.lang = lang;
    const voice = pickSystemVoice(lang);
    if (voice) utterance.voice = voice;
    utterance.rate = rateRef.current;
    utterance.onend = () => speakSystem(run, at + 1);
    utterance.onerror = (event) => {
      // "interrupted"/"canceled" vêm do próprio Parar
      if (run === runRef.current && event.error !== "interrupted" && event.error !== "canceled") setStatus("error");
    };
    window.speechSynthesis.speak(utterance);
  }

  // ─── Voz de IA (Piper) ──────────────────────────────────────────────────────

  async function loadPiper(): Promise<PiperSession> {
    if (sessionRef.current) return sessionRef.current;
    const { TtsSession } = await import("@mintplex-labs/piper-tts-web");
    const session = await TtsSession.create({
      voiceId: PIPER_VOICES[contentLocale],
      wasmPaths: WASM_PATHS,
      progress: ({ loaded, total }) => {
        if (total > 0) setDownload(Math.min(100, Math.round((loaded / total) * 100)));
      },
    });
    sessionRef.current = session;
    return session;
  }

  async function speakAi(run: number, at: number, pending?: Promise<Blob>) {
    if (run !== runRef.current) return;
    if (at >= chunks.length) {
      setStatus("finished");
      return;
    }
    const session = sessionRef.current;
    if (!session) return;
    try {
      const wav = await (pending ?? session.predict(chunks[at]));
      if (run !== runRef.current) return;
      // Gera o próximo trecho enquanto este toca
      const next = at + 1 < chunks.length ? session.predict(chunks[at + 1]) : undefined;
      next?.catch(() => undefined);

      const url = URL.createObjectURL(wav);
      urlsRef.current.push(url);
      const audio = new Audio(url);
      audio.playbackRate = rateRef.current;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        void speakAi(run, at + 1, next);
      };
      audioRef.current = audio;
      setIndex(at);
      setStatus("playing");
      await audio.play();
    } catch (error) {
      console.error("Voz de IA:", error);
      if (run === runRef.current) setStatus("error");
    }
  }

  // ─── Controles ──────────────────────────────────────────────────────────────

  async function start() {
    cleanup();
    const run = runRef.current;
    setIndex(0);
    if (activeEngine === "system") {
      setStatus("playing");
      speakSystem(run, 0);
      return;
    }
    setStatus("loading");
    try {
      await loadPiper();
      setDownload(null);
      await speakAi(run, 0);
    } catch (error) {
      console.error("Voz de IA:", error);
      if (run === runRef.current) setStatus("error");
    }
  }

  function pause() {
    if (activeEngine === "system") window.speechSynthesis.pause();
    else audioRef.current?.pause();
    setStatus("paused");
  }

  function resume() {
    if (activeEngine === "system") window.speechSynthesis.resume();
    else void audioRef.current?.play();
    setStatus("playing");
  }

  function stop() {
    cleanup();
    setStatus("idle");
    setIndex(0);
  }

  if (chunks.length === 0) return null;

  const statusText =
    status === "loading"
      ? download !== null
        ? t.downloading(download)
        : t.preparing
      : status === "playing"
        ? t.reading(index + 1, chunks.length)
        : status === "paused"
          ? t.paused
          : status === "finished"
            ? t.finished
            : status === "error"
              ? t.error
              : "";

  return (
    <section aria-labelledby="ouvir-titulo" className="mt-8 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5 print:hidden">
      <h2 id="ouvir-titulo" className="flex items-center gap-2 text-base font-semibold text-foreground">
        <Headphones className="size-4 text-brand" aria-hidden="true" />
        {t.title}
      </h2>

      <fieldset disabled={busy} className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium text-foreground">{t.voice}</legend>
        <RadioGroup value={activeEngine} onValueChange={(value) => setEngine(value as Engine)} className="grid gap-2 sm:grid-cols-2">
          {systemAvailable && (
            <Label
              htmlFor="voz-sistema"
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10"
            >
              <RadioGroupItem id="voz-sistema" value="system" className="mt-0.5" aria-describedby="voz-sistema-hint" />
              <span className="flex flex-col gap-1">
                <span className="text-foreground">{t.systemVoice}</span>
                <span id="voz-sistema-hint" className="text-xs text-muted-foreground">
                  {t.systemVoiceHint}
                </span>
              </span>
            </Label>
          )}
          <Label
            htmlFor="voz-ia"
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10"
          >
            <RadioGroupItem id="voz-ia" value="ai" className="mt-0.5" aria-describedby="voz-ia-hint" />
            <span className="flex flex-col gap-1">
              <span className="text-foreground">{t.aiVoice}</span>
              <span id="voz-ia-hint" className="text-xs text-muted-foreground">
                {t.aiVoiceHint(PIPER_SIZE)}
              </span>
            </span>
          </Label>
        </RadioGroup>
        {!systemAvailable && <p className="text-xs text-muted-foreground">{t.unsupported}</p>}
      </fieldset>

      <div className="flex flex-wrap items-center gap-2">
        {status === "playing" ? (
          <Button type="button" onClick={pause}>
            <Pause data-icon="inline-start" aria-hidden="true" />
            {t.pause}
          </Button>
        ) : status === "paused" ? (
          <Button type="button" onClick={resume}>
            <Play data-icon="inline-start" aria-hidden="true" />
            {t.resume}
          </Button>
        ) : (
          <Button type="button" onClick={() => void start()} disabled={status === "loading"}>
            <Play data-icon="inline-start" aria-hidden="true" />
            {t.listen}
          </Button>
        )}
        {busy && (
          <Button type="button" variant="outline" onClick={stop}>
            <Square data-icon="inline-start" aria-hidden="true" />
            {t.stop}
          </Button>
        )}

        <label className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          {t.speed}
          <select
            value={rate}
            onChange={(event) => setRate(Number(event.target.value) as (typeof RATES)[number])}
            // A voz do sistema só aplica a velocidade no próximo trecho; bloqueia durante a leitura
            disabled={activeEngine === "system" && busy}
            className="h-9 rounded-md border border-input bg-background px-2 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {RATES.map((option) => (
              <option key={option} value={option}>
                {option}×
              </option>
            ))}
          </select>
        </label>
      </div>

      {status === "loading" && download !== null && <Progress value={download} aria-label={t.downloading(download)} />}
      <p aria-live="polite" className="min-h-5 text-sm text-muted-foreground">
        {statusText}
      </p>
    </section>
  );
}
