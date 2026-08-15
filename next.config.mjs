import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  // nodemailer Node'ning `child_process` va `dns` modullarini talab qiladi va
  // bundlerga tushsa build yiqiladi. U faqat serverda, parol tiklash xatini
  // yuborishda ishlaydi — shuning uchun bundle'dan tashqarida qoladi.
  serverExternalPackages: ["nodemailer"],

  /**
   * `/_next/image` keshi. Next'ning zavod qiymati 4 soat; kontent kam
   * o'zgargani uchun bir hafta serverdagi qayta optimizatsiyani sezilarli
   * kamaytiradi. Rasm almashsa URL'dagi `url=` ham o'zgaradi, ya'ni eski
   * kesh yozuvi ishlatilmaydi.
   */
  images: { minimumCacheTTL: 604800 },

  /**
   * `www` → apex, 301 bilan.
   *
   * Ilgari redirect umuman yo'q edi va `www.sado.agency` to'liq saytni 200
   * bilan qaytarardi: bitta sayt ikkita manzilda yashab, havola og'irligi
   * ikkiga bo'linardi. `canonical` buni yumshatgan, lekin almashtirmaydi.
   */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.sado.agency" }],
        destination: "https://sado.agency/:path*",
        permanent: true,
      },
    ];
  },

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
      /**
       * `public/` dagi rasmlar keshi.
       *
       * Next bu fayllarga zavod bo'yicha `public, max-age=0` beradi — nomlari
       * hashlanmagani uchun. Natijada mijoz logolari, OG rasmi va favicon har
       * tashrifda qaytadan yuklanardi.
       *
       * Bir hafta, `immutable` EMAS: fayl nomi o'zgarmasdan mazmuni
       * almashishi mumkin (logo yangilandi, OG qayta chizildi) va `immutable`
       * da brauzer muddat tugagunicha qayta so'ramaydi ham. Bir hafta —
       * takroriy tashrifda foyda beradigan, lekin almashtirishni haddan
       * tashqari uzoq kutdirmaydigan oraliq.
       */
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
    ];
  },
};

export default withPayload(nextConfig);
