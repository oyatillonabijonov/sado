"use client";

import { useState } from "react";
import ProjectTile from "@/components/ProjectTile";
import type { Project, ProjectCategory } from "@/data/projects";

export default function PortfolioGrid({
  projects,
  categories,
}: {
  projects: Project[];
  categories: ProjectCategory[];
}) {
  const [active, setActive] = useState<ProjectCategory | "Barchasi">("Barchasi");
  const shown =
    active === "Barchasi" ? projects : projects.filter((p) => p.category === active);
  return (
    <div>
      {/* Chip'lar: ilgari filtr oddiy matn qatori edi va bosilishi mumkinligi
          ko'rinmasdi — faol variantni faqat kichik qizil nuqta ajratardi.
          Zamin bilan ular boshqariladigan element ekani o'qiladi. */}
      <div
        className="mb-[48px] flex flex-wrap gap-[8px]"
        role="tablist"
        aria-label="Kategoriya filtri"
      >
        {(["Barchasi", ...categories] as const).map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={active === c}
            onClick={() => setActive(c)}
            className={`cursor-pointer rounded-full px-[20px] py-[10px] transition-colors ${
              active === c
                ? "bg-bone-white text-pure-black"
                : "bg-soft-black text-fog-gray hover:text-bone-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid gap-[16px] md:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => (
          <ProjectTile key={p.slug} project={p} />
        ))}
      </div>
    </div>
  );
}
