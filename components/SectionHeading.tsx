/**
 * Seksiya boshi: hairline, kicker va tinch sarlavha.
 *
 * `action` seksiyaga tegishli havolani sarlavha qatoriga olib chiqadi:
 * ilgari ular gridning ostida qolib, qaysi seksiyaga tegishli ekani
 * ko'rinmasdi.
 *
 * `as` — sarlavha darajasi. Sukut bo'yicha `h2`, chunki komponent asosan
 * seksiya boshi sifatida ishlatiladi. Sahifaning O'Z sarlavhasi bo'lganda
 * `as="h1"` berish SHART: `/portfolio`, `/services`, `/about` va `/blog`
 * uzoq vaqt `h1` siz turgan — SEO auditda topilgan, sahifaning mavzusini
 * bildiruvchi eng kuchli signal yo'q edi. Vizual jihatdan farq yo'q,
 * ikkalasi ham `.heading` klassini oladi.
 */
export default function SectionHeading({
  children,
  kicker,
  action,
  lead,
  as: Heading = "h2",
}: {
  children: React.ReactNode;
  kicker?: string;
  action?: React.ReactNode;
  lead?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className="mb-stack border-t border-graphite pt-[20px]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-[24px] gap-y-[16px]">
        {/* Kicker bo'lmasa ham bo'sh element qoladi: justify-between bitta
            bolada action'ni chapga tortib ketardi. */}
        <p className="text-fog-gray">{kicker}</p>
        {action}
      </div>
      {/* 40px sarlavhagacha 1440px kanvasda o'lchangan. 375px da kicker,
          sarlavha va lead uchgalasi ekranning yarmini bo'sh joyga berardi. */}
      <div className="mt-[24px] grid gap-[16px] md:mt-[40px] md:gap-[24px] lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-end">
        <Heading className="heading">{children}</Heading>
        {/* Seksiya nima uchun borligini bir jumlada aytadi — sarlavhaning
            o'zi buni ayta olmaydi va o'quvchi taxmin qilishga majbur bo'ladi. */}
        {lead && <p className="max-w-[52ch] text-fog-gray lg:pb-[6px]">{lead}</p>}
      </div>
    </div>
  );
}
