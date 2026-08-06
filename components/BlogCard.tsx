import Image from "next/image";
import Link from "next/link";
import type { PostMeta } from "@/lib/blog";

export default function BlogCard({ post }: { post: PostMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[10px] bg-soft-black">
        <Image
          src={post.cover}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-opacity duration-300 group-hover:opacity-80"
        />
      </div>
      <div className="pt-[16px]">
        <p className="text-fog-gray">
          {post.category} — {post.date}
        </p>
        <p className="mt-[8px] text-subheading text-bone-white">{post.title}</p>
        <p className="mt-[8px] text-fog-gray">{post.description}</p>
      </div>
    </Link>
  );
}
