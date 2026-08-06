'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/panel/session-actions';
import { ArticleIcon, ImageIcon, InboxIcon, LayersIcon, TagIcon } from '@/panel/nav-icons';

/**
 * The rail, on obsidian.
 *
 * The dark bar is the one place the panel and the public site disagree on
 * purpose. It separates the tool's chrome from the document being edited, so a
 * white editing column reads as paper on a desk rather than as one more region
 * of the same white page.
 *
 * **Every label is a plain noun for a thing on the site** — no collection
 * slugs, no English, no "Content" header. Order by how often the client touches
 * it, not by how the database is arranged. This is the whole reason the panel
 * exists instead of Payload's own admin; if you find yourself writing "Posts"
 * or "Media" here, you are rebuilding the thing you replaced.
 *
 * `GROUPS` is the file you edit per project. Add a row per screen; borrow an
 * icon from `nav-icons.tsx` or draw one there at 20×20 / 1.5px stroke.
 */
const GROUPS = [
  {
    label: null,
    items: [{ href: '/panel', label: 'Boshqaruv', Icon: InboxIcon }],
  },
  {
    label: 'Sayt',
    items: [
      { href: '/panel/loyihalar', label: 'Loyihalar', Icon: LayersIcon },
      { href: '/panel/xizmatlar', label: 'Xizmatlar', Icon: TagIcon },
      { href: '/panel/maqolalar', label: 'Maqolalar', Icon: ArticleIcon },
      { href: '/panel/rasmlar', label: 'Rasmlar', Icon: ImageIcon },
    ],
  },
] as const;

export function Nav({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col gap-8 bg-obsidian p-5 text-white lg:p-6">
      {/* Swap for the client's wordmark. If theirs is a dark single-colour
          file, `invert` it here rather than shipping a second copy in white. */}
      <Link href="/panel" className="px-2 pt-1 text-body">
        Boshqaruv
      </Link>

      <div className="flex flex-1 flex-col gap-7">
        {GROUPS.map((group, g) => (
          <div key={g} className="flex flex-col gap-1">
            {group.label && (
              <span className="px-3 pb-2 text-body-sm text-white/40">{group.label}</span>
            )}
            {group.items.map(({ href, label, Icon }) => {
              // Exact match for the root, prefix match for the rest — otherwise
              // the landing row stays lit on every screen in the panel.
              const active = href === '/panel' ? pathname === '/panel' : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-pill px-3 py-2.5 text-body transition-colors duration-200 ease-fluid ${
                    active
                      ? 'bg-white text-obsidian'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="shrink-0">
                    <Icon />
                  </span>
                  <span className="flex-1">{label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-white/15 px-3 pt-5">
        <Link
          href="/panel/hisob"
          className={`truncate text-body-sm transition-colors ${
            pathname.startsWith('/panel/hisob') ? 'text-white' : 'text-white/40 hover:text-white'
          }`}
        >
          {email}
        </Link>
        <div className="flex items-center gap-5">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="text-body-sm text-white/60 transition-colors hover:text-white"
          >
            Sayt ↗
          </a>
          <form action={signOut}>
            <button
              type="submit"
              className="text-body-sm text-white/60 transition-colors hover:text-white"
            >
              Chiqish
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
