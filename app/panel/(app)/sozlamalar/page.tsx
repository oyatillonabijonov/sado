import { mediaOptions } from "@/panel/doc";
import { localeFrom } from "@/panel/locale";
import { loadSettings } from "@/panel/settings-data";
import { SettingsForm } from "@/panel/SettingsForm";
import { PageHeader } from "@/panel/ui";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ til?: string }>;
}) {
  const locale = localeFrom((await searchParams).til);
  const [data, media] = await Promise.all([loadSettings(locale), mediaOptions()]);
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Sozlamalar"
        lead="Aloqa ma'lumotlari, ijtimoiy tarmoqlar, bosh sahifa matni, hero va xizmatlar sahifasi rasmlari."
      />
      <SettingsForm key={locale} data={data} media={media} locale={locale} />
    </div>
  );
}
