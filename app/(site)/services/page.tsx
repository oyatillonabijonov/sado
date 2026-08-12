import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { currentLocale } from "@/lib/locale";
import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import EmptyState from "@/components/EmptyState";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { getServices } from "@/lib/content";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  // Statik `metadata` bir tilda qotib qolardi — ruscha sahifada ham
  // o'zbekcha tavsif chiqardi.
  const m = messages(await currentLocale());
  return { title: m["services.kicker"], description: m["meta.services"] };
}

export default async function ServicesPage() {
  const m = messages(await currentLocale());
  const [services, settings] = await Promise.all([getServices(), getSettings()]);

  return (
    <div className="shell pt-[48px]">
      <SectionHeading
        kicker={m["services.kicker"]}
        lead={m["services.lead"]}
      >
        {m["services.title"]}
      </SectionHeading>

      {/* Muqova — xizmatlar ro'yxatidan oldin qilingan ishning o'zi turadi.
          3:1 nisbat ataylab: 21:9 bo'lsa birinchi qator kartalar ekrandan
          tushib ketardi va butun taklifni bir ko'rinishda ko'rish yo'qolardi.
          Vertikal sub'ektli kadr bu yerda tepasidan qirqiladi — paneldagi
          maydon izohida shu aytilgan.
          Almashtirish = /panel/sozlamalar; bo'sh qolsa `data/site.ts`
          yonidagi standart kadr chiqadi. */}
      {/* Mobilda 16:5 atigi 105px baland chiziqqa aylanadi va rasmdan hech
          narsa o'qilmaydi — tor ekranda balandroq nisbat. */}
      <Reveal className="relative mb-[48px] aspect-[16/9] w-full overflow-hidden rounded-[10px] bg-soft-black sm:aspect-[16/5]">
        <Image
          src={settings.servicesCover}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1440px"
          className="object-cover"
        />
      </Reveal>

      {services.length === 0 ? (
        <EmptyState
          title={m["services.empty"]}
          hint={m["services.empty.hint"]}
          action={{ href: "/about#aloqa", label: m["common.contact"] }}
        />
      ) : (
        /* Har biri alohida karta va hammasi bitta ko'rinishda.
           Ilgari bitta xizmat butun ekranni egallab, uch ustunga yoyilardi:
           "SADO nima qiladi?" degan savolga javob hech qachon bir joyda
           ko'rinmasdi va ko'z bitta xizmatni o'qish uchun 1400px yurardi. */
        <Stagger className="grid gap-[16px] md:grid-cols-2 xl:grid-cols-3">
          {services.map((s) => (
            <StaggerItem key={s.slug}>
            <section
              id={s.slug}
              className="flex h-full scroll-mt-[88px] flex-col gap-[24px] rounded-[10px] bg-soft-black p-card"
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
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {/* Bitta CTA. Ilgari har bir xizmatda "Shu xizmat kerak" tugmasi turardi —
          oltita takror, va tugma xizmat nomidan og'irroq ko'rinardi. */}
      <section className="mt-section border-t border-graphite pt-section-sm pb-[48px]">
        <div className="grid gap-[32px] lg:grid-cols-2 md:gap-[80px]">
          <div className="lg:sticky lg:top-[120px] lg:self-start">
            <p className="mb-[24px] text-fog-gray">{m["about.contact.kicker"]}</p>
            <h2 className="display max-w-[560px]">{m["services.unsure"]}</h2>
            <p className="mt-[32px] max-w-[46ch] text-fog-gray">
              {m["services.cta.text"]}
            </p>
          </div>
          <div className="max-w-[640px]">
            <ContactForm m={m} />
          </div>
        </div>
      </section>
    </div>
  );
}
