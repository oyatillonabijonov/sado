import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  // nodemailer Node'ning `child_process` va `dns` modullarini talab qiladi va
  // bundlerga tushsa build yiqiladi. U faqat serverda, parol tiklash xatini
  // yuborishda ishlaydi — shuning uchun bundle'dan tashqarida qoladi.
  serverExternalPackages: ["nodemailer"],
};

export default withPayload(nextConfig);
