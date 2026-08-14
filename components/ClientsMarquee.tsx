import type { Messages } from "@/lib/i18n";
import { clients } from "@/data/testimonials";

/**
 * Mijozlar logolari. Desktopda cheksiz auto-scroll (CSS marquee), telefonda
 * qo'lda suriladigan qator — otzivlar qatoridagi bilan bir xil naqsh.
 */
export default function ClientsMarquee({ m }: { m: Messages }) {
  const row = [...clients, ...clients];
  return (
    <section aria-label={m["home.clients"]} className="pt-[48px] md:pt-[80px]">
      <div className="shell">
        <div className="border-t border-graphite pt-[20px]">
          <p className="text-fog-gray">{m["home.clients"]}</p>
        </div>
      </div>
      {/* 96px oraliq 1440px lentada nafas, 375px da esa bir vaqtning o'zida
          atigi bitta logo ko'rinishini anglatadi — "50+ kompaniya" da'vosi
          ekranda tasdiqlanmay qolardi. */}
      <div className="no-scrollbar sado-marquee-mask mt-[24px] overflow-x-auto overflow-y-hidden md:mt-[48px] md:overflow-hidden">
        {/* Oraliq konteynerdagi `gap` emas, har logoda `mr` — va bu ataylab.
            `gap` bilan lentaning eni 2×logolar + 19×oraliq bo'ladi, ya'ni
            animatsiyaning `-50%` i yarim oraliqqa (24px) kam siljiydi va
            halqa har aylanishda ko'zga tashlanadigan sakrash bilan yopilardi.
            `mr` bilan eni 2×logolar + 20×oraliq — `-50%` aniq mos tushadi. */}
        <div className="sado-marquee flex w-max items-center">
          {row.map((c, i) => (
            /* ponytail: `next/image` emas — logolar o'ndan ortiq turli
               nisbatda va u har biriga width/height talab qiladi. Manba
               fayllarning o'zi 224px WebP (jami 160 KB, ilgari 376 KB PNG).

               `loading="lazy"` YO'Q va bu ataylab. Bu rasmlarda width/height
               yo'q (`w-auto`), ya'ni yuklanmagunicha qutisi 0×40px bo'ladi —
               nol maydonli element esa hech qachon "viewportga kirdi" deb
               hisoblanmaydi, ya'ni lazy yuklash ishga tushmaydi va rasm
               kelmaydi. Tugallangan halqa: prodda 20 tadan 0 tasi yuklangan,
               lenta esa 912px sof bo'shliq bo'lib turgan. Hero bilan
               bandwidth talashmasligi uchun `fetchPriority="low"` yetarli. */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              aria-hidden={i >= clients.length}
              src={c.logo}
              alt={c.name}
              fetchPriority="low"
              decoding="async"
              /* Takror faqat cheksiz lenta uchun kerak. Qo'lda suriladigan
                 qatorda u swipe uzunligini ikki baravar qilardi. */
              className={`block h-[40px] w-auto shrink-0 opacity-90 transition-opacity mr-[48px] hover:opacity-100 md:h-[56px] md:mr-[96px] ${
                i >= clients.length ? "max-md:hidden" : ""
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
