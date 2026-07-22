"use client";

import { useEffect, useRef, useState } from "react";

/** Dizayn tizimiga mos custom select — qiymat hidden input orqali formaga tushadi. */
export default function Select({
  name,
  placeholder,
  options,
  invalid,
}: {
  name: string;
  placeholder: string;
  options: readonly string[];
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={invalid}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between border-0 border-b border-graphite bg-transparent py-[16px] text-left focus:border-bone-white focus:outline-none"
      >
        <span className={value ? "text-bone-white" : "text-fog-gray"}>
          {value || placeholder}
        </span>
        <span
          aria-hidden
          className={`text-fog-gray transition-transform ${open ? "rotate-180" : ""}`}
        >
          ↓
        </span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute inset-x-0 top-full z-20 max-h-[320px] overflow-y-auto border border-graphite bg-pure-black"
        >
          {options.map((o) => (
            <li key={o}>
              <button
                type="button"
                role="option"
                aria-selected={o === value}
                onClick={() => {
                  setValue(o);
                  setOpen(false);
                }}
                className={`w-full cursor-pointer px-[16px] py-[12px] text-left transition-colors hover:bg-soft-black ${
                  o === value ? "text-bone-white" : "text-fog-gray"
                } hover:text-bone-white`}
              >
                {o}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
