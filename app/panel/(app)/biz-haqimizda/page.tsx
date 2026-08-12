import { loadAbout } from "@/panel/about-data";
import { AboutForm } from "@/panel/AboutForm";
import { mediaOptions } from "@/panel/doc";
import { PageHeader } from "@/panel/ui";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [data, media] = await Promise.all([loadAbout(), mediaOptions()]);
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Biz haqimizda"
        lead="Sahifadagi hikoya, «Qanday ishlaymiz» kartalari, jamoa va aloqa bandi. Raqamlar Sozlamalarda."
      />
      <AboutForm data={data} media={media} />
    </div>
  );
}
