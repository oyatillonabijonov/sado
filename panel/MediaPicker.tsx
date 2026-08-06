'use client';

import { useState } from 'react';

export type MediaOption = { id: number; label: string; url: string };

/**
 * Pick a picture that is already uploaded.
 *
 * Uploading happens on its own screen ("Rasmlar"), not here, and that is a
 * deliberate split: a file input inside a content form means either a nested
 * form (invalid HTML) or a mid-edit page reload that throws away everything
 * typed so far. Picking from what exists is one `<select>` and cannot lose work.
 */
export function MediaPicker({
  label,
  hint,
  name,
  options,
  defaultValue,
  required,
}: {
  label: string;
  hint?: string;
  name: string;
  options: MediaOption[];
  defaultValue?: number | null;
  required?: boolean;
}) {
  const [value, setValue] = useState<string>(defaultValue ? String(defaultValue) : '');
  const selected = options.find((o) => String(o.id) === value);

  return (
    <div className="flex flex-col gap-2">
      <span className="flex flex-col gap-1">
        <span className="text-body">
          {label}
          {required && <span className="text-pebble"> *</span>}
        </span>
        {hint && <span className="text-body-sm text-driftwood">{hint}</span>}
      </span>

      <div className="flex items-center gap-4">
        <div className="size-20 shrink-0 overflow-hidden rounded-card border border-mist bg-white">
          {selected ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selected.url} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-body-sm text-driftwood">
              —
            </span>
          )}
        </div>

        <select
          name={name}
          value={value}
          required={required}
          onChange={(e) => setValue(e.target.value)}
          className="min-h-14 w-full appearance-none rounded-pill border border-mist bg-white px-5 text-body outline-none transition-colors hover:border-pebble focus:border-obsidian"
        >
          <option value="">Rasm tanlanmagan</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
