"use client";

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
 */
export default function HeroSlideshow({ images }: { images: string[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce || images.length <= 1) return;
    const id = setInterval(() => setActive((a) => (a + 1) % images.length), 3000);
    return () => clearInterval(id);
  }, [reduce, images.length]);

  return (
    <>
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${src}-${i}`}
          src={src}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ opacity: i === active ? 1 : 0 }}
        />
      ))}
    </>
  );
}
