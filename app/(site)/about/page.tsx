import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { currentLocale } from "@/lib/locale";
import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import SectionHeading from "@/components/SectionHeading";
import Stats from "@/components/Stats";
import { getAbout } from "@/lib/about";
import { getSettings } from "@/lib/settings";
import { telHref } from "@/lib/site-format";

export async function generateMetadata(): Promise<Metadata> {
  // Statik `metadata` bir tilda qotib qolardi — ruscha sahifada ham
  // o'zbekcha tavsif chiqardi.
  const m = messages(await currentLocale());
  return { title: m["about.title"], description: m["meta.about"] };
}

export default async function AboutPage() {
  const m = messages(await currentLocale());
  const [settings, about] = await Promise.all([getSettings(), getAbout()]);
  return (
    <div className="shell pt-[48px]">
      <SectionHeading
        kicker={m["about.kicker"]}
        lead={about.lead}
      >
        {m["about.title"]}
      </SectionHeading>

      {/* Hikoya va raqamlar bitta blokda. Ilgari ular orasida 240px bo'sh joy
          bor edi va raqamlar oddiy matn o'lchamida turardi — bosh sahifada
          o'sha raqamlar 84px, bu yerda 17px bo'lishi izchil emas. */}
      {/* To'ldirilmagan matn chizilmaydi: bo'sh <p> ekranda sababsiz
          bo'shliq qoldirardi va "yuklanmadi" bo'lib ko'rinardi. */}
      {(about.story || about.mission) && (
        <div className="grid gap-[24px] lg:grid-cols-2 md:gap-[48px]">
          {about.story && (
            <p className="text-subheading whitespace-pre-line text-bone-white">{about.story}</p>
          )}
          {about.mission && (
            <p className="whitespace-pre-line text-fog-gray lg:pt-[6px]">{about.mission}</p>
          )}
        </div>
      )}

      {/* Raqamlar endi o'zi karta — panelning 32/48px paddingi ustiga qo'shilib
          ikki qavat ramka berardi. Panel yupqa zamin bo'lib qoladi. */}
      <Reveal className="mt-[40px] rounded-[10px] bg-soft-black p-[16px] md:mt-[80px] md:p-[24px]">
        <Stats stats={settings.stats} />
      </Reveal>

      {/* Qadriyatlar va madaniyat — ilgari ikkita alohida seksiya edi, ikkalasi
          ham "biz qanday ishlaymiz" haqida. Bittasi uchta yalang'och xatboshi,
          ikkinchisi bitta xatboshi uchun butun seksiya sarlavhasi bilan. */}
      {about.values.length > 0 && (
      <section className="pt-section">
        <SectionHeading kicker={m["about.values.kicker"]}>{m["about.values.title"]}</SectionHeading>
        {/* To'rtinchi karta ilgari shu yerda qo'lda yozilgan edi — uchtasi
            massivdan, bittasi JSX dan. Endi hammasi paneldan keladi, ya'ni
            mijoz ko'rayotgan ro'yxat saytdagining o'zi. */}
        <Stagger className="grid gap-[16px] md:grid-cols-2 xl:grid-cols-4">
          {about.values.map((v) => (
            <StaggerItem key={v.title} className="h-full">
              <div className="flex h-full flex-col gap-[16px] rounded-[10px] bg-soft-black p-card">
                <p className="text-subheading text-bone-white">{v.title}</p>
                <p className="whitespace-pre-line text-fog-gray">{v.text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      )}

      {/* Jamoa — bu yerda zamin allaqachon bor: suratning o'zi. */}
      {about.team.length > 0 && (
      <section className="pt-section">
        <SectionHeading kicker={m["about.team.kicker"]}>{m["about.team.title"]}</SectionHeading>
        {/* Mobilda 2 ustun: 3:4 portret bitta ustunda 500px baland bo'lib,
            o'n bir kishilik jamoa sahifani cho'zib yuborardi. */}
        <Stagger className="grid grid-cols-2 gap-[16px] lg:grid-cols-3">
          {about.team.map((m) => (
            <StaggerItem key={m.name}>
              <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-[10px] bg-soft-black">
                {m.photo ? (
                  <Image
                    src={m.photo}
                    alt={m.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 33vw"
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
      )}

      {/* Aloqa — ilgari alohida /contact sahifasi edi. Bitta forma va uchta
          qator uchun alohida sahifa navigatsiyada joy egallardi, mazmunan esa
          "biz kimmiz" bilan bir joyda turishi tabiiyroq. `id` bo'sh holatlar va
          boshqa sahifalardagi havolalar shu yerga tushishi uchun. */}
      <section
        id="aloqa"
        className="mt-section scroll-mt-[88px] border-t border-graphite pt-section-sm pb-[48px]"
      >
        <div className="grid gap-[32px] lg:grid-cols-2 md:gap-[80px]">
          <div className="lg:sticky lg:top-[120px] lg:self-start">
            <p className="mb-[24px] text-fog-gray">{m["about.contact.kicker"]}</p>
            {about.contactHeading && (
              <h2 className="display max-w-[560px]">{about.contactHeading}</h2>
            )}
            {about.contactText && (
              <p className="mt-[32px] max-w-[46ch] whitespace-pre-line text-fog-gray">
                {about.contactText}
              </p>
            )}
            <div className="mt-[32px] flex flex-col md:mt-[48px] md:gap-[8px]">
              <a
                href={`mailto:${settings.email}`}
                className="tap self-start text-fog-gray hover:text-bone-white"
              >
                {settings.email}
              </a>
              <a
                href={telHref(settings.phone)}
                className="tap self-start text-fog-gray hover:text-bone-white"
              >
                {settings.phone}
              </a>
              <p className="mt-[8px] text-fog-gray md:mt-0">{settings.address}</p>
            </div>
            <div className="mt-[16px] flex flex-wrap gap-x-[24px] md:mt-[32px] md:gap-y-[8px]">
              {settings.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="tap text-fog-gray hover:text-bone-white"
                >
                  {s.label} ↗
                </a>
              ))}
            </div>
          </div>
          <div className="max-w-[640px]">
            <ContactForm m={m} />
          </div>
        </div>
      </section>
    </div>
  );
}
