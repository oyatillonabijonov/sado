#!/bin/sh
set -e

# Bazani tayyorlaydi: bo'sh volume'ga sxemani ko'chiradi yoki eskirgan (lekin
# bo'sh) bazani yangi sxema bilan almashtiradi. bun:sqlite bilan — payload
# import qilinmaydi, shuning uchun konteynerda ishonchli ishlaydi.
bun /app/scripts/db-ensure.ts

exec bun run start
