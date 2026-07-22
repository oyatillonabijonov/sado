import { clients } from "@/data/testimonials";

/** Mijozlar logolari — cheksiz auto-scroll (CSS marquee). Monoxrom oq. */
export default function ClientsMarquee() {
  const row = [...clients, ...clients];
  return (
    <section
      aria-label="Biz bilan ishlagan mijozlar"
      className="py-[48px]"
    >
      <p className="mb-[32px] text-body-sm text-fog-gray">
        Biz bilan ishlagan mijozlar
      </p>
      <div className="sado-marquee-mask overflow-hidden">
        <div className="sado-marquee flex w-max items-center gap-[56px]">
          {row.map((c, i) => (
            <img
              key={i}
              aria-hidden={i >= clients.length}
              src={c.logo}
              alt={c.name}
              className="block h-[36px] w-auto shrink-0 opacity-60 transition-opacity hover:opacity-100"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
