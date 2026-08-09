"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * `object-cover` rasmni oynani to'ldirguncha kattalashtiradi, ya'ni kerakli
 * kenglik oynanikidan katta bo'ladi. `100vw` desa brauzer aynan oyna
 * kengligidagi variantni yuklaydi va u cho'zilib bulanadi — o'lchangan: 375px
 * variant 894px ga cho'zilardi. 115vw hero nisbatlari uchun shu farqni yopadi.
 */
const SIZES = "115vw";

/**
 * Hero orqa fon — rasmlar 3 soniyada almashib crossfade bo'ladi.
 *
 * Rasm soni paneldan keladi, shuning uchun JS: qat'iy N-kadrli CSS loop
 * yaramaydi. SSR'da birinchi rasm ko'rinadi (opacity 1), JS'siz ham bo'sh
 * chiqmaydi. `prefers-reduced-motion`da almashinuv yo'q.
 *
 * **Telefon uchun alohida kadr.** Telefon ekrani ~1:2, hero rasmlari 16:9 —
 * `object-cover` bilan kadrning atigi ~28% ko'rinardi va kompozitsiya
 * yo'qolardi. Balandlikni kamaytirish buni hal qilmadi (42% gacha ko'tarildi,
 * evaziga hero to'liq ekran bo'lmay qoldi), shuning uchun tik kadr: mijoz
 * paneldan yuklaydi, `<picture>` uni 768px dan tor ekranda ko'rsatadi.
 *
 * `<picture>` + `getImageProps`, ikkita `<Image>` emas: `display:none` bilan
 * yashirilgan rasmni ham brauzer yuklaydi, ya'ni telefon ikkala kadrni ham
 * tortardi. `<source media>` bilan faqat bittasi ketadi.
 *
 * Yana ikki qoida buzilmasin:
 * 1. Faqat **birinchi kadr** darrov yuklanadi, qolganlari u chizilgach mount
 *    bo'ladi — beshtasi barobar yuklanganda LCP rasm bandwidth talashardi.
 * 2. Manba fayllar WebP: `next/image` baribir siqadi, lekin og'ir manba
 *    Docker image'ni va har bir sovuq optimizatsiyani qimmatlashtiradi.
 */
export default function HeroSlideshow({
  images,
  imagesMobile,
}: {
  images: string[];
  imagesMobile: string[];
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [rest, setRest] = useState(false);
  const first = useRef<HTMLImageElement>(null);
  const shown = rest ? images : images.slice(0, 1);

  /*
   * Qolgan kadrlar birinchisi yuklangach mount bo'ladi — lekin buni `onLoad`
   * bilan kutib bo'lmaydi.
   *
   * React `onLoad` ni faqat hydration paytida ulaydi. Rasm undan oldin
   * yuklanib bo'lsa `load` hodisasi allaqachon o'tib ketgan bo'ladi va handler
   * hech qachon chaqirilmaydi: `rest` `false` bo'lib qoladi, ikkinchi kadr
   * mount bo'lmaydi, interval boshlanmaydi — hero birinchi rasmda muzlab
   * qoladi. Dev'da ko'rinmaydi (rasm sekin optimizatsiya qilinadi, hydration
   * ulguradi), prodda esa odatiy hol: HTML tez keladi, LCP kadri `priority`
   * bilan preload qilinadi va takroriy tashrifda u keshdan chiqadi.
   *
   * Shuning uchun holat hodisadan emas, `img.complete` dan o'qiladi.
   * `error` ham tinglanadi: bitta rasm yuklanmagani butun slayd-shouni
   * o'ldirmasin.
   */
  useEffect(() => {
    if (reduce) return;
    const img = first.current;
    if (!img) return;
    if (img.complete) {
      setRest(true);
      return;
    }
    const arm = () => setRest(true);
    img.addEventListener("load", arm);
    img.addEventListener("error", arm);
    return () => {
      img.removeEventListener("load", arm);
      img.removeEventListener("error", arm);
    };
  }, [reduce]);

  useEffect(() => {
    if (reduce || !rest || images.length <= 1) return;
    const id = setInterval(() => setActive((a) => (a + 1) % images.length), 3000);
    return () => clearInterval(id);
  }, [reduce, rest, images.length]);

  return (
    <>
      {shown.map((src, i) => {
        const { props: desktop } = getImageProps({
          src,
          alt: "",
          fill: true,
          sizes: SIZES,
          priority: i === 0,
        });

        /* Tik kadrlar tartibi desktop bilan bir xil deb olinadi. Mijoz
           to'rttadan uchtasini yuklasa qolgani desktop kadrida qoladi —
           yarim to'ldirilgan holat ham buzilmasin. */
        const mobileSrc = imagesMobile[i];
        const mobile = mobileSrc
          ? getImageProps({ src: mobileSrc, alt: "", fill: true, sizes: SIZES, priority: i === 0 })
          : null;

        return (
          <picture key={`${src}-${i}`}>
            {mobile && (
              <source
                media="(max-width: 767px)"
                srcSet={mobile.props.srcSet}
                sizes={mobile.props.sizes}
              />
            )}
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <img
              {...desktop}
              aria-hidden
              ref={i === 0 ? first : undefined}
              className="object-cover transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ ...desktop.style, opacity: i === active ? 1 : 0 }}
            />
          </picture>
        );
      })}
    </>
  );
}
