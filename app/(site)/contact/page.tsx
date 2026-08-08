import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import SectionHeading from "@/components/SectionHeading";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Aloqa",
  description: "Loyihangizni muhokama qilamiz — SADO bilan bog'laning.",
};

export default function ContactPage() {
  return (
    <div className="shell pt-[120px]">
      <SectionHeading kicker="Aloqa">
        Loyihangizni muhokama qilamiz
      </SectionHeading>
      <div className="grid gap-[120px] lg:grid-cols-[2fr_1fr]">
        <div className="max-w-[640px]">
          <ContactForm />
        </div>
        <aside className="flex flex-col gap-[48px]">
          <div>
            <p className="text-fog-gray">Email</p>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
          <div>
            <p className="text-fog-gray">Telefon</p>
            <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
          </div>
          <div>
            <p className="text-fog-gray">Manzil</p>
            <p className="text-bone-white">{site.address}</p>
          </div>
          <div className="flex flex-col gap-[8px]">
            <p className="text-fog-gray">Ijtimoiy tarmoqlar</p>
            {site.socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
