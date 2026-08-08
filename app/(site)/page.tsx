import type { Metadata } from "next";
import ClientsMarquee from "@/components/ClientsMarquee";
import ContactForm from "@/components/ContactForm";
import ProjectTile from "@/components/ProjectTile";
import BlogCard from "@/components/BlogCard";
import RedDotLink from "@/components/RedDotLink";
import SectionHeading from "@/components/SectionHeading";
import Stats from "@/components/Stats";
import { getProjects } from "@/lib/content";
import { testimonials } from "@/data/testimonials";
import { site } from "@/data/site";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "SADO — Dizayn agentligi",
  description:
    "Toshkentdagi dizayn agentligi. Brend strategiyasi, vizual identifikatsiya, veb va UI/UX — 2018-yildan beri 120 dan ortiq loyiha.",
};

export default async function HomePage() {
  const [allProjects, allPosts] = await Promise.all([getProjects(), getAllPosts()]);
  const featured = allProjects.filter((p) => p.featured).slice(0, 4);
  const posts = allPosts.slice(0, 3);

  // Bo'sh seksiyalar umuman chiqmaydi, shuning uchun raqamlar faqat
  // ko'rinadiganlar bo'yicha hisoblanadi — aks holda "02, 04" bo'lib qoladi.
  const visible = [
    featured.length > 0 && "ishlar",
    "ishonch",
    posts.length > 0 && "blog",
    "aloqa",
  ].filter((v): v is string => Boolean(v));
  const no = (key: string) => String(visible.indexOf(key) + 1).padStart(2, "0");

  return (
    <div className="px-[16px]">
      {/* Hero */}
      <section className="relative -mx-[16px] flex min-h-[calc(100svh-72px)] flex-col justify-end overflow-hidden px-[16px] pb-[48px]">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {["/sd1.png", "/sd2.png", "/sd3.png", "/sd4.png", "/sd5.webp"].map(
            (src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                className="hero-frame absolute inset-0 h-full w-full object-cover"
                style={{ animationDelay: `${i * 3}s` }}
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

      {/* Featured portfolio. Kontent bo'lmasa seksiya butunlay chiqmaydi:
          "So'nggi loyihalar" sarlavhasi ostidagi bo'sh grid va'daning
          bajarilmagani bo'lib ko'rinadi. */}
      {featured.length > 0 && (
      <section className="pt-[120px]">
        <SectionHeading
          index={no("ishlar")}
          kicker="Ishlar"
          lead="Har bir loyiha strategiyadan boshlanadi va yaxlit vizual tizim bilan tugaydi."
          action={<RedDotLink href="/portfolio">Barcha ishlar</RedDotLink>}
        >
          So'nggi loyihalar.
        </SectionHeading>
        <div className="grid gap-x-[16px] gap-y-[64px] md:grid-cols-2">
          {featured.map((p) => (
            <ProjectTile key={p.slug} project={p} />
          ))}
        </div>
      </section>
      )}

      {/* Ishonch bandi — otzivlar va raqamlar bitta fonda.
          Butun sahifa bitta tekis fon edi va seksiyalarni faqat 1px chiziq
          ajratardi. To'liq kenglikdagi bu band sahifaga qatlam beradi va
          "bizga ishonish mumkin" degan ikkita dalilni bir joyga yig'adi. */}
      <section className="mt-[160px] -mx-[16px] bg-soft-black px-[16px] py-[120px]">
        <SectionHeading
          index={no("ishonch")}
          kicker="Ishonch"
          lead="Uch yildan beri birga ishlayotgan mijozlarimiz bor — quyidagilar ularning o'z so'zlari."
        >
          Bizga ishonganlar.
        </SectionHeading>

        {/* Bitta qatorda, o'zi suriladi. Hover'da to'xtaydi — o'qiyotgan gapni
            qochirmaslik uchun. Ro'yxat ikki marta chiziladi: animatsiya -50% da
            boshiga qaytadi va uzilish ko'rinmaydi. */}
        <div className="sado-marquee-mask -mx-[16px] overflow-hidden">
          <ul className="sado-rail flex w-max gap-[16px] px-[16px]">
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

        <div className="mt-[120px]">
          <Stats />
        </div>
      </section>

      {/* Blog preview — maqola bo'lmasa chiqmaydi. */}
      {posts.length > 0 && (
      <section className="pt-[160px]">
        <SectionHeading
          index={no("blog")}
          kicker="Blog"
          action={<RedDotLink href="/blog">Barcha maqolalar</RedDotLink>}
        >
          Fikrlar va kuzatuvlar.
        </SectionHeading>
        <div className="grid gap-x-[16px] gap-y-[48px] md:grid-cols-3">
          {posts.map((p) => (
            <BlogCard key={p.slug} post={p} />
          ))}
        </div>
      </section>
      )}

      {/* CTA + aloqa formasi */}
      <section className="mt-[160px] border-t border-graphite pt-[120px] pb-[48px]">
        <div className="grid gap-[80px] lg:grid-cols-2">
          <div className="lg:sticky lg:top-[120px] lg:self-start">
            <p className="mb-[24px] flex items-baseline gap-[12px] text-fog-gray">
              <span className="tabular-nums text-bone-white">{no("aloqa")}</span>
              <span>Aloqa</span>
            </p>
            <h2 className="display max-w-[560px]">
              Loyihangizni muhokama qilamizmi?
            </h2>
            <p className="mt-[32px] max-w-[46ch] text-fog-gray">
              Qisqacha yozib qoldiring — bir ish kuni ichida javob beramiz va
              birinchi suhbatni belgilaymiz.
            </p>
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
