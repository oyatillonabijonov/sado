/**
 * Seksiya boshi: hairline, kicker va tinch sarlavha.
 *
 * `action` seksiyaga tegishli havolani sarlavha qatoriga olib chiqadi:
 * ilgari ular gridning ostida qolib, qaysi seksiyaga tegishli ekani
 * ko'rinmasdi.
 */
export default function SectionHeading({
  children,
  kicker,
  action,
  lead,
}: {
  children: React.ReactNode;
  kicker?: string;
  action?: React.ReactNode;
  lead?: string;
}) {
  return (
    <div className="mb-[64px] border-t border-graphite pt-[20px]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-[24px] gap-y-[16px]">
        {/* Kicker bo'lmasa ham bo'sh element qoladi: justify-between bitta
            bolada action'ni chapga tortib ketardi. */}
        <p className="text-fog-gray">{kicker}</p>
        {action}
      </div>
      <div className="mt-[40px] grid gap-[24px] lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-end">
        <h2 className="heading">{children}</h2>
        {/* Seksiya nima uchun borligini bir jumlada aytadi — sarlavhaning
            o'zi buni ayta olmaydi va o'quvchi taxmin qilishga majbur bo'ladi. */}
        {lead && <p className="max-w-[52ch] text-fog-gray lg:pb-[6px]">{lead}</p>}
      </div>
    </div>
  );
}
