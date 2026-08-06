import { payloadClient } from '@/panel/auth';
import { MediaScreen, type MediaRow } from '@/panel/MediaScreen';
import { PageHeader } from '@/panel/ui';

export const dynamic = 'force-dynamic';

const size = (bytes: unknown) => {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return '—';
  return n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
};

export default async function MediaPage() {
  const payload = await payloadClient();
  const { docs, totalDocs } = await payload.find({
    collection: 'media',
    limit: 300,
    sort: '-createdAt',
  });

  const rows: MediaRow[] = docs
    .filter((d) => typeof d.url === 'string')
    .map((d) => ({
      id: d.id as number,
      url: d.url as string,
      alt: String(d.alt ?? ''),
      filename: String(d.filename ?? ''),
      size: size(d.filesize),
    }));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Rasmlar"
        lead={`Bu yerga yuklanadi, keyin loyiha yoki maqola ichidan tanlanadi. Turli o‘lchamlari o‘zi tayyorlanadi. Jami ${totalDocs} ta.`}
      />
      <MediaScreen rows={rows} />
    </div>
  );
}
