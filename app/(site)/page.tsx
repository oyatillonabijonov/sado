import type { Metadata } from "next";
import ClientsMarquee from "@/components/ClientsMarquee";
import HeroSlideshow from "@/components/HeroSlideshow";
import { Reveal, Rise, Stagger, StaggerItem } from "@/components/motion/Reveal";
import ContactForm from "@/components/ContactForm";
import ProjectTile from "@/components/ProjectTile";
import BlogCard from "@/components/BlogCard";
import RedDotLink from "@/components/RedDotLink";
import SectionHeading from "@/components/SectionHeading";
import Stats from "@/components/Stats";
import { getProjects } from "@/lib/content";
import { testimonials } from "@/data/testimonials";
import { getSettings } from "@/lib/settings";
import { telHref } from "@/lib/site-format";
import { getAllPosts } from "@/lib/blog";

/* Tavsif ham paneldan: `export const metadata` qat'iy qiymat bo'lardi va
   sozlamalardagi matnni bosib ketardi. */
export async function generateMetadata(): Promise<Metadata> {
  const { description } = await getSettings();
  return { title: "SADO — Dizayn agentligi", description };
}

export default async function HomePage() {
  const [allProjects, allPosts, settings] = await Promise.all([
    getProjects(),
    getAllPosts(),
    getSettings(),
  ]);
  const featured = allProjects.filter((p) => p.featured).slice(0, 4);
  const posts = allPosts.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[calc(100svh-72px)] flex-col justify-end overflow-hidden pb-[48px]">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* Rasmlar paneldan (Sozlamalar → hero). Bo'sh bo'lsa standartlar. */}
          <HeroSlideshow
            images={settings.heroImages}
            imagesMobile={settings.heroImagesMobile}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-pure-black via-pure-black/40 to-pure-black/10" />
        </div>
        <div className="shell relative z-10">
          <Rise>
            <p className="mb-[24px] text-fog-gray">{settings.heroKicker}</p>
          </Rise>
          {/* whitespace-pre-line: paneldagi yangi qator saytda ham qator
              bo'lib tushadi, mijoz <br /> yozishi shart emas. */}
          <Rise delay={0.08}>
            <h1
              className="display whitespace-pre-line"
              style={{ fontSize: "clamp(32px, 4.5vw, 60px)" }}
            >
              {settings.heroHeading}
            </h1>
          </Rise>
        </div>
      </section>

      {/* Clients */}
      <ClientsMarquee />

      {/* Featured portfolio. Kontent bo'lmasa seksiya butunlay chiqmaydi:
          "So'nggi loyihalar" sarlavhasi ostidagi bo'sh grid va'daning
          bajarilmagani bo'lib ko'rinadi. */}
      {featured.length > 0 && (
      <section className="shell pt-[120px]">
        <SectionHeading
          kicker="Ishlar"
          lead="Har bir loyiha strategiyadan boshlanadi va yaxlit vizual tizim bilan tugaydi."
          action={<RedDotLink href="/portfolio">Barcha ishlar</RedDotLink>}
        >
          So'nggi loyihalar.
        </SectionHeading>
        <Stagger className="grid gap-x-[16px] gap-y-[64px] md:grid-cols-2">
          {featured.map((p) => (
            <StaggerItem key={p.slug}>
              <ProjectTile project={p} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      )}

      {/* Ishonch bandi — otzivlar va raqamlar bitta fonda.
          Butun sahifa bitta tekis fon edi va seksiyalarni faqat 1px chiziq
          ajratardi. To'liq kenglikdagi bu band sahifaga qatlam beradi va
          "bizga ishonish mumkin" degan ikkita dalilni bir joyga yig'adi. */}
      <section className="mt-[160px] bg-soft-black py-[120px]">
        <div className="shell">
        <SectionHeading
          kicker="Ishonch"
          lead="Uch yildan beri birga ishlayotgan mijozlarimiz bor — quyidagilar ularning o'z so'zlari."
        >
          Bizga ishonganlar.
        </SectionHeading>

        {/* Bitta qatorda, o'zi suriladi. Hover'da to'xtaydi — o'qiyotgan gapni
            qochirmaslik uchun. Ro'yxat ikki marta chiziladi: animatsiya -50% da
            boshiga qaytadi va uzilish ko'rinmaydi. */}
        <div className="sado-marquee-mask bleed overflow-hidden">
          <ul className="sado-rail shell flex w-max gap-[16px]">
            {[...testimonials, ...testimonials].map((t, i) => (
              <li key={i} aria-hidden={i >= testimonials.length}>
                <figure className="flex h-full w-[360px] flex-col justify-between gap-[48px] rounded-[10px] bg-pure-black p-[32px] sm:w-[480px]">
                  <blockquote className="text-subheading text-bone-white">
                    {t.quote}
                  </blockquote>
                  <figcaption className="flex items-center gap-[16px]">
                    {/* Foto o'rniga bosh harflar — soxta stok surat mijoz sifatida chiqmasin. */}
                    <span
                      aria-hidden
                      className="flex size-[48px] shrink-0 items-center justify-center rounded-full bg-soft-black text-subheading text-fog-gray"
                    >
                      {t.name.slice(0, 1)}
                    </span>
                    <span>
                      <span className="block text-subheading font-medium text-bone-white">
                        {t.name}
                      </span>
                      <span className="block text-fog-gray">
                        {t.role}, {t.company}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>

        <Reveal className="mt-[120px]">
          <Stats />
        </Reveal>
        </div>
      </section>

      {/* Blog preview — maqola bo'lmasa chiqmaydi. */}
      {posts.length > 0 && (
      <section className="shell pt-[160px]">
        <SectionHeading
          kicker="Blog"
          action={<RedDotLink href="/blog">Barcha maqolalar</RedDotLink>}
        >
          Fikrlar va kuzatuvlar.
        </SectionHeading>
        <Stagger className="grid gap-x-[16px] gap-y-[48px] md:grid-cols-3">
          {posts.map((p) => (
            <StaggerItem key={p.slug}>
              <BlogCard post={p} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      )}

      {/* CTA + aloqa formasi */}
      <section className="shell mt-[160px] border-t border-graphite pt-[120px] pb-[48px]">
        <div className="grid gap-[80px] lg:grid-cols-2">
          <div className="lg:sticky lg:top-[120px] lg:self-start">
            <p className="mb-[24px] text-fog-gray">Aloqa</p>
            <h2 className="display max-w-[560px]">
              Loyihangizni muhokama qilamizmi?
            </h2>
            <p className="mt-[32px] max-w-[46ch] text-fog-gray">
              Qisqacha yozib qoldiring — bir ish kuni ichida javob beramiz va
              birinchi suhbatni belgilaymiz.
            </p>
            <div className="mt-[48px] flex flex-col gap-[8px]">
              <a
                href={`mailto:${settings.email}`}
                className="text-fog-gray hover:text-bone-white"
              >
                {settings.email}
              </a>
              <a href={telHref(settings.phone)} className="text-fog-gray hover:text-bone-white">
                {settings.phone}
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
