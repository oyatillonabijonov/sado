import type { Messages } from "@/lib/i18n";
import { clients } from "@/data/testimonials";

/** Mijozlar logolari — cheksiz auto-scroll (CSS marquee). Monoxrom oq. */
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
      <div className="sado-marquee-mask mt-[24px] overflow-hidden md:mt-[48px]">
        <div className="sado-marquee flex w-max items-center gap-[48px] md:gap-[96px]">
          {row.map((c, i) => (
            /* ponytail: `next/image` emas — logolar o'ndan ortiq turli
               nisbatda va u har biriga width/height talab qiladi. Manba
               fayllarning o'zi 224px WebP (jami 160 KB, ilgari 376 KB PNG),
               `lazy` esa ular hero yuklab bo'lgunicha kutishini ta'minlaydi. */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              aria-hidden={i >= clients.length}
              src={c.logo}
              alt={c.name}
              loading="lazy"
              decoding="async"
              className="block h-[40px] w-auto shrink-0 opacity-90 transition-opacity hover:opacity-100 md:h-[56px]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
