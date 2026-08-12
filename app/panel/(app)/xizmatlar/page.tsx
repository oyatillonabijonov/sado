import { payloadClient } from "@/panel/auth";
import { mediaOptions, relId } from "@/panel/doc";
import { ServicesCoverForm } from "@/panel/ServicesCoverForm";
import { ItemList } from "@/panel/ItemList";
import { ActionButton, Empty, PageHeader } from "@/panel/ui";

export const dynamic = "force-dynamic";

export default async function ServicesListPage() {
  const payload = await payloadClient();
  const [media, settings] = await Promise.all([
    mediaOptions(),
    payload.findGlobal({ slug: "settings", depth: 0 }),
  ]);
  const { docs } = await payload.find({
    collection: "services",
    depth: 0,
    limit: 100,
    sort: "order",
  });

  const items = docs.map((doc) => ({
    id: doc.id as number,
    href: `/panel/xizmatlar/${doc.id}`,
    title: String(doc.title ?? ""),
    subtitle: String(doc.description ?? "").slice(0, 90),
  }));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Xizmatlar"
        lead="Xizmatlar sahifasi va bosh sahifadagi ro'yxat."
        action={<ActionButton href="/panel/xizmatlar/yangi">Yangi xizmat</ActionButton>}
      />

      <ServicesCoverForm cover={relId(settings.servicesCover)} media={media} />

      {items.length === 0 ? (
        <Empty title="Hozircha bo'sh." hint="“Yangi xizmat” tugmasi bilan birinchisini qo'shing." />
      ) : (
        <ItemList collection="services" items={items} />
      )}
    </div>
  );
}
