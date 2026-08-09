# SADO — Next.js 16 + Payload + bun. Coolify shu Dockerfile bilan quradi.
FROM oven/bun:1.3

WORKDIR /app

# Bog'liqliklar avval: kod o'zgarganda ham bu qatlam kesh'dan olinadi.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# Payload sxemasini va tiplarni build'dan OLDIN yaratamiz.
# Sabab: `next build` sahifalarni 9 ta ishchi bilan parallel quradi va ular
# birinchi getPayload'da sxemani bir vaqtda push qilsa, SQLite qulflanib qoladi.
# generate:types Payload'ni bir marta init qiladi (sxemani ./db.sqlite ga push
# qiladi) va payload-types.ts ni yozadi — build'gacha hammasi tayyor bo'ladi.
# Bu build-context bazasi image ichida qoladi, prod esa /app/data volume'ini
# ishlatadi (DATABASE_URI), shuning uchun bir-biriga xalaqit bermaydi.
RUN bunx payload generate:types
RUN bun run build

ENV NODE_ENV=production
ENV PORT=3000

# Baza va yuklangan rasmlar doimiy volume'larda (Coolify persistent storage).
RUN mkdir -p /app/data /app/media

EXPOSE 3000
CMD ["bun", "run", "start"]
