import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { currentLocale } from "@/lib/locale";
import Image from "next/image";
import Link from "@/components/LocaleLink";
import { notFound } from "next/navigation";
import { adjacentProjects, getProject, getProjects } from "@/lib/content";
import { isVideo } from "@/lib/site-format";

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
  const m = messages(await currentLocale());
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  const { next } = await adjacentProjects(slug);

  return (
    <article className="shell pt-[48px]">
      <h1 className="display max-w-[900px]">{project.title}</h1>

      {/* Meta row */}
      {/* Spec-sheet: mobilda 2 ustun. Bittada to'rt yorliq 48px oraliq bilan
          butun ekranni egallardi, holbuki bu qatorning vazifasi — bir ko'z
          yugurtirishda "kim, qachon, nima" ga javob berish. */}
      <div className="mt-section-sm grid grid-cols-2 gap-x-[16px] gap-y-[24px] sm:gap-[48px] lg:grid-cols-4">
        {[
          [m["project.client"], project.client],
          [m["project.year"], project.year],
          [m["project.categoryLabel"], project.category],
          [m["project.services"], project.services.join(", ")],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-fog-gray">{label}</p>
            <p className="text-bone-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Cover */}
      <div className="relative mt-section-sm aspect-[16/9] w-full overflow-hidden rounded-[10px] bg-soft-black">
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
      <div className="mt-section-sm grid gap-[32px] lg:grid-cols-2 md:gap-[48px]">
        <div>
          <p className="text-fog-gray">{m["project.brief"]}</p>
          <p className="mt-[16px] max-w-[560px] text-subheading text-bone-white">
            {project.brief}
          </p>
        </div>
        <div>
          <p className="text-fog-gray">{m["project.solution"]}</p>
          <p className="mt-[16px] max-w-[560px] text-subheading text-bone-white">
            {project.solution}
          </p>
        </div>
      </div>

      {/* Results */}
      {project.results && (
        <div className="mt-section-sm border-t border-graphite pt-[48px]">
          <div className="grid grid-cols-2 gap-x-[16px] gap-y-[32px] sm:gap-[48px] lg:grid-cols-3">
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
      <div className="mt-section-sm grid gap-[16px] md:grid-cols-2">
        {project.gallery.map((src, i) => (
          <div
            key={src}
            className={`relative aspect-[4/3] w-full overflow-hidden rounded-[10px] bg-soft-black ${
              i === 0 ? "md:col-span-2 md:aspect-[16/9]" : ""
            }`}
          >
            {/* Video gif kabi: boshqaruvsiz, ovozsiz, aylanma. `muted` shart —
                usiz mobil brauzerlar avtoijroni butunlay bloklaydi.
                `.mp4` tekshiruvi o'rniga `isVideo`: paneldan WebM ham
                yuklanadi va u bu yerda jimgina rasm bo'lib qolardi. */}
            {isVideo(src) ? (
              <video
                src={src}
                muted
                loop
                autoPlay
                playsInline
                aria-label={`${project.title} — galereya ${i + 1}`}
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
        className="group relative mt-section-sm block aspect-[16/9] w-full overflow-hidden rounded-[10px] bg-soft-black"
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
            {m["project.next"]}
          </p>
          <p className="display text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {next.client}
          </p>
        </div>
      </Link>
    </article>
  );
}
