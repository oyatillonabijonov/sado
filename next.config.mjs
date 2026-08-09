import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  // nodemailer Node'ning `child_process` va `dns` modullarini talab qiladi va
  // bundlerga tushsa build yiqiladi. U faqat serverda, parol tiklash xatini
  // yuborishda ishlaydi — shuning uchun bundle'dan tashqarida qoladi.
  serverExternalPackages: ["nodemailer"],

  /**
   * Xavfsizlik sarlavhalari — hammasi bir joyda, Traefik'da emas: proxy
   * o'zgarsa ham sayt o'zi bilan olib yuradi.
   *
   * ponytail: CSP faqat `frame-ancestors`. To'liq XSS siyosati har bir
   * so'rovga nonce talab qiladi (`app/(site)/layout.tsx` dagi FOUC skripti
   * va Next'ning o'z bootstrap'i inline) — bu middleware degani, alohida
   * ish. Hozirgisi clickjacking'ni yopadi, XSS'ni emas.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // includeSubDomains xavfsiz: apex va www dan boshqa subdomen yo'q,
          // ikkalasida ham Let's Encrypt. `preload` ataylab yo'q — u
          // hstspreload.org ro'yxatiga tushgach qaytarib bo'lmaydi.
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
        ],
      },
    ];
  },
};

export default withPayload(nextConfig);
