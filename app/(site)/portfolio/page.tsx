import type { Metadata } from "next";
import EmptyState from "@/components/EmptyState";
import PortfolioGrid from "@/components/PortfolioGrid";
import SectionHeading from "@/components/SectionHeading";
import { projectCategories } from "@/data/projects";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "SADO agentligining tanlangan loyihalari — brending, veb, UI/UX va print.",
};

export default async function PortfolioPage() {
  const projects = await getProjects();
  return (
    <div className="px-[16px] pt-[120px]">
      <SectionHeading kicker="Ishlarimiz">Portfolio</SectionHeading>
      {projects.length === 0 ? (
        <EmptyState
          title="Ishlar tez orada shu yerda bo'ladi."
          hint="Birinchi loyihalarimizni joylayapmiz. Shu orada bevosita bog'lanishingiz mumkin."
          action={{ href: "/contact", label: "Bog'lanish" }}
        />
      ) : (
        <PortfolioGrid projects={projects} categories={projectCategories} />
      )}
    </div>
  );
}
