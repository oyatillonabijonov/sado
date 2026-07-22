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
      <div className="mb-[48px] flex flex-wrap gap-[16px]" role="tablist" aria-label="Kategoriya filtri">
        {(["Barchasi", ...categories] as const).map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={active === c}
            onClick={() => setActive(c)}
            className={`cursor-pointer ${
              active === c ? "text-bone-white" : "text-fog-gray hover:text-bone-white"
            }`}
          >
            {active === c && (
              <span aria-hidden className="mr-[8px] inline-block size-[6px] rounded-full bg-scarlet-signal align-middle" />
            )}
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
