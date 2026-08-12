import { notFound } from "next/navigation";
import { DEFAULT_LOCALE, localeFrom } from "@/panel/locale";
import { DeleteItem } from "@/panel/DeleteItem";
import { TestimonialForm } from "@/panel/TestimonialForm";
import { emptyTestimonial, loadTestimonial } from "@/panel/testimonials-data";
import { BackLink, PageHeader } from "@/panel/ui";

export const dynamic = "force-dynamic";

export default async function TestimonialEditor({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ til?: string }>;
}) {
  const { id } = await params;
  const isNew = id === "yangi";
  // Yangi yozuv faqat asosiy tilda yaratiladi.
  const locale = isNew ? DEFAULT_LOCALE : localeFrom((await searchParams).til);
  const numericId = isNew ? null : Number(id);
  if (!isNew && Number.isNaN(numericId)) notFound();

  const data = isNew ? await emptyTestimonial() : await loadTestimonial(numericId as number, locale);
  if (!data) notFound();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={isNew ? "Yangi otziv" : data.name}
        back={<BackLink href="/panel/otzivlar">Otzivlar</BackLink>}
      />

      <TestimonialForm key={locale} data={data} locale={locale} />

      {!isNew && (
        <DeleteItem
          collection="testimonials"
          id={numericId as number}
          name={data.name}
          backTo="/panel/otzivlar"
          label="Otzivni o'chirish"
        />
      )}
    </div>
  );
}
