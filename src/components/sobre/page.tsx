import { Section } from "@/components/section/section";
import { ABOUT, type AboutBlock, type Highlight } from "@/lib/content/profile";
import { common } from "@/lib/i18n/messages/common";
import { home } from "@/lib/i18n/messages/home";
import { getLocale } from "@/lib/i18n/server";

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

/** Destaca os trechos em negrito (e com link, quando houver) sem usar HTML cru. */
function renderWithHighlights(text: string, highlights: Highlight[], newTab: string) {
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
          <span className="sr-only"> {newTab}</span>
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

function AboutItem({ block, newTab }: { block: AboutBlock; newTab: string }) {
  return (
    <li className="grid gap-3 border-t border-border py-8 md:grid-cols-[14rem_1fr] md:gap-10">
      <h3 className="text-lg font-semibold text-foreground">{block.title}</h3>
      <div className="flex max-w-prose flex-col gap-3 text-base leading-relaxed text-muted-foreground">
        {block.paragraphs.map((paragraph) => (
          <p key={paragraph}>{renderWithHighlights(paragraph, block.highlights, newTab)}</p>
        ))}
      </div>
    </li>
  );
}

export default async function Sobre({ id = "meio" }: { id?: string }) {
  const locale = await getLocale();
  const t = home[locale].about;
  return (
    <Section id={id} title={t.title} description={t.description}>
      <ul className="border-b border-border">
        {ABOUT[locale].map((block) => (
          <AboutItem key={block.title} block={block} newTab={common[locale].newTab} />
        ))}
      </ul>
    </Section>
  );
}
