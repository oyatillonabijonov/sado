import type { Metadata } from "next";
import ClientsMarquee from "@/components/ClientsMarquee";
import ContactForm from "@/components/ContactForm";
import ProjectTile from "@/components/ProjectTile";
import BlogCard from "@/components/BlogCard";
import RedDotLink from "@/components/RedDotLink";
import SectionHeading from "@/components/SectionHeading";
import Stats from "@/components/Stats";
import { projects } from "@/data/projects";
import { testimonials } from "@/data/testimonials";
import { site } from "@/data/site";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "SADO — Dizayn agentligi",
  description:
    "Brend strategiyasi, veb-dizayn va raqamli tajribalar. Placeholder tavsif.",
};

export default function HomePage() {
  const featured = projects.filter((p) => p.featured).slice(0, 4);
  const posts = getAllPosts().slice(0, 3);

  return (
    <div className="px-[16px]">
      {/* Hero */}
      <section className="relative -mx-[16px] flex min-h-[calc(100svh-48px)] flex-col justify-end overflow-hidden px-[16px] pb-[48px]">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {["/sd1.png", "/sd2.png", "/sd3.png", "/sd4.png", "/sd5.webp"].map(
            (src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                className="hero-frame absolute inset-0 h-full w-full object-cover"
                style={{ animationDelay: `${i * 0.5}s` }}
              />
            ),
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-pure-black via-pure-black/40 to-pure-black/10" />
        </div>
        <div className="relative z-10">
          <p className="mb-[24px] text-fog-gray">
            {site.tagline} — Toshkent, {site.founded}-yildan
          </p>
          <h1
            className="display"
            style={{ fontSize: "clamp(32px, 4.5vw, 60px)" }}
          >
            Brendlarning vizual ko'rinishini
            <br className="hidden sm:inline" /> shakllantiramiz.
          </h1>
        </div>
      </section>

      {/* Clients */}
      <ClientsMarquee />

      {/* Featured portfolio */}
      <section className="pt-[80px]">
        <SectionHeading>
          So'nggi loyihalar.
        </SectionHeading>
        <div className="grid gap-x-[16px] gap-y-[64px] md:grid-cols-2">
          {featured.map((p) => (
            <ProjectTile key={p.slug} project={p} />
          ))}
        </div>
        <div className="mt-[64px]">
          <RedDotLink href="/portfolio">Barcha ishlar</RedDotLink>
        </div>
      </section>

      {/* Testimonials — 9:16 video otzivlar */}
      <section className="pt-[160px]">
        <SectionHeading kicker="Mijozlar fikri">
          Bizga ishonganlar.
        </SectionHeading>
        <div className="grid gap-x-[16px] gap-y-[48px] sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name}>
              <div className="aspect-[9/16] w-full overflow-hidden bg-soft-black">
                <iframe
                  src={`https://www.youtube.com/embed/${t.youtubeId}`}
                  title={`${t.name} — video fikr`}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <figcaption className="pt-[16px]">
                <p className="text-bone-white">{t.name}</p>
                <p className="text-fog-gray">
                  {t.role}, {t.company}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="pt-[160px]">
        <Stats />
      </section>

      {/* Blog preview */}
      <section className="pt-[160px]">
        <SectionHeading kicker="Blog">Fikrlar va kuzatuvlar.</SectionHeading>
        <div className="grid gap-x-[16px] gap-y-[48px] md:grid-cols-3">
          {posts.map((p) => (
            <BlogCard key={p.slug} post={p} />
          ))}
        </div>
      </section>

      {/* CTA + aloqa formasi */}
      <section className="mt-[160px] border-t border-graphite pt-[120px] pb-[48px]">
        <div className="grid gap-[80px] lg:grid-cols-2">
          <div>
            <h2 className="display max-w-[560px]">
              Loyihangizni muhokama qilamizmi?
            </h2>
            <div className="mt-[48px] flex flex-col gap-[8px]">
              <a
                href={`mailto:${site.email}`}
                className="text-fog-gray hover:text-bone-white"
              >
                {site.email}
              </a>
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="text-fog-gray hover:text-bone-white"
              >
                {site.phone}
              </a>
            </div>
          </div>
          <div className="max-w-[640px]">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
