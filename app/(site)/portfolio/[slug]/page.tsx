import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adjacentProjects, getProject, getProjects } from "@/lib/content";

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
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
  const project = await getProject(slug);
  if (!project) notFound();
  const { next } = await adjacentProjects(slug);

  return (
    <article className="shell pt-[120px]">
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
      <div className="relative mt-[120px] aspect-[16/9] w-full overflow-hidden rounded-[10px] bg-soft-black">
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
            className={`relative aspect-[4/3] w-full overflow-hidden rounded-[10px] bg-soft-black ${
              i === 0 ? "md:col-span-2 md:aspect-[16/9]" : ""
            }`}
          >
            {src.endsWith(".mp4") ? (
              <video
                src={src}
                muted
                loop
                autoPlay
                playsInline
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <Image
                src={src}
                alt={`${project.title} — galereya ${i + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {/* Keyingi loyiha — to'liq cover, hover'da nom chiqadi */}
      <Link
        href={`/portfolio/${next.slug}`}
        className="group relative mt-[120px] block aspect-[16/9] w-full overflow-hidden rounded-[10px] bg-soft-black"
      >
        <Image
          src={next.cover}
          alt={next.title}
          fill
          sizes="100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        {/* ponytail: media overlay — rasm ustida har doim qorayadi, temadan mustaqil */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-[12px] bg-black/0 transition-colors duration-300 group-hover:bg-black/55">
          <p className="uppercase tracking-wide text-white/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Keyingi loyiha
          </p>
          <p className="display text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {next.client}
          </p>
        </div>
      </Link>
    </article>
  );
}
