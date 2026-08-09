import { mediaOptions } from "@/panel/doc";
import { loadSettings } from "@/panel/settings-data";
import { SettingsForm } from "@/panel/SettingsForm";
import { PageHeader } from "@/panel/ui";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [data, media] = await Promise.all([loadSettings(), mediaOptions()]);
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Sozlamalar"
        lead="Aloqa ma'lumotlari, ijtimoiy tarmoqlar, bosh sahifa matni va hero rasmlari."
      />
      <SettingsForm data={data} media={media} />
    </div>
  );
}
