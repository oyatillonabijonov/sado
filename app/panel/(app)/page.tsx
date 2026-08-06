import { PageHeader } from '@/panel/ui';

export const dynamic = 'force-dynamic';

/**
 * The landing screen. Replace it with whatever the studio opens every day —
 * on the site this came from that is the contact-form submissions, so the
 * dashboard is a list of people waiting for a call back.
 *
 * Whatever goes here, keep it read-mostly. A landing screen that asks for a
 * decision before you have looked at anything is one people learn to skip.
 */
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader title="Boshqaruv" lead="Chapdagi ro‘yxatdan kerakli bo‘limni tanlang." />
    </div>
  );
}
