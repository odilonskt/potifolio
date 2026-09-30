// Copia os arquivos WebAssembly da voz de IA (Piper + ONNX Runtime) para public/tts,
// para o site servi-los do próprio domínio em vez de CDNs de terceiros.
// Roda antes do dev e do build (package.json); public/tts fica fora do git.
import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// Dependências diretas: o pnpm as expõe na raiz de node_modules
const modules = join(process.cwd(), "node_modules");
const out = join(process.cwd(), "public", "tts");
mkdirSync(join(out, "ort"), { recursive: true });

const ortDist = join(modules, "onnxruntime-web", "dist");
for (const file of ["ort-wasm.wasm", "ort-wasm-simd.wasm", "ort-wasm-threaded.wasm", "ort-wasm-simd-threaded.wasm"]) {
  copyFileSync(join(ortDist, file), join(out, "ort", file));
}

const piperBuild = join(modules, "@diffusionstudio", "piper-wasm", "build");
for (const file of ["piper_phonemize.wasm", "piper_phonemize.data"]) {
  copyFileSync(join(piperBuild, file), join(out, file));
}

console.log("Voz de IA: arquivos copiados para public/tts");
