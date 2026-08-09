import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { site } from "@/data/site";
import { getSettings } from "@/lib/settings";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

/**
 * Butun sayt so'rov paytida render qilinadi — statik emas.
 *
 * Sabab Dockerfile'da: `next build` prodda bazani ko'rmaydi (volume hali
 * yo'q), shuning uchun `cp schema.sqlite db.sqlite` — 0 qatorli sxema. Statik
 * qurilgan sahifalar o'sha bo'sh bazadan yozilardi va yangi konteyner mijoz
 * kiritgan hamma narsani "yo'q" deb ko'rsatardi: kontent joyida, HTML esa
 * build paytidagi bo'shligi bilan qotgan. `revalidatePath` buni faqat mijoz
 * navbatdagi safar biror narsani saqlaganda tuzatardi.
 *
 * Narxi arzimas: SQLite lokal fayl, Payload konteyner umrida bir marta init
 * bo'ladi. Rasm optimizatsiyasi keshi esa bundan mustaqil.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: settings.description,
  openGraph: {
    siteName: site.name,
    type: "website",
    images: ["/images/og.svg"],
  },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  return (
    <html lang="uz" className={interTight.variable} suppressHydrationWarning>
      {/* FOUC oldini olish: saqlangan rejimni birinchi bo'yashdan oldin qo'llaymiz.
          <head> ichida — Next 16 da <body> dagi inline skript hydration'ni buzadi. */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.theme;if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
        {/* JS ishlamasa animatsiya boshlang'ich holatida qotib qoladi va
            kontent ko'rinmaydi. Belgilangan elementlarni joyiga qaytaramiz. */}
        <noscript>
          <style>{`[data-motion]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <Header settings={settings} />
        <main className="pt-[72px]">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
