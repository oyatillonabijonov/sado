import { notFound } from "next/navigation";
import { DeleteItem } from "@/panel/DeleteItem";
import { mediaOptions } from "@/panel/doc";
import { emptyPost, loadPost } from "@/panel/posts-data";
import { PostForm } from "@/panel/PostForm";
import { BackLink, PageHeader } from "@/panel/ui";

export const dynamic = "force-dynamic";

export default async function PostEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "yangi";
  const numericId = isNew ? null : Number(id);
  if (!isNew && Number.isNaN(numericId)) notFound();

  const [data, media] = await Promise.all([
    isNew ? emptyPost() : loadPost(numericId as number),
    mediaOptions(),
  ]);
  if (!data) notFound();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={isNew ? "Yangi maqola" : data.title}
        back={<BackLink href="/panel/maqolalar">Maqolalar</BackLink>}
      />

      <PostForm data={data} media={media} />

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
