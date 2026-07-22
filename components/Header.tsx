"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  return (
    <button
      onClick={toggle}
      aria-label="Yorug'/qorong'i rejimni almashtirish"
      className="cursor-pointer p-[8px] text-fog-gray transition-colors hover:text-bone-white"
    >
      <span suppressHydrationWarning aria-hidden>
        {theme === "light" ? "☾" : "☀"}
      </span>
    </button>
  );
}

function Clock() {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      setNow(
        `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}:${p(d.getHours())}${p(d.getMinutes())}`
      );
    };
    fmt();
    const t = setInterval(fmt, 30_000);
    return () => clearInterval(t);
  }, []);
  return <span suppressHydrationWarning>{now}</span>;
}

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-pure-black">
      <div className="flex h-[48px] items-center justify-between px-[16px]">
        <Link href="/" onClick={() => setOpen(false)}>
          <Image src="/images/logo.svg" alt={site.name} width={354} height={135} className="h-[24px] w-auto" priority />
        </Link>
        <span className="hidden text-fog-gray md:block">
          <Clock />
        </span>
        <div className="hidden items-center gap-[16px] md:flex">
          <nav className="flex items-center gap-[16px]">
            {site.nav.map((item) => (
              <Link key={item.href} href={item.href} className="text-bone-white hover:text-fog-gray">
                {item.label}
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
        <nav className="flex flex-col gap-[24px] border-t border-graphite bg-pure-black px-[16px] py-[48px] md:hidden">
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
