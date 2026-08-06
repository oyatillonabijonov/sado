import type { Metadata } from 'next';
import { DM_Sans, Onest } from 'next/font/google';
import './panel.css';

/**
 * The panel's own root layout, alongside whatever roots the site already has.
 *
 * It is a separate root on purpose: the panel has one audience and one
 * language, and it must not mount the site's header, footer, smooth scrolling
 * or motion provider. If the host site is localized, its middleware matcher
 * has to exclude `panel` too, or `/panel` redirects to `/<locale>/panel` and
 * the route is lost.
 *
 * The fonts are declared again here because a root layout does not inherit the
 * `<html>` class of any other root. Swap them for the client's.
 */

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
});

// Cyrillic: DM Sans has none, and these panels are usually run in Uzbek or
// Russian. Drop this if the client's language is Latin-only.
const onest = Onest({
  subsets: ['cyrillic', 'cyrillic-ext', 'latin'],
  weight: ['400', '500'],
  variable: '--font-onest',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Boshqaruv',
  // Behind a login, and with nothing to offer a crawler.
  robots: { index: false, follow: false },
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${dmSans.variable} ${onest.variable}`}>
      <body className="min-h-dvh bg-white font-sans text-obsidian antialiased">{children}</body>
    </html>
  );
}
