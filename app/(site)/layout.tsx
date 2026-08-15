import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { site } from "@/data/site";
import { LocaleProvider } from "@/components/LocaleLink";
import { localePath, messages, stripLocale, t } from "@/lib/i18n";
import { currentLocale, currentPath } from "@/lib/locale";
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
  const [settings, locale, path] = await Promise.all([
    getSettings(),
    currentLocale(),
    currentPath(),
  ]);
  const bare = stripLocale(path);

  return {
    metadataBase: new URL(site.url),
    title: {
      // Tagline lug'atdan: u brauzer yorlig'ida har sahifada ko'rinadi.
      // Sayt NOMI esa `data/site.ts` da qoladi — u tarjima qilinmaydi.
      default: `${site.name} — ${t(locale, "site.tagline")}`,
      template: `%s — ${site.name}`,
    },
    description: settings.description,
    /**
     * `hreflang` juftligi — qidiruv tizimi ikkala versiyani bir sahifaning
     * tarjimasi deb tanishi uchun. Ularsiz `/portfolio` va `/ru/portfolio`
     * nusxa kontent bo'lib hisoblanardi.
     */
    alternates: {
      canonical: localePath(locale, bare),
      languages: {
        uz: bare,
        ru: localePath("ru", bare),
      },
    },
    /**
     * OG rasmi PNG, SVG emas — va bu qattiq talab. Facebook, Instagram,
     * LinkedIn, Telegram va X ning hech biri `image/svg+xml` ni oldindan
     * ko'rish rasmi sifatida chizmaydi: ilgari bu yerda `og.svg` turgan va
     * sayt havolasi qayerda ulashilsa ham rasmsiz chiqardi.
     *
     * `width`/`height` ham shart: usiz skraper rasmni yuklab o'lchaguncha
     * oyna bo'sh turadi va birinchi ulashishda ko'pincha rasmsiz ketadi.
     */
    openGraph: {
      siteName: site.name,
      type: "website",
      locale: locale === "ru" ? "ru_RU" : "uz_UZ",
      images: [
        {
          url: locale === "ru" ? "/images/og-ru.png" : "/images/og-uz.png",
          width: 1200,
          height: 630,
          alt: `${site.name} — ${t(locale, "site.tagline")}`,
        },
      ],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, locale] = await Promise.all([getSettings(), currentLocale()]);
  const m = messages(locale);

  return (
    <html lang={locale} className={interTight.variable} suppressHydrationWarning>
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
        {/* Til context'i: `LocaleLink` har bir havolaga prefiksni shundan
            oladi, ya'ni ruscha sahifadagi havola ruschaligicha qoladi. */}
        <LocaleProvider locale={locale}>
          <Header settings={settings} m={m} locale={locale} />
          <main className="pt-[72px]">{children}</main>
          <Footer settings={settings} m={m} />
        </LocaleProvider>
      </body>
    </html>
  );
}
