import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import BlogFilterGrid from "@/components/BlogFilterGrid";
import { getAllPosts, getBlogCategories } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Dizayn, brending va raqamli mahsulotlar haqida fikrlarimiz.",
};

export default function BlogPage() {
  const posts = getAllPosts();
  const categories = getBlogCategories();
  return (
    <div className="px-[16px] pt-[120px]">
      <SectionHeading kicker="Fikrlar">Blog</SectionHeading>
      <BlogFilterGrid posts={posts} categories={categories} />
    </div>
  );
}
