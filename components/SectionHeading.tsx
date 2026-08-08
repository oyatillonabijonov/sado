/**
 * Seksiya boshi: hairline, indeks + kicker bir qatorda, tinch sarlavha.
 *
 * Indeks (01, 02, …) bejama emas — u bo'lmasa har bir seksiya bir xil
 * "chiziq + sarlavha" bo'lib qoladi va sahifa qaerdaligini bildirmaydi.
 * `action` esa seksiyaga tegishli havolani sarlavha qatoriga olib chiqadi:
 * ilgari ular gridning ostida qolib, qaysi seksiyaga tegishli ekani
 * ko'rinmasdi.
 */
export default function SectionHeading({
  children,
  kicker,
  index,
  action,
  lead,
}: {
  children: React.ReactNode;
  kicker?: string;
  index?: string;
  action?: React.ReactNode;
  lead?: string;
}) {
  return (
    <div className="mb-[64px] border-t border-graphite pt-[20px]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-[24px] gap-y-[16px]">
        <p className="flex items-baseline gap-[12px] text-fog-gray">
          {index && (
            <span className="tabular-nums text-bone-white">{index}</span>
          )}
          {kicker && <span>{kicker}</span>}
        </p>
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
