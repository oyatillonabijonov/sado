import { payloadClient } from "@/panel/auth";
import { ItemList } from "@/panel/ItemList";
import { ActionButton, Empty, PageHeader } from "@/panel/ui";

export const dynamic = "force-dynamic";

export default async function ProjectsListPage() {
  const payload = await payloadClient();
  const { docs } = await payload.find({
    collection: "projects",
    depth: 1,
    limit: 100,
    sort: "order",
  });

  const items = docs.map((doc) => {
    const cover = doc.cover;
    return {
      id: doc.id as number,
      href: `/panel/loyihalar/${doc.id}`,
      title: String(doc.title ?? ""),
      subtitle: String(doc.client ?? ""),
      meta: String(doc.year ?? ""),
      badge: doc.featured ? "Bosh sahifada" : null,
      image: cover && typeof cover === "object" ? ((cover.url as string) ?? null) : null,
    };
  });

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Loyihalar"
        lead="Portfolio sahifasidagi ishlar. Tartibni strelkalar bilan o'zgartiring."
        action={<ActionButton href="/panel/loyihalar/yangi">Yangi loyiha</ActionButton>}
      />

      {items.length === 0 ? (
        <Empty title="Hozircha bo'sh." hint="“Yangi loyiha” tugmasi bilan birinchisini qo'shing." />
      ) : (
        <ItemList collection="projects" items={items} />
      )}
    </div>
  );
}
