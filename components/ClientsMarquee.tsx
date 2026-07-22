import { clients } from "@/data/testimonials";

/** Mijozlar logolari — cheksiz auto-scroll (CSS marquee). Monoxrom oq. */
export default function ClientsMarquee() {
  const row = [...clients, ...clients];
  return (
    <section aria-label="Mijozlar" className="pt-[80px]">
      <div className="border-t border-graphite pt-[20px]">
        <p className="text-fog-gray">Bizga 50+ kompaniyalar ishonch bildirgan</p>
      </div>
      <div className="sado-marquee-mask mt-[48px] overflow-hidden">
        <div className="sado-marquee flex w-max items-center gap-[64px]">
          {row.map((c, i) => (
            <img
              key={i}
              aria-hidden={i >= clients.length}
              src={c.logo}
              alt={c.name}
              className="block h-[28px] w-auto shrink-0 opacity-50 transition-opacity hover:opacity-100"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
