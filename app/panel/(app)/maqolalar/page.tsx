import { payloadClient } from "@/panel/auth";
import { formatDate } from "@/panel/format";
import { ItemList } from "@/panel/ItemList";
import { ActionButton, Empty, PageHeader } from "@/panel/ui";

export const dynamic = "force-dynamic";

export default async function PostsListPage() {
  const payload = await payloadClient();
  const { docs } = await payload.find({
    collection: "posts",
    // Qoralamalar ham ko'rinsin — busiz mijoz yozganini ro'yxatda topolmaydi.
    draft: true,
    depth: 1,
    limit: 100,
    sort: "-date",
  });

  const items = docs.map((doc) => {
    const cover = doc.cover;
    return {
      id: doc.id as number,
      href: `/panel/maqolalar/${doc.id}`,
      title: String(doc.title ?? ""),
      subtitle: String(doc.category ?? ""),
      meta: formatDate(doc.date as string, false),
      badge: doc._status === "draft" ? "Qoralama" : null,
      image: cover && typeof cover === "object" ? ((cover.url as string) ?? null) : null,
    };
  });

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Maqolalar"
        lead="Blog. Yangi maqola eng tepada chiqadi — tartib sana bo'yicha."
        action={<ActionButton href="/panel/maqolalar/yangi">Yangi maqola</ActionButton>}
      />

      {items.length === 0 ? (
        <Empty title="Hozircha bo'sh." hint="“Yangi maqola” tugmasi bilan birinchisini yozing." />
      ) : (
        <ItemList collection="posts" items={items} />
      )}
    </div>
  );
}
