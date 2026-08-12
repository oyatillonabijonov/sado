import { notFound } from "next/navigation";
import { DEFAULT_LOCALE, localeFrom } from "@/panel/locale";
import { DeleteItem } from "@/panel/DeleteItem";
import { mediaOptions } from "@/panel/doc";
import { emptyPost, loadPost } from "@/panel/posts-data";
import { PostForm } from "@/panel/PostForm";
import { BackLink, PageHeader } from "@/panel/ui";

export const dynamic = "force-dynamic";

export default async function PostEditor({
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

  const [data, media] = await Promise.all([
    isNew ? emptyPost() : loadPost(numericId as number, locale),
    mediaOptions(),
  ]);
  if (!data) notFound();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={isNew ? "Yangi maqola" : data.title || "(nomsiz)"}
        back={<BackLink href="/panel/maqolalar">Maqolalar</BackLink>}
      />

      <PostForm key={locale} data={data} media={media} locale={locale} />

      {!isNew && (
        <DeleteItem
          collection="posts"
          id={numericId as number}
          name={data.title}
          backTo="/panel/maqolalar"
          label="Maqolani o'chirish"
        />
      )}
    </div>
  );
}
