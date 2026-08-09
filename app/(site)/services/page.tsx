import type { Metadata } from "next";
import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import EmptyState from "@/components/EmptyState";
import SectionHeading from "@/components/SectionHeading";
import { getServices } from "@/lib/content";

export const metadata: Metadata = {
  title: "Xizmatlar",
  description:
    "Brend strategiyasi, brend dizayn, veb-dizayn, UI/UX, motion va print — SADO xizmatlari.",
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="shell pt-[48px]">
      <SectionHeading
        kicker="Xizmatlar"
        lead="Ko'pincha bularning bir nechtasi bitta loyihada birga ketadi — qaysi biri kerakligini o'zimiz aytamiz."
      >
        Nima qilamiz
      </SectionHeading>

      {/* Muqova — xizmatlar ro'yxatidan oldin qilingan ishning o'zi turadi.
          3:1 nisbat ataylab: 21:9 bo'lsa birinchi qator kartalar ekrandan
          tushib ketardi va butun taklifni bir ko'rinishda ko'rish yo'qolardi.
          Rasm shu nisbatga qarab tanlangan — diagonal kompozitsiya va tepadagi
          osmon kesilganda ham butun qoladi. Vertikal sub'ektli kadr (masalan
          sd5 dagi shishalar) bu yerda tepasidan qirqiladi.
          Almashtirish = shu `src` ni o'zgartirish (public/). */}
      {/* Mobilda 16:5 atigi 105px baland chiziqqa aylanadi va rasmdan hech
          narsa o'qilmaydi — tor ekranda balandroq nisbat. */}
      <div className="relative mb-[48px] aspect-[16/9] w-full overflow-hidden rounded-[10px] bg-soft-black sm:aspect-[16/5]">
        <Image
          src="/sd2.png"
          alt="Atlas naqshli samolyot liveriyasi — SADO ishi"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1440px"
          className="object-cover"
        />
      </div>

      {services.length === 0 ? (
        <EmptyState
          title="Xizmatlar ro'yxati yangilanmoqda."
          hint="Nima kerakligini yozib qoldiring — to'g'ridan-to'g'ri javob beramiz."
          action={{ href: "/about#aloqa", label: "Bog'lanish" }}
        />
      ) : (
        /* Har biri alohida karta va hammasi bitta ko'rinishda.
           Ilgari bitta xizmat butun ekranni egallab, uch ustunga yoyilardi:
           "SADO nima qiladi?" degan savolga javob hech qachon bir joyda
           ko'rinmasdi va ko'z bitta xizmatni o'qish uchun 1400px yurardi. */
        <div className="grid gap-[16px] md:grid-cols-2 xl:grid-cols-3">
          {services.map((s) => (
            <section
              key={s.slug}
              id={s.slug}
              className="flex scroll-mt-[88px] flex-col gap-[24px] rounded-[10px] bg-soft-black p-[32px]"
            >
              <div>
                <h2 className="text-heading-sm font-medium text-bone-white">
                  {s.title}
                </h2>
                <p className="mt-[16px] text-fog-gray">{s.description}</p>
              </div>

              {/* Yorliqsiz: "Nimalar kiradi" degan sarlavha o'rniga ro'yxatning
                  o'zi — nuqta bilan boshlangan qator baribir ro'yxat ekanini
                  aytadi va bitta kartada uchta yorliq o'qishni og'irlashtiradi. */}
              <ul className="flex flex-col gap-[8px]">
                {s.deliverables.map((d) => (
                  <li key={d} className="flex gap-[12px] text-bone-white">
                    <span
                      aria-hidden
                      className="mt-[11px] size-[4px] shrink-0 rounded-full bg-scarlet-signal"
                    />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-auto text-fog-gray">{s.fitFor}</p>
            </section>
          ))}
        </div>
      )}

      {/* Bitta CTA. Ilgari har bir xizmatda "Shu xizmat kerak" tugmasi turardi —
          oltita takror, va tugma xizmat nomidan og'irroq ko'rinardi. */}
      <section className="mt-[160px] border-t border-graphite pt-[120px] pb-[48px]">
        <div className="grid gap-[80px] lg:grid-cols-2">
          <div className="lg:sticky lg:top-[120px] lg:self-start">
            <p className="mb-[24px] text-fog-gray">Aloqa</p>
            <h2 className="display max-w-[560px]">Qaysi biri kerakligini bilmaysizmi?</h2>
            <p className="mt-[32px] max-w-[46ch] text-fog-gray">
              Vazifangizni qisqacha yozing — mos xizmatni o'zimiz aytamiz va
              taxminiy muddat bilan javob beramiz.
            </p>
          </div>
          <div className="max-w-[640px]">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
