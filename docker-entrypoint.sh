#!/bin/sh
set -e

# Bazani tayyorlaydi: bo'sh volume'ga sxemani ko'chiradi, yangi jadval va
# ustunlarni qo'shadi. bun:sqlite bilan — payload import qilinmaydi, shuning
# uchun konteynerda ishonchli ishlaydi.
bun /app/scripts/db-ensure.ts

# Lokalizatsiya qo'shilganda mavjud kontentni `<jadval>_locales` ga ko'chiradi.
# Bir marta ishlaydi, keyin har ishga tushishda jim o'tadi. `db-ensure` dan
# KEYIN: u avval `_locales` jadvallarini yaratishi kerak.
bun /app/scripts/migrate-locales.ts

exec bun run start
