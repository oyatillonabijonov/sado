"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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
      className="flex items-center border border-graphite bg-soft-black px-[16px] py-[8px]"
    >
      <input
        type="email"
        required
        placeholder="Email manzilingiz"
        className="w-full bg-transparent py-[8px] text-bone-white placeholder:text-fog-gray focus:outline-none"
      />
      <button
        type="submit"
        className="flex shrink-0 items-center gap-[8px] text-bone-white hover:text-fog-gray"
      >
        Obuna bo'lish
        <span aria-hidden>→</span>
      </button>
    </form>
  );
}

export default function Footer() {
  return (
    <footer className="mt-[240px] border-t border-graphite px-[16px] py-[48px]">
      <div className="grid gap-[48px] md:grid-cols-3">
        <nav className="flex flex-col gap-[8px]">
          <p className="text-fog-gray">Menyu</p>
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-bone-white hover:text-fog-gray">
              {item.label}
            </Link>
          ))}
        </nav>
        <nav className="flex flex-col gap-[8px]">
          <p className="text-fog-gray">Ijtimoiy tarmoqlar</p>
          {site.socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="text-bone-white hover:text-fog-gray">
              {s.label}
            </a>
          ))}
        </nav>
        <div className="flex flex-col gap-[8px]">
          <p className="text-fog-gray">Newsletter</p>
          <p className="text-bone-white">Yangi loyihalar va fikrlar haqida obuna bo'ling</p>
          <div className="mt-[8px]">
            <Newsletter />
          </div>
        </div>
      </div>

      <div className="my-[120px] flex justify-center">
        <Image
          src="/images/logo.svg"
          alt={site.name}
          width={354}
          height={135}
          className="h-auto w-full max-w-[560px]"
        />
      </div>

      <div className="flex flex-col gap-[16px] border-t border-graphite pt-[16px] text-fog-gray md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name}. Barcha huquqlar himoyalangan.
        </p>
        <div className="flex gap-[16px]">
          <a href="#" className="hover:text-bone-white">
            Cookie siyosati
          </a>
          <a href="#" className="hover:text-bone-white">
            Maxfiylik siyosati
          </a>
        </div>
      </div>
    </footer>
  );
}
