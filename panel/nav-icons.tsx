/**
 * The eight nav icons, drawn here rather than installed.
 *
 * A pack (lucide, heroicons) is ~1MB of components to render eight glyphs that
 * never change, and every pack has its own stroke weight and grid that then has
 * to be argued with. These are 20×20, 1.5px stroke, `currentColor`, and match
 * the site's own line weight — the same reasoning as `src/components/Icons.tsx`.
 */

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

/** Arizalar — an inbox tray. */
export const InboxIcon = () => (
  <svg {...base}>
    <path d="M2.5 12.5h3l1 2h7l1-2h3" />
    <path d="M4.2 3.5h11.6l1.7 9v4H2.5v-4z" />
  </svg>
);

/** Bosh sahifa — a house. */
export const HomeIcon = () => (
  <svg {...base}>
    <path d="M3 8.2 10 2.5l7 5.7" />
    <path d="M4.5 9.4V17h11V9.4" />
    <path d="M8 17v-4.5h4V17" />
  </svg>
);

/** Loyihalar — stacked layers. */
export const LayersIcon = () => (
  <svg {...base}>
    <path d="M10 2.5 2.5 6.2 10 10l7.5-3.8z" />
    <path d="m2.5 10.4 7.5 3.8 7.5-3.8" />
    <path d="m2.5 14.2 7.5 3.8 7.5-3.8" />
  </svg>
);

/** Maqolalar — a page with lines of text. */
export const ArticleIcon = () => (
  <svg {...base}>
    <path d="M4 2.5h8l4 4v11H4z" />
    <path d="M12 2.5v4h4" />
    <path d="M6.8 10h6.4M6.8 13h6.4" />
  </svg>
);

/** Xizmatlar — a price-tag / offer. */
export const TagIcon = () => (
  <svg {...base}>
    <path d="M10.3 2.5H17.5v7.2L9.6 17.6a1.4 1.4 0 0 1-2 0l-5.2-5.2a1.4 1.4 0 0 1 0-2z" />
    <circle cx="13.8" cy="6.2" r="1.1" />
  </svg>
);

/** Mijozlar — a building. */
export const BuildingIcon = () => (
  <svg {...base}>
    <path d="M3.5 17.5v-13a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v13" />
    <path d="M13.5 8.5h1a2 2 0 0 1 2 2v7" />
    <path d="M2 17.5h16M6.8 6h3.4M6.8 9.5h3.4M6.8 13h3.4" />
  </svg>
);

/** Jamoa — two people. */
export const PeopleIcon = () => (
  <svg {...base}>
    <circle cx="7.8" cy="6.5" r="2.8" />
    <path d="M2.5 17c0-2.9 2.4-5.2 5.3-5.2S13 14.1 13 17" />
    <path d="M13.2 4.2a2.8 2.8 0 0 1 0 5.4M14.4 11.9c1.9.5 3.1 2.2 3.1 4.2" />
  </svg>
);

/** Rasmlar — a picture. */
export const ImageIcon = () => (
  <svg {...base}>
    <rect x="2.5" y="3.5" width="15" height="13" rx="2" />
    <circle cx="7" cy="8" r="1.3" />
    <path d="m3.2 14.4 3.9-3.6a1.4 1.4 0 0 1 1.9 0l3 2.8" />
    <path d="m11.6 12.3 1.7-1.5a1.4 1.4 0 0 1 1.9 0l2.1 1.9" />
  </svg>
);
