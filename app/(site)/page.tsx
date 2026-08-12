import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { currentLocale } from "@/lib/locale";
import ClientsMarquee from "@/components/ClientsMarquee";
import HeroSlideshow from "@/components/HeroSlideshow";
import { Reveal, Rise, Stagger, StaggerItem } from "@/components/motion/Reveal";
import ContactForm from "@/components/ContactForm";
import ProjectTile from "@/components/ProjectTile";
import BlogCard from "@/components/BlogCard";
import RedDotLink from "@/components/RedDotLink";
import SectionHeading from "@/components/SectionHeading";
import Stats from "@/components/Stats";
import { getProjects, getTestimonials } from "@/lib/content";
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
  const m = messages(await currentLocale());
  const [allProjects, allPosts, settings, testimonials] = await Promise.all([
    getProjects(),
    getAllPosts(),
    getSettings(),
    getTestimonials(),
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
      <ClientsMarquee m={m} />

      {/* Featured portfolio. Kontent bo'lmasa seksiya butunlay chiqmaydi:
          "So'nggi loyihalar" sarlavhasi ostidagi bo'sh grid va'daning
          bajarilmagani bo'lib ko'rinadi. */}
      {featured.length > 0 && (
      <section className="shell pt-section-sm">
        <SectionHeading
          kicker={m["home.works.kicker"]}
          lead={m["home.services.lead"]}
          action={<RedDotLink href="/portfolio">{m["home.works.all"]}</RedDotLink>}
        >
          {m["home.works.heading"]}
        </SectionHeading>
        <Stagger className="grid gap-x-[16px] gap-y-stack md:grid-cols-2">
          {featured.map((p) => (
            <StaggerItem key={p.slug}>
              <ProjectTile project={p} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      )}

      {/* Blog preview — maqola bo'lmasa chiqmaydi. */}
      {posts.length > 0 && (
      <section className="shell pt-section">
        <SectionHeading
          kicker={m["home.blog.kicker"]}
          action={<RedDotLink href="/blog">{m["home.blog.all"]}</RedDotLink>}
        >
          {m["home.blog.heading"]}
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

      {/* Ishonch bandi — otzivlar va raqamlar bitta fonda.
          Butun sahifa bitta tekis fon edi va seksiyalarni faqat 1px chiziq
          ajratardi. To'liq kenglikdagi bu band sahifaga qatlam beradi va
          "bizga ishonish mumkin" degan ikkita dalilni bir joyga yig'adi.

          Formadan oldingi o'rin ataylab: dalil so'rovdan bevosita oldin
          turadi — odam "bog'lanaymi?" degan qarorni raqamlar va mijoz
          so'zlari hali ko'z oldida turganda qabul qiladi. */}
      <section className="mt-section bg-soft-black py-section-sm">
        <div className="shell">
        <SectionHeading
          kicker={m["home.trust.kicker"]}
          lead={m["home.testimonials.lead"]}
        >
          {m["home.trust.heading"]}
        </SectionHeading>

        {/* Mobilda raqamlar otzivlardan oldin: 2×2 to'r bir qarashda o'qiladi,
            otziv esa o'qishni talab qiladi. Desktopda manba tartibi qoladi. */}
        <div className="flex flex-col gap-section-sm">
          {/* Desktopda o'zi suriladi va hover'da to'xtaydi. Telefonda `hover`
              yo'q — o'qiyotgan gap qochib ketardi — shuning uchun u yerda
              animatsiya o'chadi (`globals.css`) va o'rniga qo'l bilan
              suriladigan snap-rail qoladi. Karta 85vw: keyingisining cheti
              ko'rinib turadi, ya'ni surish mumkinligi o'z-o'zidan aytiladi. */}
          {/* Otziv yo'q bo'lsa lenta umuman chizilmaydi: bo'sh qator
              "yuklanmadi" bo'lib ko'rinardi. Raqamlar esa qoladi. */}
          {testimonials.length > 0 && (
          <div className="no-scrollbar sado-rail-mask bleed order-2 snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-pl-[var(--gutter)] md:order-none md:overflow-hidden">
            <ul className="sado-rail shell flex w-max gap-[16px]">
              {[...testimonials, ...testimonials].map((t, i) => {
                // Takrori faqat cheksiz lenta uchun kerak. Qo'lda suriladigan
                // rail'da u swipe uzunligini ikki baravar qilib, oxirida
                // o'qilgan otzivlarni qaytadan ko'rsatardi.
                const isDuplicate = i >= testimonials.length;
                return (
                  <li
                    key={i}
                    aria-hidden={isDuplicate}
                    className={`snap-start ${isDuplicate ? "max-md:hidden" : ""}`}
                  >
                    <figure className="flex h-full w-[85vw] flex-col justify-between gap-[24px] rounded-[10px] bg-pure-black p-card sm:w-[480px] md:gap-[48px]">
                      <blockquote className="text-[19px] text-bone-white md:text-subheading">
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
                );
              })}
            </ul>
          </div>
          )}

          <Reveal className="order-1 md:order-none">
            <Stats stats={settings.stats} />
          </Reveal>
        </div>
        </div>
      </section>

      {/* CTA + aloqa formasi */}
      <section className="shell mt-section border-t border-graphite pt-section-sm pb-[48px]">
        <div className="grid gap-[32px] lg:grid-cols-2 md:gap-[80px]">
          <div className="lg:sticky lg:top-[120px] lg:self-start">
            <p className="mb-[24px] text-fog-gray">{m["about.contact.kicker"]}</p>
            <h2 className="display max-w-[560px]">
              {m["home.cta.heading"]}
            </h2>
            <p className="mt-[32px] max-w-[46ch] text-fog-gray">
              {m["home.cta.text"]}
            </p>
            <div className="mt-[32px] flex flex-col md:mt-[48px] md:gap-[8px]">
              <a
                href={`mailto:${settings.email}`}
                className="tap text-fog-gray hover:text-bone-white"
              >
                {settings.email}
              </a>
              <a
                href={telHref(settings.phone)}
                className="tap text-fog-gray hover:text-bone-white"
              >
                {settings.phone}
              </a>
            </div>
          </div>
          <div className="max-w-[640px]">
            <ContactForm m={m} />
          </div>
        </div>
      </section>
    </div>
  );
}
