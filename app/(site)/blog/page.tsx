import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { currentLocale } from "@/lib/locale";
import SectionHeading from "@/components/SectionHeading";
import BlogFilterGrid from "@/components/BlogFilterGrid";
import EmptyState from "@/components/EmptyState";
import { getAllPosts, getBlogCategories } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Dizayn, brending va raqamli mahsulotlar haqida fikrlarimiz.",
};

export default async function BlogPage() {
  const m = messages(await currentLocale());
  const [posts, categories] = await Promise.all([getAllPosts(), getBlogCategories()]);
  return (
    <div className="shell pt-[48px]">
      <SectionHeading kicker={m["blog.kicker"]}>{m["blog.title"]}</SectionHeading>
      {posts.length === 0 ? (
        <EmptyState
          title={m["blog.empty"]}
          hint={m["blog.lead"]}
          action={{ href: "/about#aloqa", label: m["common.contact"] }}
        />
      ) : (
        <BlogFilterGrid posts={posts} categories={categories} m={m} />
      )}
    </div>
  );
}
