"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Hero orqa fon — rasmlar 3 soniyada almashib crossfade bo'ladi.
 *
 * Ilgari 5 ta rasm CSS loop bilan qat'iy 5 kadrga sozlangan edi. Endi rasmlar
 * paneldan keladi va soni oldindan ma'lum emas, shuning uchun JS: har qanday
 * songa moslashadi. SSR'da birinchi rasm ko'rinadi (opacity 1), JS'siz ham
 * bo'sh chiqmaydi. `prefers-reduced-motion`da almashinuv yo'q — birinchi rasm
 * qotib turadi.
 *
 * Ikki narsa LCP uchun muhim va ularni buzmang:
 * 1. `next/image` — manba PNG'lar 1.5–2 MB, optimizatsiyasiz uzatilsa mobil
 *    ulanishda LCP o'nlab soniyaga chiqadi (o'lchangan: 42 s).
 * 2. Faqat birinchi kadr darrov yuklanadi. Qolganlari o'sha kadr ekranga
 *    chiqqach mount bo'ladi — aks holda beshtasi bandwidth talashib, LCP
 *    rasmning o'zini kutdirib qo'yadi.
 */
export default function HeroSlideshow({ images }: { images: string[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [rest, setRest] = useState(false);
  const shown = rest ? images : images.slice(0, 1);

  useEffect(() => {
    if (!rest || images.length <= 1) return;
    const id = setInterval(() => setActive((a) => (a + 1) % images.length), 3000);
    return () => clearInterval(id);
  }, [rest, images.length]);

  return (
    <>
      {shown.map((src, i) => (
        <Image
          key={`${src}-${i}`}
          src={src}
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          priority={i === 0}
          onLoad={i === 0 ? () => setRest(!reduce) : undefined}
          className="object-cover transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ opacity: i === active ? 1 : 0 }}
        />
      ))}
    </>
  );
}
