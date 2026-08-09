import { clients } from "@/data/testimonials";

/** Mijozlar logolari — cheksiz auto-scroll (CSS marquee). Monoxrom oq. */
export default function ClientsMarquee() {
  const row = [...clients, ...clients];
  return (
    <section aria-label="Mijozlar" className="pt-[80px]">
      <div className="shell">
        <div className="border-t border-graphite pt-[20px]">
          <p className="text-fog-gray">Bizga 50+ kompaniyalar ishonch bildirgan</p>
        </div>
      </div>
      <div className="sado-marquee-mask mt-[48px] overflow-hidden">
        <div className="sado-marquee flex w-max items-center gap-[96px]">
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
              className="block h-[56px] w-auto shrink-0 opacity-90 transition-opacity hover:opacity-100"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
