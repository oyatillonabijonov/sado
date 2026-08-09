import { payloadClient } from "@/panel/auth";
import { ItemList } from "@/panel/ItemList";
import { ActionButton, Empty, PageHeader } from "@/panel/ui";

export const dynamic = "force-dynamic";

export default async function TestimonialsListPage() {
  const payload = await payloadClient();
  const { docs } = await payload.find({
    collection: "testimonials",
    depth: 0,
    limit: 100,
    sort: "order",
  });

  const items = docs.map((doc) => ({
    id: doc.id as number,
    href: `/panel/otzivlar/${doc.id}`,
    title: String(doc.name ?? ""),
    subtitle: String(doc.quote ?? "").slice(0, 90),
    meta: [doc.role, doc.company].filter(Boolean).join(", ") || null,
  }));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Otzivlar"
        lead="Bosh sahifadagi “Bizga ishonganlar” qatori."
        action={<ActionButton href="/panel/otzivlar/yangi">Yangi otziv</ActionButton>}
      />

      {items.length === 0 ? (
        <Empty
          title="Hozircha bo'sh."
          hint="Otziv qo'shilmaguncha saytda kodga yozilgan uchta otziv chiqib turadi."
        />
      ) : (
        <ItemList collection="testimonials" items={items} />
      )}
    </div>
  );
}
