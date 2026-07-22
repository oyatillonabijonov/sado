"use client";

import dynamic from "next/dynamic";

const Silk = dynamic(() => import("./Silk"), { ssr: false });

/** Hero orqa foni — Silk shader (three + R3F), faqat clientda yuklanadi. */
export default function HeroSilk() {
  return (
    <div aria-hidden className="absolute inset-0">
      <Silk speed={5} scale={1} color="#202022" noiseIntensity={1.5} rotation={0} />
    </div>
  );
}
