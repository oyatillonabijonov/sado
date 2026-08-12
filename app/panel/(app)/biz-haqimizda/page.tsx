import { loadAbout } from "@/panel/about-data";
import { AboutForm } from "@/panel/AboutForm";
import { mediaOptions } from "@/panel/doc";
import { localeFrom } from "@/panel/locale";
import { PageHeader } from "@/panel/ui";

export const dynamic = "force-dynamic";

export default async function AboutPage({
  searchParams,
}: {
  searchParams: Promise<{ til?: string }>;
}) {
  const locale = localeFrom((await searchParams).til);
  const [data, media] = await Promise.all([loadAbout(locale), mediaOptions()]);
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Biz haqimizda"
        lead="Sahifadagi hikoya, «Qanday ishlaymiz» kartalari, jamoa va aloqa bandi. Raqamlar Sozlamalarda."
      />
      <AboutForm key={locale} data={data} media={media} locale={locale} />
    </div>
  );
}
