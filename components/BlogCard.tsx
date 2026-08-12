import Image from "next/image";
import Link from "next/link";
import type { PostMeta } from "@/lib/blog";

export default function BlogCard({ post }: { post: PostMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      {/* 16:9 — maqola sahifasidagi muqova bilan bir xil, va `Media` dagi
          `wide` (1600×900) hosilasi ham aynan shu nisbatda. Ilgari bu karta
          4:3, maqola sahifasi esa mobilda 4:3, desktopda 21:9 edi: bitta
          rasm uch xil kesilib, mijoz yuklaganini uchta joyda uch xil
          qirqilgan holda ko'rardi. */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[10px] bg-soft-black">
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
