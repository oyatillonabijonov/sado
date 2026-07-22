import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import RedDotLink from "@/components/RedDotLink";
import { adjacentProjects, getProject, projects } from "@/data/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.brief,
    openGraph: { images: [project.cover] },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const { prev, next } = adjacentProjects(slug);

  return (
    <article className="px-[16px] pt-[120px]">
      <h1 className="display max-w-[900px]">{project.title}</h1>

      {/* Meta row */}
      <div className="mt-[120px] grid gap-[48px] sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Mijoz", project.client],
          ["Yil", project.year],
          ["Kategoriya", project.category],
          ["Xizmatlar", project.services.join(", ")],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-fog-gray">{label}</p>
            <p className="text-bone-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Cover */}
      <div className="relative mt-[120px] aspect-[16/9] w-full bg-soft-black">
        <Image
          src={project.cover}
          alt={project.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Brief / Solution */}
      <div className="mt-[120px] grid gap-[48px] lg:grid-cols-2">
        <div>
          <p className="text-fog-gray">Muammo</p>
          <p className="mt-[16px] max-w-[560px] text-subheading text-bone-white">
            {project.brief}
          </p>
        </div>
        <div>
          <p className="text-fog-gray">Yechim</p>
          <p className="mt-[16px] max-w-[560px] text-subheading text-bone-white">
            {project.solution}
          </p>
        </div>
      </div>

      {/* Results */}
      {project.results && (
        <div className="mt-[120px] border-t border-graphite pt-[48px]">
          <div className="grid gap-[48px] sm:grid-cols-2 lg:grid-cols-3">
            {project.results.map((r) => (
              <div key={r.label}>
                <p className="text-fog-gray">{r.label}</p>
                <p className="display mt-[16px]">{r.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gallery */}
      <div className="mt-[120px] grid gap-[16px] md:grid-cols-2">
        {project.gallery.map((src, i) => (
          <div
            key={src}
            className={`relative aspect-[4/3] w-full bg-soft-black ${
              i === 0 ? "md:col-span-2 md:aspect-[16/9]" : ""
            }`}
          >
            <Image
              src={src}
              alt={`${project.title} — galereya ${i + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Prev / Next */}
      <nav className="mt-[240px] flex items-center justify-between border-t border-graphite pt-[48px]">
        <Link href={`/portfolio/${prev.slug}`} className="group">
          <p className="text-fog-gray">Oldingi loyiha</p>
          <p className="text-subheading text-bone-white group-hover:text-fog-gray">
            {prev.client}
          </p>
        </Link>
        <Link href={`/portfolio/${next.slug}`} className="group text-right">
          <p className="text-fog-gray">Keyingi loyiha</p>
          <p className="text-subheading text-bone-white group-hover:text-fog-gray">
            {next.client}
          </p>
        </Link>
      </nav>

      <div className="mt-[120px]">
        <RedDotLink href="/contact">Shunga o'xshash loyiha kerakmi?</RedDotLink>
      </div>
    </article>
  );
}
