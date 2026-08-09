import { loadSettings } from "@/panel/settings-data";
import { SettingsForm } from "@/panel/SettingsForm";
import { PageHeader } from "@/panel/ui";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const data = await loadSettings();
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Sozlamalar"
        lead="Aloqa ma'lumotlari, ijtimoiy tarmoqlar va bosh sahifaning birinchi ekrani."
      />
      <SettingsForm data={data} />
    </div>
  );
}
