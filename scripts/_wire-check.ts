import { getPayload } from "payload";
import config from "@payload-config";

const payload = await getPayload({ config });
const marker = "SINOV — " + "avtomatik tekshiruv";

const before = await payload.findGlobal({ slug: "settings" });
const beforeEmail = (before as { contact?: { email?: string } }).contact?.email ?? "";

await payload.updateGlobal({
  slug: "settings",
  data: {
    contact: { email: "sinov@example.uz", phone: "+998 71 000 00 00", address: marker },
    hero: { kicker: "SINOV kicker", heading: "SINOV sarlavha" },
  } as never,
});
console.log("qo'yildi. Endi saytni tekshiring.");
console.log("TIKLASH_UCHUN_EMAIL=" + beforeEmail);
process.exit(0);
