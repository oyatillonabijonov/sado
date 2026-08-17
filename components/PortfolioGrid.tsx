"use client";

import { useState } from "react";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import ProjectTile from "@/components/ProjectTile";
import type { Project, ProjectCategory } from "@/data/projects";

export default function PortfolioGrid({
  projects,
  categories,
}: {
  projects: Project[];
  /* `readonly`: ro'yxat `data/projects.ts` da `as const` bilan e'lon qilingan
     — yagona manba bo'lgani uchun uni o'zgartirib bo'lmasligi to'g'ri. */
  categories: readonly ProjectCategory[];
}) {
  const [active, setActive] = useState<ProjectCategory | "Barchasi">("Barchasi");
  const shown =
    active === "Barchasi" ? projects : projects.filter((p) => p.category === active);
  return (
    <div>
      {/* Chip'lar: ilgari filtr oddiy matn qatori edi va bosilishi mumkinligi
          ko'rinmasdi — faol variantni faqat kichik qizil nuqta ajratardi.
          Zamin bilan ular boshqariladigan element ekani o'qiladi. */}
      {/* Mobilda o'ralmaydi, suriladi: beshta chip 375px da uch qatorga
          tushib, to'rgacha yetguncha ekranning uchdan biri ketardi. Chetdan
          chetgacha (`-mx` + `px` = gutter) — qirqilgan chip surish mumkinligini
          o'zi aytadi. Desktopda avvalgidek o'raladi. */}
      <div
        className="no-scrollbar mb-[48px] flex gap-[8px] max-md:-mx-[var(--gutter)] max-md:overflow-x-auto max-md:px-[var(--gutter)] md:flex-wrap"
        role="tablist"
        aria-label="Kategoriya filtri"
      >
        {(["Barchasi", ...categories] as const).map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={active === c}
            onClick={() => setActive(c)}
            className={`shrink-0 cursor-pointer rounded-full px-[20px] py-[10px] transition-colors ${
              active === c
                ? "bg-bone-white text-pure-black"
                : "bg-soft-black text-fog-gray hover:text-bone-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      {/* `key={active}` — filtr almashganda to'r qaytadan ochiladi, aks holda
          yangi kartalar animatsiyasiz paydo bo'lib qolardi. */}
      <Stagger key={active} className="grid gap-[16px] md:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => (
          <StaggerItem key={p.slug}>
            <ProjectTile project={p} />
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
