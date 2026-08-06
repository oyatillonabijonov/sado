import type { Metadata } from "next";
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
      <PortfolioGrid projects={projects} categories={projectCategories} />
    </div>
  );
}
