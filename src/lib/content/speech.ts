// lib/content/speech.ts
// Texto para leitura em voz alta: Markdown vira texto corrido e é dividido em
// trechos curtos (as vozes funcionam melhor frase a frase).

/** Remove a marcação do Markdown; blocos de código viram um aviso curto. */
export function markdownToSpeech(markdown: string, codeBlockNotice: string): string {
  return (
    markdown
      // Blocos de código não são lidos: só avisa que existem
      .replace(/```[\s\S]*?```/g, `\n${codeBlockNotice}\n`)
      .replace(/~~~[\s\S]*?~~~/g, `\n${codeBlockNotice}\n`)
      // Imagens somem; links ficam só com o texto
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      // Tabelas: separador some, cada linha vira "célula, célula"
      .replace(/^[ \t]*\|?(?:[ \t]*:?-+:?[ \t]*\|)+[ \t]*:?-*:?[ \t]*$/gm, "")
      .replace(/^[ \t]*\|(.*)\|[ \t]*$/gm, (_, row: string) =>
        row
          .split("|")
          .map((cell) => cell.trim())
          .filter(Boolean)
          .join(", "),
      )
      // Código inline, títulos, citações, listas, ênfase e linhas horizontais
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^[ \t]{0,3}#{1,6}[ \t]+/gm, "")
      .replace(/^[ \t]{0,3}>[ \t]?/gm, "")
      .replace(/^[ \t]*(?:[-*+]|\d+[.)])[ \t]+/gm, "")
      .replace(/(\*\*|__|\*|_|~~)(.+?)\1/g, "$2")
      .replace(/^[ \t]*(?:-{3,}|\*{3,}|_{3,})[ \t]*$/gm, "")
      // Uma ideia por linha, sempre terminando em pontuação (a voz faz a pausa)
      .split("\n")
      .map((line) => line.replace(/[ \t]+/g, " ").trim())
      .filter(Boolean)
      .map((line) => (/[.!?…:;]$/.test(line) ? line : `${line}.`))
      .join("\n")
  );
}

/** Quebra um texto longo sem pontuação em pedaços de até `max`, preferindo espaços e vírgulas. */
function hardSplit(text: string, max: number): string[] {
  const parts: string[] = [];
  let rest = text;
  while (rest.length > max) {
    const window = rest.slice(0, max);
    const cut = Math.max(window.lastIndexOf(" "), window.lastIndexOf(","));
    const at = cut > max / 2 ? cut + 1 : max;
    parts.push(rest.slice(0, at).trim());
    rest = rest.slice(at);
  }
  if (rest.trim()) parts.push(rest.trim());
  return parts;
}

/** Divide em frases e junta as curtas, sem passar de `max` caracteres por trecho. */
export function splitForSpeech(text: string, max = 220): string[] {
  const sentences = text
    .split(/\n+|(?<=[.!?…;:])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  for (const sentence of sentences) {
    for (const part of sentence.length > max ? hardSplit(sentence, max) : [sentence]) {
      const last = chunks.at(-1);
      // Junta frases curtas para a leitura não ficar picotada
      if (last && last.length < 80 && last.length + part.length + 1 <= max) chunks[chunks.length - 1] = `${last} ${part}`;
      else chunks.push(part);
    }
  }
  return chunks;
}
