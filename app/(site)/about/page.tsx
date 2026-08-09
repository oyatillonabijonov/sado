import type { Metadata } from "next";
import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import SectionHeading from "@/components/SectionHeading";
import Stats from "@/components/Stats";
import { team, values } from "@/data/team";
import { getSettings } from "@/lib/settings";
import { telHref } from "@/lib/site-format";

export const metadata: Metadata = {
  title: "Biz haqimizda",
  description:
    "SADO — 2018-yildan beri Toshkentda ishlaydigan mustaqil dizayn agentligi.",
};

export default async function AboutPage() {
  const settings = await getSettings();
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

      <Reveal className="mt-[80px] rounded-[10px] bg-soft-black p-[32px] lg:p-[48px]">
        <Stats />
      </Reveal>

      {/* Qadriyatlar va madaniyat — ilgari ikkita alohida seksiya edi, ikkalasi
          ham "biz qanday ishlaymiz" haqida. Bittasi uchta yalang'och xatboshi,
          ikkinchisi bitta xatboshi uchun butun seksiya sarlavhasi bilan. */}
      <section className="pt-[160px]">
        <SectionHeading kicker="Qadriyatlar">Qanday ishlaymiz</SectionHeading>
        <Stagger className="grid gap-[16px] md:grid-cols-2 xl:grid-cols-4">
          {values.map((v) => (
            <StaggerItem key={v.title} className="h-full">
            <div className="flex h-full flex-col gap-[16px] rounded-[10px] bg-soft-black p-[32px]">
              <p className="text-subheading text-bone-white">{v.title}</p>
              <p className="text-fog-gray">{v.text}</p>
            </div>
            </StaggerItem>
          ))}
          <div className="flex h-full flex-col gap-[16px] rounded-[10px] bg-soft-black p-[32px]">
            <p className="text-subheading text-bone-white">Ish muhiti</p>
            <p className="text-fog-gray">
              Ochiq muhokama va halol fikr. Har juma — ichki dizayn tanqidi kuni.
              Yiliga ikki marta jamoa bilan tog'larga chiqamiz.
            </p>
          </div>
        </Stagger>
      </section>

      {/* Jamoa — bu yerda zamin allaqachon bor: suratning o'zi. */}
      <section className="pt-[160px]">
        <SectionHeading kicker="Jamoa">Kim ishlaydi</SectionHeading>
        <Stagger className="grid gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m) => (
            <StaggerItem key={m.name}>
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
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Aloqa — ilgari alohida /contact sahifasi edi. Bitta forma va uchta
          qator uchun alohida sahifa navigatsiyada joy egallardi, mazmunan esa
          "biz kimmiz" bilan bir joyda turishi tabiiyroq. `id` bo'sh holatlar va
          boshqa sahifalardagi havolalar shu yerga tushishi uchun. */}
      <section
        id="aloqa"
        className="mt-[160px] scroll-mt-[88px] border-t border-graphite pt-[120px] pb-[48px]"
      >
        <div className="grid gap-[80px] lg:grid-cols-2">
          <div className="lg:sticky lg:top-[120px] lg:self-start">
            <p className="mb-[24px] text-fog-gray">Aloqa</p>
            <h2 className="display max-w-[560px]">Jamoamiz bilan ishlang.</h2>
            <p className="mt-[32px] max-w-[46ch] text-fog-gray">
              Vazifangizni qisqacha yozing — bir ish kuni ichida javob beramiz.
            </p>
            <div className="mt-[48px] flex flex-col gap-[8px]">
              <a href={`mailto:${settings.email}`} className="text-fog-gray hover:text-bone-white">
                {settings.email}
              </a>
              <a href={telHref(settings.phone)} className="text-fog-gray hover:text-bone-white">
                {settings.phone}
              </a>
              <p className="text-fog-gray">{settings.address}</p>
            </div>
            <div className="mt-[32px] flex flex-wrap gap-x-[24px] gap-y-[8px]">
              {settings.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-fog-gray hover:text-bone-white"
                >
                  {s.label} ↗
                </a>
              ))}
            </div>
          </div>
          <div className="max-w-[640px]">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
