import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { currentLocale } from "@/lib/locale";
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
  const m = messages(await currentLocale());
  const projects = await getProjects();
  return (
    <div className="shell pt-[48px]">
      <SectionHeading
        kicker={m["portfolio.kicker"]}
        lead={m["portfolio.lead"]}
      >
        {m["portfolio.title"]}
      </SectionHeading>
      {projects.length === 0 ? (
        <EmptyState
          title={m["portfolio.empty"]}
          hint={m["portfolio.empty.hint"]}
          action={{ href: "/about#aloqa", label: m["common.contact"] }}
        />
      ) : (
        <PortfolioGrid projects={projects} categories={projectCategories} />
      )}
    </div>
  );
}
