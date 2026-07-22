import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";

const aspects = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
} as const;

/** Edge-to-edge photograph tile — the image IS the card. */
export default function ProjectTile({ project }: { project: Project }) {
  return (
    <Link href={`/portfolio/${project.slug}`} className="group block">
      <div className={`relative w-full overflow-hidden bg-soft-black ${aspects[project.aspect]}`}>
        <Image
          src={project.cover}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-opacity duration-300 group-hover:opacity-80"
        />
      </div>
      <div className="pt-[16px]">
        <p className="text-subheading text-bone-white">{project.client}</p>
        <p className="mt-[8px] text-fog-gray">
          {project.category} — {project.year}
        </p>
      </div>
    </Link>
  );
}
