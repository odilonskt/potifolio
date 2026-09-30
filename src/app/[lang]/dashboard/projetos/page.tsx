import { CheckCircle2, FolderKanban, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { requireAdmin } from "@/lib/auth/session";
import { getProject, listProjectsUncached } from "@/lib/content/repository";
import { localePath } from "@/lib/i18n/config";
import { dashboard } from "@/lib/i18n/messages/dashboard";
import { getLocale } from "@/lib/i18n/server";

import { deleteProjectAction } from "../actions";
import { DeleteButton } from "../form-parts";
import { PageHeader } from "../page-header";
import { ProjectForm } from "./project-form";

type Props = { searchParams: Promise<{ editar?: string; salvo?: string }> };

export default async function ProjectsDashboardPage({ searchParams }: Props) {
  await requireAdmin();
  const locale = await getLocale();
  const t = dashboard[locale];
  const { editar, salvo } = await searchParams;
  const [projects, editing] = await Promise.all([
    listProjectsUncached(),
    editar && /^[A-Za-z0-9_-]{1,64}$/.test(editar) ? getProject(editar) : null,
  ]);

  return (
    <>
      <PageHeader
        title={t.projects.title}
        description={t.projects.description}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="order-2 lg:order-1">
          <CardHeader>
            <CardTitle>{editing ? t.projects.editing(editing.title) : t.projects.newProject}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* key força o remount ao trocar de projeto */}
            <ProjectForm key={editing?.id ?? "novo"} project={editing} />
          </CardContent>
        </Card>

        <section aria-labelledby="projects-list-title" className="order-1 flex flex-col gap-4 self-start lg:order-2">
          <h2 id="projects-list-title" className="font-semibold text-foreground">
            {t.projects.listTitle(projects.length)}
          </h2>

          <div aria-live="polite">
            {salvo && (
              <Alert>
                <CheckCircle2 aria-hidden="true" />
                <AlertDescription>{t.projects.saved}</AlertDescription>
              </Alert>
            )}
          </div>

          {projects.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderKanban aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>{t.projects.emptyTitle}</EmptyTitle>
                <EmptyDescription>{t.projects.emptyDescription}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="flex flex-col gap-3">
              {projects.map((project) => (
                <li key={project.id}>
                  <Card className="gap-3 py-4">
                    <CardContent className="flex items-start gap-3 px-4">
                      {project.images[0] ? (
                        <Image
                          src={project.images[0].url}
                          alt=""
                          width={56}
                          height={40}
                          className="h-10 w-14 shrink-0 rounded-md border border-border object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                          <FolderKanban className="size-4 text-muted-foreground" aria-hidden="true" />
                        </span>
                      )}
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <p className="truncate font-medium">{project.title}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={project.published ? "secondary" : "outline"}>
                            {project.published ? t.common.published : t.common.draft}
                          </Badge>
                          <Badge variant="outline">
                            {t.projects.imageCount(project.images.length)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                    <div className="flex justify-end gap-1 px-4">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={localePath(locale, `/dashboard/projetos?editar=${project.id}`)}>
                          <Pencil data-icon="inline-start" aria-hidden="true" />
                          {t.common.edit}
                          <span className="sr-only"> {project.title}</span>
                        </Link>
                      </Button>
                      <DeleteButton id={project.id} itemName={project.title} action={deleteProjectAction} />
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
