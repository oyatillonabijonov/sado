import { notFound } from "next/navigation";
import { DEFAULT_LOCALE, localeFrom } from "@/panel/locale";
import { DeleteItem } from "@/panel/DeleteItem";
import { emptyService, loadService } from "@/panel/services-data";
import { ServiceForm } from "@/panel/ServiceForm";
import { BackLink, PageHeader } from "@/panel/ui";

export const dynamic = "force-dynamic";

export default async function ServiceEditor({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ til?: string }>;
}) {
  const { id } = await params;
  const isNew = id === "yangi";
  // Yangi yozuv faqat asosiy tilda yaratiladi: `slug` lokalizatsiya
  // qilinmagan va ruscha ekrandan yaratilsa u bo'sh qolib, majburiy
  // maydon xatosiga urilardi. Tarjima birinchi saqlashdan keyin.
  const locale = isNew ? DEFAULT_LOCALE : localeFrom((await searchParams).til);
  const numericId = isNew ? null : Number(id);
  if (!isNew && Number.isNaN(numericId)) notFound();

  const data = isNew ? await emptyService() : await loadService(numericId as number, locale);
  if (!data) notFound();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={isNew ? "Yangi xizmat" : data.title || "(nomsiz)"}
        back={<BackLink href="/panel/xizmatlar">Xizmatlar</BackLink>}
      />

      {/*
        `key={locale}` — til almashganda formani QAYTA o'rnatadi.
        `Field` va `Area` boshqarilmaydigan input ustiga qurilgan: kalitsiz
        React komponentni qayta ishlatardi va `<textarea>` eski tildagi
        matnni ekranda ushlab qolardi. Ruschani saqlaganda o'sha o'zbekcha
        matn ruscha bo'lib yozilib ketardi — o'lchangan.
      */}
      <ServiceForm key={locale} data={data} locale={locale} />

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
