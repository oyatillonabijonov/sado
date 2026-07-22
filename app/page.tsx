import type { Metadata } from "next";
import Link from "next/link";
import ClientsMarquee from "@/components/ClientsMarquee";
import ProjectTile from "@/components/ProjectTile";
import BlogCard from "@/components/BlogCard";
import RedDotLink from "@/components/RedDotLink";
import SectionHeading from "@/components/SectionHeading";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { processSteps, testimonials } from "@/data/testimonials";
import { stats } from "@/data/team";
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
      <section className="relative -mx-[16px] flex min-h-[80vh] flex-col justify-center overflow-hidden px-[16px] py-[120px]">
        <video
          aria-hidden
          autoPlay
          muted
          loop
          playsInline
          className="pointer-events-none absolute inset-y-0 right-0 h-full w-auto max-w-[72%] object-contain [mask-image:linear-gradient(to_right,transparent,black_45%)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_45%)]"
          src="/hero.mp4"
        />
        <div className="relative z-10">
          <h1 className="display max-w-[900px] text-nowrap">
            Raqobatda ko'zga<br />
            tashlanadigan, xarakterli<br />
            brend tizimini quramiz.
          </h1>
          <p className="mt-[48px] max-w-[480px] text-fog-gray">
            SADO — strategiya, dizayn va texnologiya kesishmasida ishlaydigan
            agentlik. Toshkent.
          </p>
          <div className="mt-[48px] flex items-center gap-[48px]">
            <RedDotLink href="/contact">Loyiha boshlash</RedDotLink>
            <Link href="/portfolio" className="text-fog-gray hover:text-bone-white">
              Ishlarimiz
            </Link>
          </div>
        </div>
      </section>

      {/* Clients */}
      <ClientsMarquee />

      {/* Services preview */}
      <section className="pt-[240px]">
        <SectionHeading kicker="Xizmatlar">Nima qilamiz</SectionHeading>
        <div className="grid gap-x-[16px] gap-y-[120px] md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link key={s.slug} href={`/services#${s.slug}`} className="group block">
              <p className="text-subheading text-bone-white">{s.title}</p>
              <p className="mt-[16px] text-fog-gray">{s.description}</p>
              <p className="mt-[16px] text-fog-gray group-hover:text-bone-white">
                Batafsil
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured portfolio */}
      <section className="pt-[240px]">
        <SectionHeading kicker="Tanlangan ishlar">Portfolio</SectionHeading>
        <div className="grid gap-[16px] md:grid-cols-2">
          {featured.map((p) => (
            <ProjectTile key={p.slug} project={p} />
          ))}
        </div>
        <div className="mt-[120px]">
          <RedDotLink href="/portfolio">Barcha ishlar</RedDotLink>
        </div>
      </section>

      {/* Process */}
      <section className="pt-[240px]">
        <SectionHeading kicker="Jarayon">Qanday ishlaymiz</SectionHeading>
        <ol className="grid gap-x-[16px] gap-y-[48px] md:grid-cols-2 lg:grid-cols-3">
          {processSteps.map((step) => (
            <li key={step.n} className="border-t border-graphite pt-[16px]">
              <p className="text-fog-gray">{step.n}</p>
              <p className="mt-[16px] text-subheading text-bone-white">{step.title}</p>
              <p className="mt-[16px] text-fog-gray">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Testimonials */}
      <section className="pt-[240px]">
        <SectionHeading kicker="Mijozlar fikri">Ishonch</SectionHeading>
        <div className="grid gap-x-[48px] gap-y-[120px] lg:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote key={t.name}>
              <p className="text-subheading text-bone-white">“{t.quote}”</p>
              <footer className="mt-[48px]">
                <p className="text-bone-white">{t.name}</p>
                <p className="text-fog-gray">
                  {t.role}, {t.company}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mt-[240px] border-t border-graphite pt-[48px]">
        <div className="grid gap-[48px] sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-fog-gray">{s.label}</p>
              <p className="display mt-[16px]">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Blog preview */}
      <section className="pt-[240px]">
        <SectionHeading kicker="Blog">Fikrlar</SectionHeading>
        <div className="grid gap-[16px] md:grid-cols-3">
          {posts.map((p) => (
            <BlogCard key={p.slug} post={p} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pt-[240px]">
        <h2 className="display max-w-[900px]">
          Loyihangizni muhokama qilamizmi?
        </h2>
        <div className="mt-[48px]">
          <RedDotLink href="/contact">Bog'lanish</RedDotLink>
        </div>
      </section>
    </div>
  );
}
