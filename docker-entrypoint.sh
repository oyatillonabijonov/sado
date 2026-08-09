#!/bin/sh
set -e

# Baza doimiy volume'da (/app/data). Birinchi ishga tushishda volume bo'sh
# bo'ladi — image ichidagi sxema-only nusxani ko'chiramiz, shunda Payload
# tayyor jadvallar bilan ishga tushadi. Keyingi ishga tushishlarda baza bor,
# tegilmaydi (mijoz kiritgan kontent saqlanadi).
#
# Prodda Payload sxemani o'zi push qilmaydi (NODE_ENV=production), shuning
# uchun sxema shu yerdan keladi. Kolleksiya o'zgarsa: schema.sqlite ni qayta
# generatsiya qiling va yangi deploy'da mavjud volume uchun migratsiya bering.
if [ ! -f /app/data/db.sqlite ]; then
  echo "[entrypoint] Bo'sh volume — sxema ko'chirilmoqda: /app/data/db.sqlite"
  cp /app/schema.sqlite /app/data/db.sqlite
fi

exec bun run start
