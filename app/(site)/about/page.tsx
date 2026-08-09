import type { Metadata } from "next";
import Image from "next/image";
import RedDotLink from "@/components/RedDotLink";
import SectionHeading from "@/components/SectionHeading";
import Stats from "@/components/Stats";
import { team, values } from "@/data/team";

export const metadata: Metadata = {
  title: "Biz haqimizda",
  description:
    "SADO — 2018-yildan beri Toshkentda ishlaydigan mustaqil dizayn agentligi.",
};

export default function AboutPage() {
  return (
    <div className="shell pt-[48px]">
      <SectionHeading
        kicker="Agentlik"
        lead="Mustaqil, kichik va ataylab shunday: har bir loyihada shu sahifadagi odamlar ishlaydi."
      >
        Biz haqimizda
      </SectionHeading>

      {/* Hikoya va raqamlar bitta blokda. Ilgari ular orasida 240px bo'sh joy
          bor edi va raqamlar oddiy matn o'lchamida turardi — bosh sahifada
          o'sha raqamlar 84px, bu yerda 17px bo'lishi izchil emas. */}
      <div className="grid gap-[48px] lg:grid-cols-2">
        <p className="text-subheading text-bone-white">
          SADO 2018-yilda uch dizayner tomonidan tashkil etilgan. Bugun biz o'n
          bir kishilik jamoa bilan brend, veb va raqamli mahsulotlar ustida
          ishlaymiz.
        </p>
        <p className="text-fog-gray lg:pt-[6px]">
          Missiyamiz — O'zbekiston brendlarini jahon darajasidagi dizayn tili
          bilan gapirishga o'rgatish. Biz shovqin emas, aniqlik sotamiz.
        </p>
      </div>

      <div className="mt-[80px] rounded-[10px] bg-soft-black p-[32px] lg:p-[48px]">
        <Stats />
      </div>

      {/* Qadriyatlar va madaniyat — ilgari ikkita alohida seksiya edi, ikkalasi
          ham "biz qanday ishlaymiz" haqida. Bittasi uchta yalang'och xatboshi,
          ikkinchisi bitta xatboshi uchun butun seksiya sarlavhasi bilan. */}
      <section className="pt-[160px]">
        <SectionHeading kicker="Qadriyatlar">Qanday ishlaymiz</SectionHeading>
        <div className="grid gap-[16px] md:grid-cols-2 xl:grid-cols-4">
          {values.map((v) => (
            <div
              key={v.title}
              className="flex flex-col gap-[16px] rounded-[10px] bg-soft-black p-[32px]"
            >
              <p className="text-subheading text-bone-white">{v.title}</p>
              <p className="text-fog-gray">{v.text}</p>
            </div>
          ))}
          <div className="flex flex-col gap-[16px] rounded-[10px] bg-soft-black p-[32px]">
            <p className="text-subheading text-bone-white">Ish muhiti</p>
            <p className="text-fog-gray">
              Ochiq muhokama va halol fikr. Har juma — ichki dizayn tanqidi kuni.
              Yiliga ikki marta jamoa bilan tog'larga chiqamiz.
            </p>
          </div>
        </div>
      </section>

      {/* Jamoa — bu yerda zamin allaqachon bor: suratning o'zi. */}
      <section className="pt-[160px]">
        <SectionHeading kicker="Jamoa">Kim ishlaydi</SectionHeading>
        <div className="grid gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m) => (
            <div key={m.name}>
              <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-[10px] bg-soft-black">
                {m.photo ? (
                  <Image
                    src={m.photo}
                    alt={m.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  // Surat yo'q — bosh harflar. Placeholder rasm o'rniga shu:
                  // otzivlardagi bilan bir xil yechim, va soxta stok surat
                  // jamoa a'zosi sifatida chiqmaydi.
                  // `.display` o'zining rangini majburlaydi va bosh harflar
                  // odamning ismidan balandroq chiqib ketardi — o'lchamni
                  // qo'lda beramiz, rang esa ikkinchi darajada qoladi.
                  <span
                    aria-hidden
                    className="text-[64px] leading-none font-medium tracking-[-0.02em] text-fog-gray"
                  >
                    {m.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </span>
                )}
              </div>
              <p className="mt-[16px] text-subheading text-bone-white">{m.name}</p>
              <p className="text-fog-gray">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-[160px] border-t border-graphite pt-[120px] pb-[48px]">
        <h2 className="display max-w-[900px]">Jamoamiz bilan ishlang.</h2>
        <div className="mt-[48px]">
          <RedDotLink href="/contact">Bog'lanish</RedDotLink>
        </div>
      </section>
    </div>
  );
}
