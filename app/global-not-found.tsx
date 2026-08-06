import SiteLayout from "./(site)/layout";
import NotFound from "./(site)/not-found";

/* Ikkita root layout bor (sayt va panel), shuning uchun mos kelmagan URL'lar
 * uchun Next'ning zavod 404'i chiqadi. Bu fayl uni sayt 404'i bilan almashtiradi —
 * to'liq hujjatni sayt layout'ining o'zi qaytaradi, nusxa ko'chirilmaydi. */
export const metadata = { title: "404" };

export default function GlobalNotFound() {
  return (
    <SiteLayout>
      <NotFound />
    </SiteLayout>
  );
}
