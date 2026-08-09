import { payloadClient } from '@/panel/auth';
import { DeleteItem } from '@/panel/DeleteItem';
import { formatDate, telHref } from '@/panel/format';
import { Empty, PageHeader } from '@/panel/ui';

export const dynamic = 'force-dynamic';

/**
 * The landing screen: people waiting for a call back.
 *
 * A dashboard earns the first slot in the nav only if it shows something that
 * changed since yesterday. Nothing else in this panel does — projects and
 * services move when the studio moves them. Form submissions arrive on their
 * own, so they are the one thing worth opening every morning.
 *
 * Read-only by design: a row is a name and a number to ring, plus a way to
 * throw away spam. There is nothing here to edit — the person wrote it.
 */
export default async function DashboardPage() {
  const payload = await payloadClient();
  const { docs } = await payload.find({
    collection: 'submissions',
    depth: 0,
    limit: 100,
    sort: '-createdAt',
  });

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="So‘rovlar"
        lead="Saytdagi aloqa formasidan kelgan murojaatlar — eng yangisi birinchi."
      />

      {docs.length === 0 ? (
        <Empty
          title="Hozircha so‘rov yo‘q."
          hint="Saytdagi forma to‘ldirilganda murojaat shu yerda paydo bo‘ladi."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {docs.map((doc) => {
            const name = String(doc.name ?? '');
            const phone = String(doc.phone ?? '');
            const company = String(doc.company ?? '');
            return (
              <li
                key={doc.id}
                className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3 rounded-card border border-mist p-4 lg:p-5"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate text-body-lg">{name}</span>
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm text-driftwood">
                    <span>{String(doc.service ?? '')}</span>
                    {company && <span className="truncate">{company}</span>}
                    <span>{formatDate(doc.createdAt as string)}</span>
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  {/* Qo‘ng‘iroq — bir bosishda, raqamni ko‘chirmasdan. */}
                  <a
                    href={telHref(phone)}
                    className="text-body underline underline-offset-4 hover:text-ember"
                  >
                    {phone}
                  </a>
                  <DeleteItem
                    collection="submissions"
                    id={doc.id as number}
                    name={name}
                    backTo="/panel"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
