"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";

function ThemeToggle() {
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
      aria-label="Yorug'/qorong'i rejimni almashtirish"
      className="cursor-pointer p-[8px] text-fog-gray transition-colors hover:text-bone-white"
    >
      <span aria-hidden className="relative block size-[18px]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`absolute inset-0 size-full transition-all duration-300 ease-out motion-reduce:transition-none ${
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
          className={`absolute inset-0 size-full transition-all duration-300 ease-out motion-reduce:transition-none ${
            showMoon ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-90 opacity-0"
          }`}
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      </span>
    </button>
  );
}

const LANGS = [
  { code: "uz", label: "O'zbekcha", short: "UZ" },
  { code: "ru", label: "Русский", short: "RU" },
  { code: "en", label: "English", short: "EN" },
] as const;
type Lang = (typeof LANGS)[number]["code"];

// ponytail: UI-only switcher — tanlovni saqlaydi va <html lang> ni qo'yadi.
// Kontent tarjimasi hali ulanmagan; sayt placeholder bosqichidan chiqqanda
// i18n (next-intl) qo'shiladi.
function LanguageSwitcher() {
  const [lang, setLang] = useState<Lang | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("lang");
    const initial = LANGS.some((l) => l.code === stored) ? (stored as Lang) : "uz";
    setLang(initial);
    document.documentElement.lang = initial;
  }, []);

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

  function choose(code: Lang) {
    document.documentElement.lang = code;
    try {
      localStorage.setItem("lang", code);
    } catch {}
    setLang(code);
    setOpen(false);
  }

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div ref={ref} className="relative">
      {/* Qisqa kod: "O'zbekcha ↓" header'da uch so'zlik navigatsiya elementiga
          o'xshab qolardi. To'liq nomi aria-label va ro'yxat ichida qoladi. */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Sayt tili: ${current.label}`}
        onClick={() => setOpen((v) => !v)}
        className={`flex cursor-pointer items-center gap-[6px] px-[8px] py-[6px] text-[15px] tracking-[0.04em] transition-colors hover:text-bone-white ${
          open ? "text-bone-white" : "text-fog-gray"
        }`}
      >
        <span suppressHydrationWarning>{current.short}</span>
        {/* Glif emas, SVG: "▾" shriftda mayda nuqtaga o'xshab chiqadi va
            o'lchami platformaga qarab o'zgaradi. */}
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
          className="absolute left-0 top-full z-20 mt-[8px] min-w-[132px] overflow-hidden rounded-[10px] bg-soft-black py-[4px]"
        >
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                lang={l.code}
                aria-selected={l.code === lang}
                onClick={() => choose(l.code)}
                className={`flex w-full cursor-pointer items-baseline gap-[10px] px-[16px] py-[10px] text-left transition-colors hover:text-bone-white ${
                  l.code === lang ? "text-bone-white" : "text-fog-gray"
                }`}
              >
                <span className="w-[24px] shrink-0 text-[15px] tracking-[0.04em]">
                  {l.short}
                </span>
                <span className="text-[15px]">{l.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-pure-black">
      <div className="shell flex h-[72px] items-center justify-between">
        <Link href="/" onClick={() => setOpen(false)}>
          <Image src="/images/logo.svg" alt={site.name} width={354} height={135} className="h-[38px] w-auto" priority />
        </Link>
        <div className="hidden md:block">
          <LanguageSwitcher />
        </div>
        <div className="hidden items-center gap-[24px] md:flex">
          <nav className="flex items-center gap-[24px]">
            {site.nav.map((item) => (
              <Link key={item.href} href={item.href} className="nav-flip text-[17px] text-bone-white">
                <span className="nav-flip__inner">
                  <span className="nav-flip__face nav-flip__face--front">{item.label}</span>
                  <span aria-hidden className="nav-flip__face nav-flip__face--back">
                    {item.label}
                  </span>
                </span>
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
        <div className="flex items-center md:hidden">
          <ThemeToggle />
          {/* 2x2 grid glyph — mobile menu trigger */}
          <button
            aria-label="Menyu"
            onClick={() => setOpen((v) => !v)}
            className="grid grid-cols-2 gap-[3px] p-[8px]"
          >
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="size-[5px] bg-bone-white" />
            ))}
          </button>
        </div>
      </div>
      {open && (
        <nav className="shell flex flex-col gap-[24px] border-t border-graphite bg-pure-black py-[48px] md:hidden">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="text-heading-sm font-medium text-bone-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
