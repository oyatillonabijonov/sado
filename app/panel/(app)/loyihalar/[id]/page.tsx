import { notFound } from "next/navigation";
import { DeleteItem } from "@/panel/DeleteItem";
import { mediaOptions } from "@/panel/doc";
import { emptyProject, loadProject } from "@/panel/projects-data";
import { ProjectForm } from "@/panel/ProjectForm";
import { BackLink, PageHeader } from "@/panel/ui";

export const dynamic = "force-dynamic";

/** Bitta route ikkalasiga xizmat qiladi — `yangi` yaratish degani. */
export default async function ProjectEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "yangi";
  const numericId = isNew ? null : Number(id);
  if (!isNew && Number.isNaN(numericId)) notFound();

  const [data, media] = await Promise.all([
    isNew ? emptyProject() : loadProject(numericId as number),
    mediaOptions(),
  ]);
  if (!data) notFound();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={isNew ? "Yangi loyiha" : data.title}
        back={<BackLink href="/panel/loyihalar">Loyihalar</BackLink>}
      />

      <ProjectForm data={data} media={media} />

      {!isNew && (
        <DeleteItem
          collection="projects"
          id={numericId as number}
          name={data.title}
          backTo="/panel/loyihalar"
          label="Loyihani o'chirish"
        />
      )}
    </div>
  );
}
