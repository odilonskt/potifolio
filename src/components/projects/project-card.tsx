import { ExternalLink, Rocket } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { Project } from "@/lib/content/schemas";

const IMAGE_SIZES = "(min-width: 1024px) 320px, (min-width: 768px) 50vw, 100vw";

/** Imagens do projeto: uma só vira capa; várias viram carrossel por botões (sem troca automática). */
function ProjectImages({ project }: { project: Project }) {
  const { images } = project;
  const alt = project.imageAlt ?? `Tela do projeto ${project.title}`;
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <Image
        src={images[0].url}
        alt={alt}
        width={640}
        height={360}
        sizes={IMAGE_SIZES}
        className="aspect-video w-full border-b border-border object-cover"
      />
    );
  }

  return (
    <Carousel aria-label={`Imagens de ${project.title}`} opts={{ loop: true }} className="border-b border-border">
      <CarouselContent className="ml-0">
        {images.map((image, index) => (
          <CarouselItem key={image.path} className="pl-0" aria-label={`${index + 1} de ${images.length}`}>
            <Image
              src={image.url}
              alt={`${alt} (${index + 1} de ${images.length})`}
              width={640}
              height={360}
              sizes={IMAGE_SIZES}
              className="aspect-video w-full object-cover"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 bg-background/90" />
      <CarouselNext className="right-2 bg-background/90" />
    </Carousel>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  const titleId = `project-${project.id}-title`;

  return (
    <article aria-labelledby={titleId} className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <ProjectImages project={project} />

      <div className="flex flex-1 flex-col gap-4 p-5">
        <h3 id={titleId} className="font-semibold break-words text-foreground">
          {project.title}
        </h3>

        <p className="text-sm text-muted-foreground">{project.summary}</p>

        {project.tags.length > 0 && (
          <ul aria-label="Tecnologias" className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <li key={tag}>
                <Badge variant="secondary">{tag}</Badge>
              </li>
            ))}
          </ul>
        )}

        {(project.repoUrl || project.demoUrl) && (
          <div className="mt-auto flex gap-2 pt-1">
            {project.repoUrl && (
              <Button asChild variant="outline" size="sm" className="flex-1">
                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink data-icon="inline-start" aria-hidden="true" />
                  Código<span className="sr-only"> de {project.title} (abre em nova aba)</span>
                </a>
              </Button>
            )}
            {project.demoUrl && (
              <Button asChild variant="secondary" size="sm" className="flex-1">
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                  <Rocket data-icon="inline-start" aria-hidden="true" />
                  Ver online<span className="sr-only"> {project.title} (abre em nova aba)</span>
                </a>
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
