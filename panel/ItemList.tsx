'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import type { CollectionSlug } from 'payload';
import { moveItem } from '@/panel/collection-actions';

export type ListItem = {
  id: number;
  href: string;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  meta?: string | null;
  image?: string | null;
  /** A logo is a mark on transparency and must not be cropped like a photo. */
  contain?: boolean;
};

/**
 * Every list in the panel. A row identifies one thing and offers exactly two
 * actions: open it, or move it one place. There is no inline editing, no
 * checkbox column, no bulk bar and no search — with six projects and five
 * services, all three would be furniture.
 *
 * The row is one big link with the controls floated on top, rather than a link
 * *inside* a row: the whole strip is the target, which is what makes a list
 * feel like an application instead of a table with a hyperlink in it.
 */
export function ItemList({ collection, items }: { collection: CollectionSlug; items: ListItem[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={item.id} className="group relative">
          <Link
            href={item.href}
            className="flex items-center gap-5 rounded-card border border-mist p-3 pr-32 transition-colors duration-200 ease-fluid hover:border-obsidian lg:p-4 lg:pr-40"
          >
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-card bg-mist/30 lg:size-20">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt=""
                  className={
                    item.contain
                      ? 'max-h-10 max-w-14 object-contain'
                      : 'size-full object-cover transition-transform duration-700 ease-fluid group-hover:scale-105'
                  }
                />
              ) : (
                <span className="text-body-sm text-driftwood">—</span>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-1">
              <span className="truncate text-body-lg">{item.title}</span>
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm text-driftwood">
                {item.subtitle && <span className="truncate">{item.subtitle}</span>}
                {item.meta && <span>{item.meta}</span>}
              </span>
            </div>
          </Link>

          {/* Absolutely positioned so the row underneath stays one link. */}
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-3 lg:right-4">
            {item.badge && (
              <span className="hidden rounded-pill border border-mist px-3 py-1.5 text-body-sm text-pebble sm:inline">
                {item.badge}
              </span>
            )}
            <MoveButtons
              collection={collection}
              id={item.id}
              first={i === 0}
              last={i === items.length - 1}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function MoveButtons({
  collection,
  id,
  first,
  last,
}: {
  collection: CollectionSlug;
  id: number;
  first: boolean;
  last: boolean;
}) {
  const [pending, start] = useTransition();
  const move = (direction: 'up' | 'down') => start(() => void moveItem(collection, id, direction));

  return (
    <div className="pointer-events-auto flex items-center gap-1">
      <Arrow label="Yuqoriga" disabled={first || pending} onClick={() => move('up')}>
        ↑
      </Arrow>
      <Arrow label="Pastga" disabled={last || pending} onClick={() => move('down')}>
        ↓
      </Arrow>
    </div>
  );
}

function Arrow({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-10 items-center justify-center rounded-pill border border-mist bg-white text-body-sm text-pebble transition-colors hover:border-obsidian hover:text-obsidian disabled:border-mist/60 disabled:text-mist"
    >
      {children}
    </button>
  );
}
