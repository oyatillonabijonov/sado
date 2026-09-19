"use client";

import Image from "next/image";
import LocaleLink from "@/components/LocaleLink";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";
import { localePath, SITE_LOCALES, stripLocale, type Messages, type SiteLocale } from "@/lib/i18n";
import { telHref, type SiteSettings } from "@/lib/site-format";

function ThemeToggle({ label }: { label: string }) {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    setTheme(
      t === "light" || t === "dark"
        ? t
        : window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark",
    );
  }, []);
  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.theme = next;
    } catch {}
    setTheme(next);
  }
  // light rejimda oyni (dark'ga o'tish), aks holda quyoshni ko'rsatamiz
  const showMoon = theme === "light";
  return (
    <button
      onClick={toggle}
      aria-label={label}
      /* Mobilda 44×44: 18px glif + 8px padding 34px berardi va barmoq uchun
         kichik edi. Desktopda o'lcham o'zgarmaydi. */
      className="flex size-[44px] cursor-pointer items-center justify-center text-fog-gray transition-colors hover:text-bone-white md:size-auto md:p-[8px]"
    >
      <span aria-hidden className="relative block size-[18px]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`absolute inset-0 size-full transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none ${
            showMoon ? "scale-50 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
          }`}
        >
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`absolute inset-0 size-full transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none ${
            showMoon ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-90 opacity-0"
          }`}
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      </span>
    </button>
  );
}

/**
 * Til tanlagich — endi haqiqiy havola.
 *
 * Ilgari u `localStorage` ga yozib `<html lang>` ni almashtirardi, xolos:
 * kontent baribir bir tilda qolardi. Endi `/portfolio` ↔ `/ru/portfolio`,
 * ya'ni til URL'da va uni ulashsa ham, yangilasa ham saqlanadi.
 */
function LanguageSwitcher({
  locale,
  label,
  onNavigate,
}: {
  locale: SiteLocale;
  label: string;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /*
   * Manzil server layout'idan prop bo'lib kelardi va **muzlab qolardi**:
   * Next client navigatsiyada umumiy layout'ni qayta render qilmaydi, ya'ni
   * birinchi yuklangan sahifaning manzili oxirigacha saqlanib qolardi.
   * Amalda: odam /about ni bir marta ochsa, keyin qaysi sahifada bo'lmasin
   * til tugmasi uni /about ga qaytarib yuborardi.
   *
   * `usePathname` client tomonda va har doim joriy. `stripLocale` ikkala
   * holatga ham chidaydi: rewrite ostida u `/blog` ham, `/ru/blog` ham
   * qaytarishi mumkin — natija bir xil.
   */
  const path = stripLocale(usePathname());

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = SITE_LOCALES.find((l) => l.code === locale) ?? SITE_LOCALES[0];

  return (
    <div ref={ref} className="relative">
      {/* Qisqa kod: "O'zbekcha ↓" header'da uch so'zlik navigatsiya elementiga
          o'xshab qolardi. To'liq nomi aria-label va ro'yxat ichida qoladi. */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${current.label}`}
        onClick={() => setOpen((v) => !v)}
        className={`flex min-h-[44px] cursor-pointer items-center gap-[6px] px-[8px] py-[6px] text-[15px] tracking-[0.04em] transition-colors hover:text-bone-white md:min-h-0 ${
          open ? "text-bone-white" : "text-fog-gray"
        }`}
      >
        <span>{current.short}</span>
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`block size-[10px] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M2.5 4.5 6 8l3.5-3.5" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          /* Pastga ochiladi. Telefonda tugma ekranning o'ng chetida turadi —
             chapga tekislangan ro'yxat oynadan chiqib ketardi, shuning uchun
             u yerda o'ng chetga tekislanadi. */
          className="absolute right-0 top-full z-20 mt-[8px] min-w-[132px] overflow-hidden rounded-base bg-soft-black py-[4px] md:left-0 md:right-auto"
        >
          {SITE_LOCALES.map((l) => (
            <li key={l.code}>
              {/*
                `<a>`, `next/link` emas — til almashtirish TO'LIQ YUKLASH
                bo'lishi kerak. Client navigatsiyada Next umumiy layout'ni
                qayta ishlatadi, ya'ni navigatsiya yorliqlari, futer va til
                context'i eski tilda qolib ketardi: sahifa yarim tarjima
                bo'lib ko'rinardi. Til bir kunda bir marta almashtiriladi —
                to'liq yuklashning narxi bu yerda ahamiyatsiz.
              */}
              <a
                href={localePath(l.code, path)}
                hrefLang={l.code}
                lang={l.code}
                role="option"
                aria-selected={l.code === locale}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className={`flex w-full cursor-pointer items-baseline gap-[10px] px-[16px] py-[12px] text-left transition-colors hover:text-bone-white md:py-[10px] ${
                  l.code === locale ? "text-bone-white" : "text-fog-gray"
                }`}
              >
                <span className="w-[24px] shrink-0 text-[15px] tracking-[0.04em]">{l.short}</span>
                <span className="text-[15px]">{l.label}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Header({
  settings,
  m,
  locale,
}: {
  settings: SiteSettings;
  m: Messages;
  locale: SiteLocale;
}) {
  const [open, setOpen] = useState(false);

  // Navigatsiya tuzilishi kodda (`data/site.ts`), yorliqlari esa lug'atda:
  // manzil arxitektura, matn — interfeys.
  const nav = [
    { href: "/portfolio", label: m["nav.portfolio"] },
    { href: "/services", label: m["nav.services"] },
    { href: "/about", label: m["nav.about"] },
    { href: "/blog", label: m["nav.blog"] },
  ];

  /* Menyu ochilganda ortidagi sahifa surilib ketardi: barmoq overlay ustida
     yursa ham skroll body'ga o'tib, yopilgach odam boshqa joyda qolardi. */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-pure-black">
      <div className="shell flex h-[72px] items-center justify-between">
        <LocaleLink href="/" onClick={() => setOpen(false)} className="flex h-[44px] items-center">
          <Image src="/images/logo.svg" alt={site.name} width={354} height={135} className="h-[38px] w-auto" priority />
        </LocaleLink>
        <div className="hidden md:block">
          <LanguageSwitcher locale={locale} label={m["nav.language"]} />
        </div>
        <div className="hidden items-center gap-[24px] md:flex">
          <nav className="flex items-center gap-[24px]">
            {nav.map((item) => (
              <LocaleLink key={item.href} href={item.href} className="nav-flip text-[17px] text-bone-white">
                <span className="nav-flip__inner">
                  <span className="nav-flip__face nav-flip__face--front">{item.label}</span>
                  <span aria-hidden className="nav-flip__face nav-flip__face--back">
                    {item.label}
                  </span>
                </span>
              </LocaleLink>
            ))}
          </nav>
          <ThemeToggle label={m["nav.theme"]} />
        </div>
        {/* -mr: 44px maydon logotip qatorini o'ngga surib yubormasin — glif
            o'z joyida qoladi, bosish maydoni esa chetga chiqadi. */}
        <div className="-mr-[10px] flex items-center md:hidden">
          {/* Til tanlagich menyuning ICHIDA edi va mijoz uni topa olmadi:
              «Til tanlash imkoniyatini menu oldiga olib chiqish kerak ichida
              qolib ketibdi». Endi header qatorida, menyu ochilmasdan. */}
          <LanguageSwitcher
            locale={locale}
            label={m["nav.language"]}
            onNavigate={() => setOpen(false)}
          />
          <ThemeToggle label={m["nav.theme"]} />
          <button
            aria-label={open ? m["nav.close"] : m["nav.menu"]}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex size-[44px] cursor-pointer items-center justify-center text-bone-white"
          >
            {/* Ochiq menyuda o'sha 2×2 glif qolsa, yopish yo'li ko'rinmasdi. */}
            {open ? (
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="size-[20px]"
              >
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            ) : (
              <span aria-hidden className="grid grid-cols-2 gap-[3px]">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="size-[5px] bg-bone-white" />
                ))}
              </span>
            )}
          </button>
        </div>
      </div>

      {/*
       * To'liq ekranli menyu. Ilgari bu header ostidan tushadigan to'rt qatorli
       * ro'yxat edi: ortidagi sahifa ko'rinib turardi, tegib ketilsa suriladi,
       * va til tanlagich ham, aloqa ham u yerda yo'q edi — telefondagi odam
       * uchun yagona navigatsiya nuqtasi shu bo'lsa-da.
       */}
      {open && (
        <div className="fixed inset-x-0 top-[72px] bottom-0 flex flex-col overflow-y-auto overscroll-contain border-t border-graphite bg-pure-black md:hidden">
          <nav className="shell flex flex-col pt-[24px]">
            {nav.map((item) => (
              <LocaleLink
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-[14px] text-heading-sm font-medium text-bone-white"
              >
                {item.label}
              </LocaleLink>
            ))}
          </nav>

          {/* Aloqa pastda: menyu ochgan odamning ikkinchi niyati — yozish. */}
          <div className="shell mt-auto flex flex-col gap-[16px] border-t border-graphite py-[24px]">
            <div className="flex flex-col">
              <a
                href={`mailto:${settings.email}`}
                className="tap text-bone-white transition-colors hover:text-fog-gray"
              >
                {settings.email}
              </a>
              <a
                href={telHref(settings.phone)}
                className="tap text-bone-white transition-colors hover:text-fog-gray"
              >
                {settings.phone}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
