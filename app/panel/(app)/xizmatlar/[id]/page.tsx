import { notFound } from "next/navigation";
import { DeleteItem } from "@/panel/DeleteItem";
import { emptyService, loadService } from "@/panel/services-data";
import { ServiceForm } from "@/panel/ServiceForm";
import { BackLink, PageHeader } from "@/panel/ui";

export const dynamic = "force-dynamic";

export default async function ServiceEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "yangi";
  const numericId = isNew ? null : Number(id);
  if (!isNew && Number.isNaN(numericId)) notFound();

  const data = isNew ? await emptyService() : await loadService(numericId as number);
  if (!data) notFound();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={isNew ? "Yangi xizmat" : data.title}
        back={<BackLink href="/panel/xizmatlar">Xizmatlar</BackLink>}
      />

      <ServiceForm data={data} />

      {!isNew && (
        <DeleteItem
          collection="services"
          id={numericId as number}
          name={data.title}
          backTo="/panel/xizmatlar"
          label="Xizmatni o'chirish"
        />
      )}
    </div>
  );
}
