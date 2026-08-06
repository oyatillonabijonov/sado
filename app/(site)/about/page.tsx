import type { Metadata } from "next";
import Image from "next/image";
import RedDotLink from "@/components/RedDotLink";
import SectionHeading from "@/components/SectionHeading";
import { stats, team, values } from "@/data/team";

export const metadata: Metadata = {
  title: "Biz haqimizda",
  description:
    "SADO — 2018-yildan beri Toshkentda ishlaydigan mustaqil dizayn agentligi.",
};

export default function AboutPage() {
  return (
    <div className="px-[16px] pt-[120px]">
      <SectionHeading kicker="Agentlik">Biz haqimizda</SectionHeading>

      {/* Story / mission */}
      <div className="grid gap-[48px] lg:grid-cols-2">
        <p className="max-w-[560px] text-subheading text-bone-white">
          Placeholder matn: SADO 2018-yilda uch dizayner tomonidan tashkil
          etilgan. Bugun biz o'n bir kishilik jamoa bilan brend, veb va raqamli
          mahsulotlar ustida ishlaymiz.
        </p>
        <p className="max-w-[480px] text-fog-gray">
          Placeholder matn: missiyamiz — O'zbekiston brendlarini jahon
          darajasidagi dizayn tili bilan gapirishga o'rgatish. Biz shovqin
          emas, aniqlik sotamiz.
        </p>
      </div>

      {/* Stats */}
      <div className="mt-[240px] border-t border-graphite pt-[48px]">
        <div className="grid gap-[48px] sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-fog-gray">{s.label}</p>
              <p className="text-bone-white">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <section className="pt-[240px]">
        <SectionHeading kicker="Qadriyatlar">Nimaga ishonamiz</SectionHeading>
        <div className="grid gap-x-[48px] gap-y-[120px] lg:grid-cols-3">
          {values.map((v) => (
            <div key={v.title}>
              <p className="text-subheading text-bone-white">{v.title}</p>
              <p className="mt-[16px] text-fog-gray">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="pt-[240px]">
        <SectionHeading kicker="Jamoa">Kim ishlaydi</SectionHeading>
        <div className="grid gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m) => (
            <div key={m.name}>
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[10px] bg-soft-black">
                <Image
                  src={m.photo}
                  alt={m.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-[16px] text-bone-white">{m.name}</p>
              <p className="text-fog-gray">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Culture */}
      <section className="pt-[240px]">
        <SectionHeading kicker="Madaniyat">Qanday ishlaymiz</SectionHeading>
        <p className="max-w-[640px] text-fog-gray">
          Placeholder matn: bizda ochiq muhokama, halol fikr va sokin ish
          muhiti qadrlanadi. Har juma — ichki dizayn tanqidi kuni. Yiliga ikki
          marta jamoa bilan tog'larga chiqamiz.
        </p>
      </section>

      {/* CTA */}
      <section className="pt-[240px]">
        <h2 className="display max-w-[900px]">Jamoamiz bilan ishlang.</h2>
        <div className="mt-[48px]">
          <RedDotLink href="/contact">Bog'lanish</RedDotLink>
        </div>
      </section>
    </div>
  );
}
