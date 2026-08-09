"use client";

import { useEffect, useRef, useState } from "react";
import { stats } from "@/data/team";

/** "120+" → { n: 120, suffix: "+" } */
function parseValue(v: string): { n: number; suffix: string } {
  const m = v.match(/^(\d+)(.*)$/);
  return m ? { n: Number(m[1]), suffix: m[2] } : { n: 0, suffix: v };
}

const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);

/** Metrikalar — ekranga kirganda count-up animatsiya bilan chiqadi. */
export default function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const duration = 1400;
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          setProgress(easeOutCubic(p));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    /* Mobilda 2×2. Bitta ustunda to'rtta 40px raqam ustma-ust turardi va
       "bir qarashda dalil" degan butun maqsad yo'qolardi — o'qish uchun
       skroll kerak bo'lardi. */
    <div ref={ref} className="grid grid-cols-2 gap-[16px] lg:grid-cols-4">
      {stats.map((s, i) => {
        const { n, suffix } = parseValue(s.value);
        // har bir ustun ozgina kechikib chiqadi
        const local = Math.min(
          1,
          Math.max(0, (progress - i * 0.08) / (1 - i * 0.08 || 1)),
        );
        return (
          // Raqam birinchi, yorliq ostida. Ilgari teskari edi va ustunlar
          // "yorliq — raqam — yorliq — raqam" bo'lib bir tekis o'qilardi;
          // raqamlar tepaga chiqqanda ular qatorni boshqaradi.
          //
          // Karta: raqamlar ilgari fonda yalang'och turardi va otzivlar bilan
          // bitta bandda bo'lsa-da, boshqa tilda gapirardi. `bg-pure-black` —
          // aynan otziv kartasining foni, ya'ni ikkalasi bir xil qatlamda.
          // Kontent tepaga tekislanadi: `justify-between` bilan qisqa yorliq
          // kartaning tagiga tushib, raqam bilan orasida bo'sh joy qolardi.
          <div
            key={s.label}
            className="flex flex-col gap-[8px] rounded-[10px] bg-pure-black p-card"
          >
            <p
              className="display tabular-nums"
              style={{ opacity: 0.25 + local * 0.75 }}
            >
              {Math.round(n * local)}
              {suffix}
            </p>
            <p className="text-fog-gray">{s.label}</p>
          </div>
        );
      })}
    </div>
  );
}
