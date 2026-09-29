import { Section } from "@/components/section/section";
import { ABOUT, type AboutBlock, type Highlight } from "@/lib/content/profile";

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

/** Destaca os trechos em negrito (e com link, quando houver) sem usar HTML cru. */
function renderWithHighlights(text: string, highlights: Highlight[]) {
  if (highlights.length === 0) return text;

  // Trechos mais longos primeiro, para "Node.js" não quebrar "Express/Nest.js"
  const sorted = [...highlights].sort((a, b) => b.text.length - a.text.length);
  const pattern = new RegExp(`(${sorted.map((h) => escapeRegExp(h.text)).join("|")})`, "gi");

  return text.split(pattern).map((part, index) => {
    const match = sorted.find((h) => h.text.toLowerCase() === part.toLowerCase());
    if (!match) return part;

    if (match.href) {
      return (
        <a
          key={index}
          href={match.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm font-semibold text-foreground underline decoration-brand underline-offset-4 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {part}
          <span className="sr-only"> (abre em nova aba)</span>
        </a>
      );
    }
    return (
      <strong key={index} className="font-semibold text-foreground">
        {part}
      </strong>
    );
  });
}

function AboutItem({ block }: { block: AboutBlock }) {
  return (
    <li className="grid gap-3 border-t border-border py-8 md:grid-cols-[14rem_1fr] md:gap-10">
      <h3 className="text-lg font-semibold text-foreground">{block.title}</h3>
      <div className="flex max-w-prose flex-col gap-3 text-base leading-relaxed text-muted-foreground">
        {block.paragraphs.map((paragraph) => (
          <p key={paragraph}>{renderWithHighlights(paragraph, block.highlights)}</p>
        ))}
      </div>
    </li>
  );
}

export default function Sobre({ id = "meio" }: { id?: string }) {
  return (
    <Section id={id} title="Sobre" description="Quem sou, o que sei fazer e onde estudo.">
      <ul className="border-b border-border">
        {ABOUT.map((block) => (
          <AboutItem key={block.title} block={block} />
        ))}
      </ul>
    </Section>
  );
}
