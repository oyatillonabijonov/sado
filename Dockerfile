# SADO — Next.js 16 + Payload + bun. Coolify shu Dockerfile bilan quradi.
FROM oven/bun:1.3

WORKDIR /app

# Bog'liqliklar avval: kod o'zgarganda ham bu qatlam kesh'dan olinadi.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# Sxema-only SQLite (schema.sqlite) repoda commit qilingan. Payload'ni prodda
# (NODE_ENV=production) sxema push qilmaydi va uni konteynerda Next'dan tashqarida
# ishga tushirib bo'lmaydi (bun ostida payload CLI/tsx va lexical yiqiladi) —
# shuning uchun sxema shu tayyor fayldan keladi.
#
# Build paytida SSG sahifalar Payload'ni init qilib bazani o'qiydi; shuning
# uchun sxemani ./db.sqlite ga qo'yamiz (so'rovlar bo'sh natija qaytaradi).
# PAYLOAD_DISABLE_PUSH=1 — push urinmaydi; PAYLOAD_SECRET faqat shu build RUN
# doirasida (runtime'da Coolify haqiqiysini beradi, image ENV'iga saqlanmaydi).
# Eslatma: `bun run build` Next 16 build TUGAGACH SIGTRAP (exit 133) bilan
# chiqadi — bu bun'ning chiqishdagi ma'lum krashi, artefaktlar to'liq tayyor
# bo'ladi. Shuning uchun chiqish kodini e'tiborsiz qoldirib, haqiqiy muvaffaqiyat
# belgisini — `.next/BUILD_ID` mavjudligini — tekshiramiz. Build chindan yiqilsa
# BUILD_ID bo'lmaydi va RUN xato beradi.
RUN cp schema.sqlite db.sqlite \
 && { PAYLOAD_SECRET=build-only-placeholder PAYLOAD_DISABLE_PUSH=1 bun run build || true; } \
 && test -f .next/BUILD_ID

ENV NODE_ENV=production
ENV PORT=3000
# Runtime'da ham push o'chiq — sxema volume'dagi bazadan (entrypoint ko'chiradi).
ENV PAYLOAD_DISABLE_PUSH=1

# Baza va yuklangan rasmlar doimiy volume'larda (Coolify persistent storage).
RUN mkdir -p /app/data /app/media

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
