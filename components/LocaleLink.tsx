"use client";

import Link from "next/link";
import { createContext, useContext, type ComponentProps } from "react";
import { DEFAULT_LOCALE, localePath, type SiteLocale } from "@/lib/i18n";

/**
 * Til prefiksini o'zi qo'shadigan `Link`.
 *
 * `/ru/portfolio` sahifasidagi `href="/portfolio/kiias"` prefiksni yo'qotib,
 * odamni o'zbekchaga qaytarib yuborardi — va buni har bir havolada qo'lda
 * yozish o'ttizga yaqin joyni to'g'irlash va bittasini unutish degani.
 *
 * Til context orqali keladi: `LocaleProvider` sayt layout'ida bir marta
 * o'rnatiladi. Server komponentlar ham buni ishlatadi — client komponent
 * bo'lsa ham, u faqat `href` ni hisoblaydi.
 */
const LocaleContext = createContext<SiteLocale>(DEFAULT_LOCALE);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: SiteLocale;
  children: React.ReactNode;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);

export default function LocaleLink({ href, ...rest }: ComponentProps<typeof Link>) {
  const locale = useLocale();
  return <Link href={typeof href === "string" ? localePath(locale, href) : href} {...rest} />;
}
