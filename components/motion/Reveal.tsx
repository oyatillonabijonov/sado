"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Skroll bilan ochiladigan blok.
 *
 * Har bir element `data-motion` belgisini oladi: SSR'da ular `opacity:0` bilan
 * chiqadi va JS yuklanmasa (xato, sekin tarmoq, o'chirilgan skript) sahifa
 * bo'sh ko'rinardi. `app/(site)/layout.tsx` dagi `<noscript>` shu belgiga
 * qarab hammasini ko'rinadigan qiladi.
 *
 * Client komponent, lekin `children` server komponentlardan keladi — RSC'da
 * bu ruxsat etilgan va sahifalar server bo'lib qoladi. Aks holda butun
 * portfolio to'ri brauzerga ko'chib, Payload'dan kelgan ma'lumot ikki marta
 * yuborilardi.
 *
 * Uchta qoida:
 *
 * 1. **`once: true`.** Blok bir marta ochiladi. Har skrollda qayta o'ynagan
 *    animatsiya sahifani beqaror qiladi va o'qishga xalaqit beradi.
 * 2. **Pastdan 24px.** Katta siljish "sakrash" bo'lib ko'rinadi va uzun
 *    sahifada charchatadi; bu yerda harakat sezilarli, lekin e'tiborni
 *    o'ziga tortmaydi.
 * 3. **`prefers-reduced-motion`da umuman harakat yo'q** — animatsiya
 *    o'chiriladi, kontent esa darhol joyida turadi.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const still = useReducedMotion();
  if (still) return <div className={className}>{children}</div>;

  return (
    <motion.div
      data-motion
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * To'r yoki ro'yxat — bolalar ketma-ket chiqadi.
 *
 * `staggerChildren` 0.08s: oltita karta uchun to'liq ochilish ~0.5s, ya'ni
 * oxirgisi ham kutilmaydi. Kattaroq qiymat "yuklanyapti" hissini beradi.
 */
export function Stagger({
  children,
  className,
  gap = 0.08,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  const still = useReducedMotion();
  if (still) return <div className={className}>{children}</div>;

  return (
    <motion.div
      data-motion
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

/** `Stagger` ichidagi bitta element. Tashqarisida ishlatilmaydi. */
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const still = useReducedMotion();
  if (still) return <div className={className}>{children}</div>;

  return (
    <motion.div
      data-motion
      className={className}
      variants={{
        hidden: { opacity: 0, y: 24 },
        shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Sahifa ochilishida chiqadigan blok — hero uchun.
 *
 * `whileInView` emas `animate`: ekranning yuqorisidagi element allaqachon
 * ko'rinib turadi va kuzatuvchi kutish ma'nosiz. Davomiylik qisqa (0.5s) —
 * hero sarlavhasi odatda LCP elementi bo'ladi va uzoq fade uni kechiktiradi.
 */
export function Rise({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const still = useReducedMotion();
  if (still) return <div className={className}>{children}</div>;

  return (
    <motion.div
      data-motion
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
