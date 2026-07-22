import type { Metadata } from "next";
import RedDotLink from "@/components/RedDotLink";
import SectionHeading from "@/components/SectionHeading";
import { services } from "@/data/services";

export const metadata: Metadata = {
  title: "Xizmatlar",
  description:
    "Brend strategiyasi, brend dizayn, veb-dizayn, UI/UX, motion va print — SADO xizmatlari.",
};

export default function ServicesPage() {
  return (
    <div className="px-[16px] pt-[120px]">
      <SectionHeading kicker="Xizmatlar">Nima qilamiz</SectionHeading>
      <div className="flex flex-col">
        {services.map((s) => (
          <section
            key={s.slug}
            id={s.slug}
            className="grid gap-[48px] border-t border-graphite py-[120px] lg:grid-cols-[1fr_1fr_1fr] scroll-mt-[48px]"
          >
            <div>
              <h2 className="text-heading-sm font-medium text-bone-white">
                {s.title}
              </h2>
              <p className="mt-[16px] max-w-[420px] text-fog-gray">
                {s.description}
              </p>
            </div>
            <div>
              <p className="text-fog-gray">Nimalar kiradi</p>
              <ul className="mt-[16px] flex flex-col gap-[8px]">
                {s.deliverables.map((d) => (
                  <li key={d} className="text-bone-white">
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-between gap-[48px]">
              <div>
                <p className="text-fog-gray">Kimga mos</p>
                <p className="mt-[16px] max-w-[360px] text-bone-white">
                  {s.fitFor}
                </p>
              </div>
              <RedDotLink href="/contact">Shu xizmat kerak</RedDotLink>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
