import type { Metadata } from "next";
import PortfolioGrid from "@/components/PortfolioGrid";
import SectionHeading from "@/components/SectionHeading";
import { projectCategories, projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "SADO agentligining tanlangan loyihalari — brending, veb, UI/UX va print.",
};

export default function PortfolioPage() {
  return (
    <div className="px-[16px] pt-[120px]">
      <SectionHeading kicker="Ishlarimiz">Portfolio</SectionHeading>
      <PortfolioGrid projects={projects} categories={projectCategories} />
    </div>
  );
}
