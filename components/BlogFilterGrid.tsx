"use client";

import { useState } from "react";
import type { Messages } from "@/lib/i18n";
import BlogCard from "@/components/BlogCard";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import type { PostMeta } from "@/lib/blog";

export default function BlogFilterGrid({
  posts,
  categories, m }: {
  posts: PostMeta[];
  categories: string[]; m: Messages }) {
  const ALL = m["blog.all"];
  const [active, setActive] = useState<string>(ALL);
  const shown =
    active === ALL ? posts : posts.filter((p) => p.category === active);
  return (
    <div>
      {/* Portfolio filtri bilan bir xil mexanika: mobilda o'ralmaydi, chetdan
          chetgacha suriladi. `tap` esa 26px balandlikdagi matn havolasini
          barmoq uchun 44px ga yetkazadi. Ko'rinish desktopda o'zgarmaydi. */}
      <div className="no-scrollbar mb-[48px] flex gap-[16px] max-md:-mx-[var(--gutter)] max-md:overflow-x-auto max-md:px-[var(--gutter)] md:flex-wrap">
        {[ALL, ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`tap shrink-0 cursor-pointer ${
              active === c ? "text-bone-white" : "text-fog-gray hover:text-bone-white"
            }`}
          >
            {active === c && (
              <span aria-hidden className="mr-[8px] inline-block size-[6px] rounded-full bg-scarlet-signal align-middle" />
            )}
            {c}
          </button>
        ))}
      </div>
      <Stagger key={active} className="grid gap-[16px] md:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => (
          <StaggerItem key={p.slug}>
            <BlogCard post={p} />
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
