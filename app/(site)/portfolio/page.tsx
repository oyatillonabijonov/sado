import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { currentLocale } from "@/lib/locale";
import EmptyState from "@/components/EmptyState";
import PortfolioGrid from "@/components/PortfolioGrid";
import SectionHeading from "@/components/SectionHeading";
import { projectCategories } from "@/data/projects";
import { getProjects } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  // Statik `metadata` bir tilda qotib qolardi — ruscha sahifada ham
  // o'zbekcha tavsif chiqardi.
  const m = messages(await currentLocale());
  return { title: m["portfolio.title"], description: m["meta.portfolio"] };
}

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
