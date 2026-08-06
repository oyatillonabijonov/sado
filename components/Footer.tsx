"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/data/site";

function Newsletter() {
  const [status, setStatus] = useState<"idle" | "done">("idle");

  if (status === "done") {
    return <p className="text-bone-white">Rahmat, obuna bo'ldingiz!</p>;
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
        aria-label="Obuna bo'lish"
        className="shrink-0 cursor-pointer text-fog-gray transition-colors hover:text-bone-white"
      >
        <span aria-hidden>→</span>
      </button>
    </form>
  );
}

/** Toshkent vaqti — meta qatordagi mayda agentlik detali. */
function LocalTime() {
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
  return <span suppressHydrationWarning>Toshkent {time}</span>;
}

export default function Footer() {
  return (
    <footer className="mt-[240px] border-t border-graphite px-[16px] py-[48px]">
      <div className="grid gap-[48px] sm:grid-cols-2 lg:grid-cols-4">
        <nav className="flex flex-col items-start gap-[12px]">
          <p className="mb-[12px] text-fog-gray">Menyu</p>
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-bone-white transition-colors hover:text-fog-gray"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <nav className="flex flex-col items-start gap-[12px]">
          <p className="mb-[12px] text-fog-gray">Ijtimoiy tarmoqlar</p>
          {site.socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="group text-bone-white transition-colors hover:text-fog-gray"
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
        <div className="flex flex-col gap-[12px]">
          <p className="mb-[12px] text-fog-gray">Aloqa</p>
          <a
            href={`mailto:${site.email}`}
            className="text-bone-white transition-colors hover:text-fog-gray"
          >
            {site.email}
          </a>
          <a
            href={`tel:${site.phone.replace(/\s/g, "")}`}
            className="text-bone-white transition-colors hover:text-fog-gray"
          >
            {site.phone}
          </a>
          <p className="text-fog-gray">{site.address}</p>
        </div>
        <div>
          <p className="mb-[24px] text-fog-gray">Newsletter</p>
          <p className="mb-[16px] text-bone-white">
            Yangi loyihalar va fikrlar haqida obuna bo'ling
          </p>
          <Newsletter />
        </div>
      </div>

      <div className="mt-[120px] flex flex-col gap-[16px] border-t border-graphite pt-[16px] text-fog-gray md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name}. Barcha huquqlar himoyalangan.
        </p>
        <LocalTime />
        <div className="flex gap-[16px]">
          <a href="#" className="transition-colors hover:text-bone-white">
            Cookie siyosati
          </a>
          <a href="#" className="transition-colors hover:text-bone-white">
            Maxfiylik siyosati
          </a>
        </div>
      </div>

      {/* Katta wordmark — footer tagida to'liq kenglikda, chetlarga tegib turadi */}
      <Image
        src="/images/logo.svg"
        alt={site.name}
        width={354}
        height={135}
        className="-mx-[16px] -mb-[48px] mt-[64px] block h-auto w-[calc(100%+32px)] max-w-none"
      />
    </footer>
  );
}
