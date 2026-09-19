"use client";

import Image from "next/image";
import Link from "@/components/LocaleLink";
import { useEffect, useState } from "react";
import { site } from "@/data/site";
import type { Messages } from "@/lib/i18n";
import { mapHref, telHref, type SiteSettings } from "@/lib/site-format";

function Newsletter({ m }: { m: Messages }) {
  const [status, setStatus] = useState<"idle" | "done">("idle");

  if (status === "done") {
    return <p className="text-bone-white">{m["footer.subscribed"]}</p>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setStatus("done");
      }}
      className="flex items-center gap-[16px] border-b border-graphite focus-within:border-bone-white"
    >
      <input
        type="email"
        required
        placeholder="Email manzilingiz"
        className="w-full bg-transparent py-[16px] text-bone-white placeholder:text-fog-gray focus:outline-none"
      />
      <button
        type="submit"
        aria-label={m["footer.subscribe"]}
        /* O'q 16×26 edi — saytdagi eng kichik bosish maydoni. */
        className="flex size-[44px] shrink-0 cursor-pointer items-center justify-end text-fog-gray transition-colors hover:text-bone-white"
      >
        <span aria-hidden>→</span>
      </button>
    </form>
  );
}

/** Toshkent vaqti — meta qatordagi mayda agentlik detali. */
function LocalTime({ city }: { city: string }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = () =>
      setTime(
        new Intl.DateTimeFormat("uz-UZ", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Tashkent",
        }).format(new Date()),
      );
    fmt();
    const t = setInterval(fmt, 30_000);
    return () => clearInterval(t);
  }, []);
  return <span suppressHydrationWarning>{city} {time}</span>;
}

/* Aloqa ma'lumotlari va ijtimoiy tarmoqlar paneldan keladi; menyu va sayt
   nomi kodda qoladi — ular kontent emas, tuzilma. */
export default function Footer({ settings, m }: { settings: SiteSettings; m: Messages }) {
  // Header bilan bir xil ro'yxat: manzil kodda, yorliq lug'atda.
  const nav = [
    { href: "/portfolio", label: m["nav.portfolio"] },
    { href: "/services", label: m["nav.services"] },
    { href: "/about", label: m["nav.about"] },
    { href: "/blog", label: m["nav.blog"] },
  ];
  return (
    <footer className="mt-section-lg border-t border-graphite">
      <div className="shell py-[48px]">
      {/*
       * Mobilda to'rt ustun bittaga tushib, footer 1363px — deyarli ikki
       * ekran — bo'lib qolardi. Menyu va ijtimoiy tarmoqlar qisqa ro'yxatlar:
       * ular yonma-yon sig'adi. Aloqa va newsletter to'liq kenglikda qoladi —
       * email/telefon va input tor ustunda o'raladi.
       */}
      <div className="grid grid-cols-2 gap-x-[16px] gap-y-[40px] lg:grid-cols-4 md:gap-[48px]">
        <nav className="flex flex-col items-start md:gap-[12px]">
          <p className="mb-[12px] text-fog-gray">{m["footer.menu"]}</p>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="tap text-bone-white transition-colors hover:text-fog-gray"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <nav className="flex flex-col items-start md:gap-[12px]">
          <p className="mb-[12px] text-fog-gray">{m["footer.socials"]}</p>
          {settings.socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="tap group text-bone-white transition-colors hover:text-fog-gray"
            >
              {s.label}
              <span
                aria-hidden
                className="ml-[8px] inline-block text-fog-gray transition-transform duration-200 group-hover:-translate-y-[2px] group-hover:translate-x-[2px]"
              >
                ↗
              </span>
            </a>
          ))}
        </nav>
        <div className="col-span-2 flex flex-col md:col-span-1 md:gap-[12px]">
          <p className="mb-[12px] text-fog-gray">{m["footer.contact"]}</p>
          <a
            href={`mailto:${settings.email}`}
            className="tap self-start text-bone-white transition-colors hover:text-fog-gray"
          >
            {settings.email}
          </a>
          <a
            href={telHref(settings.phone)}
            className="tap self-start text-bone-white transition-colors hover:text-fog-gray"
          >
            {settings.phone}
          </a>
          {settings.address && (
            <a
              href={mapHref(settings.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="tap mt-[8px] self-start text-fog-gray transition-colors hover:text-bone-white md:mt-0"
            >
              {settings.address}
            </a>
          )}
        </div>
        <div className="col-span-2 md:col-span-1">
          <p className="mb-[12px] text-fog-gray md:mb-[24px]">{m["footer.newsletter"]}</p>
          <p className="mb-[16px] text-bone-white">
            {m["footer.newsletter.lead"]}
          </p>
          <Newsletter m={m} />
        </div>
      </div>

      <div className="mt-section-sm flex flex-col gap-[8px] border-t border-graphite pt-[16px] text-fog-gray md:flex-row md:items-center md:justify-between md:gap-[16px]">
        <p>
          © {new Date().getFullYear()} {site.name}. {m["footer.rights"]}.
        </p>
        <LocalTime city={m["footer.city"]} />
        <div className="flex gap-[24px] md:gap-[16px]">
          <a href="#" className="tap transition-colors hover:text-bone-white">
            {m["footer.cookies"]}
          </a>
          <a href="#" className="tap transition-colors hover:text-bone-white">
            {m["footer.privacy"]}
          </a>
        </div>
      </div>

      {/* Katta wordmark — footer tagida to'liq kenglikda, chetlarga tegib turadi */}
      <Image
        src="/images/logo.svg"
        alt={site.name}
        width={354}
        height={135}
        className="bleed -mb-[48px] mt-[64px] block h-auto w-[calc(100%+var(--gutter)*2)] max-w-none"
      />
      </div>
    </footer>
  );
}
