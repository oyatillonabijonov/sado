"use client";

import { useState } from "react";
import BlogCard from "@/components/BlogCard";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import type { PostMeta } from "@/lib/blog";

export default function BlogFilterGrid({
  posts,
  categories,
}: {
  posts: PostMeta[];
  categories: string[];
}) {
  const [active, setActive] = useState<string>("Barchasi");
  const shown =
    active === "Barchasi" ? posts : posts.filter((p) => p.category === active);
  return (
    <div>
      <div className="mb-[48px] flex flex-wrap gap-[16px]">
        {["Barchasi", ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`cursor-pointer ${
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
