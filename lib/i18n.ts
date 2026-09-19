/**
 * Sayt interfeysining matnlari.
 *
 * Direktivasiz va Payload'ga tegmaydi — ataylab: `Header`, `ContactForm`,
 * `Select` va `Stats` client komponent, ular bu yerdan **qiymat** import
 * qiladi (`lib/settings.ts` dan qilib bo'lmaydi, u sharp va nodemailer'ni
 * tortadi).
 *
 * Kontent (loyiha, xizmat, maqola matni) bu yerda emas — u Payload'da va
 * paneldan tarjima qilinadi. Bu yerda faqat saytning o'z chizig'i: tugmalar,
 * seksiya sarlavhalari, forma yorliqlari, bo'sh holatlar.
 *
 * Kalit yo'q bo'lsa o'zbekchasi qaytadi (`t` dagi `?? uz[key]`) — tarjima
 * unutilgan joy bo'sh emas, o'zbekcha bo'lib chiqadi.
 */

export const SITE_LOCALES = [
  { code: "uz", label: "O‘zbekcha", short: "UZ" },
  { code: "ru", label: "Русский", short: "RU" },
] as const;

export type SiteLocale = (typeof SITE_LOCALES)[number]["code"];

export const DEFAULT_LOCALE: SiteLocale = "uz";

export const isSiteLocale = (v: unknown): v is SiteLocale =>
  SITE_LOCALES.some((l) => l.code === v);

/**
 * Manzilga til prefiksi. Asosiy tilda prefiks yo'q — saytdagi URL'lar
 * indekslangan va ular o'zgarmasligi kerak.
 */
export function localePath(locale: SiteLocale, href: string): string {
  if (locale === DEFAULT_LOCALE) return href;
  if (!href.startsWith("/")) return href; // tashqi havola yoki mailto:
  return href === "/" ? "/ru" : `/ru${href}`;
}

/** Prefiksni olib tashlaydi — `hreflang` juftligini qurish uchun. */
export const stripLocale = (path: string): string =>
  path === "/ru" ? "/" : path.startsWith("/ru/") ? path.slice(3) : path;

const uz = {
  // navigatsiya va chrome
  "nav.portfolio": "Portfolio",
  "nav.services": "Xizmatlar",
  "nav.about": "Biz haqimizda",
  "nav.blog": "Blog",
  "nav.menu": "Menyu",
  "nav.close": "Menyuni yopish",
  "nav.theme": "Yorug'/qorong'i rejimni almashtirish",
  "nav.language": "Sayt tili",

  // bosh sahifa
  "home.works.kicker": "Ishlar",
  "home.works.title": "Ishlarimiz",
  "home.works.all": "Barcha ishlar",
  "home.services.kicker": "Xizmatlar",
  "home.services.lead":
    "Har bir loyiha strategiyadan boshlanadi va yaxlit vizual tizim bilan tugaydi.",
  "home.trust.kicker": "Ishonch",
  "home.clients": "Bizga 50+ kompaniyalar ishonch bildirgan",
  "home.testimonials.lead":
    "Uch yildan beri birga ishlayotgan mijozlarimiz bor — quyidagilar ularning o'z so'zlari.",
  "home.blog.kicker": "Fikrlar",
  "home.blog.all": "Barcha maqolalar",

  // portfolio
  "portfolio.kicker": "Ishlar",
  "portfolio.empty": "Ishlar tez orada shu yerda bo'ladi.",
  "portfolio.empty.hint":
    "Birinchi loyihalarimizni joylayapmiz. Shu orada bevosita bog'lanishingiz mumkin.",
  "project.brief": "Muammo",
  "project.solution": "Yechim",
  "project.next": "Keyingi loyiha",

  // xizmatlar
  "services.kicker": "Xizmatlar",
  "services.empty": "Xizmatlar ro'yxati yangilanmoqda.",
  "services.unsure": "Qaysi biri kerakligini bilmaysizmi?",
  "services.empty.hint": "Nima kerakligini yozib qoldiring — to'g'ridan-to'g'ri javob beramiz.",

  // biz haqimizda
  "about.kicker": "Agentlik",
  "about.values.kicker": "Qadriyatlar",
  "about.values.title": "Qanday ishlaymiz",
  "about.team.kicker": "Jamoa",
  "about.team.title": "Kim ishlaydi",
  "about.contact.kicker": "Aloqa",

  // blog
  "blog.kicker": "Fikrlar",
  "blog.lead": "Dizayn va brending haqidagi kuzatuvlarimizni shu yerda chop etamiz.",
  "blog.empty": "Birinchi maqola yozilmoqda.",
  "blog.all": "Barchasi",
  "blog.filter": "Kategoriya filtri",
  "blog.related": "Aloqador maqolalar",
  "blog.back": "← Blog",
  "post.category": "Kategoriya",
  "post.author": "Muallif",
  "post.date": "Sana",
  "post.readingTime": "O'qish vaqti",

  // aloqa formasi
  "contact.name": "Ismingiz",
  "contact.email": "Email manzilingiz",
  "contact.service": "Xizmat turi",
  "contact.message": "Vazifangiz haqida",
  "contact.submit": "Yuborish",
  "contact.sending": "Yuborilmoqda…",
  "contact.sent": "Xabaringiz yuborildi.",
  "contact.select": "Tanlang",
  "contact.error": "Yuborib bo'lmadi. Birozdan keyin urinib ko'ring.",

  // futer
  "footer.contact": "Aloqa",
  "footer.socials": "Ijtimoiy tarmoqlar",
  "footer.rights": "Barcha huquqlar himoyalangan",
  "footer.menu": "Menyu",
  "footer.newsletter": "Newsletter",
  "footer.subscribe": "Obuna bo'lish",
  "footer.subscribed": "Rahmat, obuna bo'ldingiz!",

  // sahifa sarlavhalari
  "portfolio.title": "Portfolio",
  "portfolio.lead":
    "Brending, veb, UI/UX va print. Har bir keys strategiyadan yechimgacha bo'lgan yo'lni ko'rsatadi.",
  "services.title": "Nima qilamiz",
  "services.lead":
    "Ko'pincha bularning bir nechtasi bitta loyihada birga ketadi — qaysi biri kerakligini o'zimiz aytamiz.",
  "blog.title": "Blog",
  "about.title": "Biz haqimizda",
  "project.client": "Mijoz",
  "project.year": "Yil",
  "project.categoryLabel": "Kategoriya",
  "project.services": "Xizmatlar",
  "contact.phone": "Telefon",
  "contact.company": "Kompaniya (ixtiyoriy)",

  // umumiy
  "home.works.heading": "So'nggi loyihalar.",
  "home.blog.heading": "Fikrlar va kuzatuvlar.",
  "home.trust.heading": "Bizga ishonganlar.",
  "home.cta.heading": "Loyihangizni muhokama qilamizmi?",
  "home.cta.text":
    "Qisqacha yozib qoldiring — bir ish kuni ichida javob beramiz va birinchi suhbatni belgilaymiz.",
  "services.cta.text":
    "Vazifangizni qisqacha yozing — mos xizmatni o'zimiz aytamiz va taxminiy muddat bilan javob beramiz.",
  "about.contact.text": "Vazifangizni qisqacha yozing — bir ish kuni ichida javob beramiz.",
  "notFound.title": "Bunday sahifa topilmadi.",
  "notFound.back": "Bosh sahifaga qaytish",
  "footer.newsletter.lead": "Yangi loyihalar va fikrlar haqida obuna bo'ling",
  "contact.replyTime": "Bir ish kuni ichida siz bilan bog'lanamiz.",
  "contact.errorLong":
    "Xatolik yuz berdi. Qayta urinib ko'ring yoki bizga to'g'ridan-to'g'ri yozing.",

  "meta.portfolio": "SADO agentligining tanlangan loyihalari — brending, veb, UI/UX va print.",
  "meta.services": "Brend strategiyasi, brend dizayn, veb-dizayn, UI/UX, motion va print — SADO xizmatlari.",
  "meta.about": "SADO — 2018-yildan beri Toshkentda ishlaydigan mustaqil dizayn agentligi.",
  "meta.blog": "Dizayn, brending va raqamli mahsulotlar haqida fikrlarimiz.",
  // Panel bo'sh bo'lgandagi standart hero matni — u ham tarjima qilinadi,
  // aks holda ruscha bosh sahifa o'zbekcha sarlavha bilan chiqardi.
  "hero.kicker": "Dizayn agentligi — Toshkent, 2018-yildan",
  "hero.heading": "Brendlarning vizual ko'rinishini\nshakllantiramiz.",
  "site.description":
    "SADO — brend strategiyasi, veb-dizayn va raqamli tajribalar yaratuvchi dizayn agentligi. Toshkent.",
  "site.tagline": "Dizayn agentligi",
  "common.contact": "Bog'lanish",
  "common.readMore": "Batafsil",
  // Formadagi byudjet — ixtiyoriy, erkin matn (mijoz qarori, 2026-09-19).
  "contact.budget": "Mo'ljallangan byudjet (ixtiyoriy)",
  "contact.budget.placeholder": "Masalan: $2 000 yoki 25 mln so'm",
  // Xato matnlari: zod sxemasidagi xabarlar o'zbekcha va server bilan
  // umumiy, shuning uchun forma ularni shu kalitlar bilan almashtiradi —
  // aks holda ruscha sahifada xato o'zbekcha chiqardi.
  "contact.err.name": "Ismingizni kiriting",
  "contact.err.phone": "Telefon raqamini kiriting",
  "contact.err.service": "Xizmat turini tanlang",
  "contact.err.budget": "Byudjetni qisqaroq yozing",
  // Xizmat variantlari. Kalit — `lib/contact.ts` dagi qiymatning o'zi:
  // bazaga doim o'zbekcha qiymat yoziladi, ko'rinadigani esa tarjima.
  "svc:Brend strategiyasi": "Brend strategiyasi",
  "svc:Brend dizayn": "Brend dizayn",
  "svc:Veb-dizayn": "Veb-dizayn",
  "svc:UI/UX dizayn": "UI/UX dizayn",
  "svc:Motion dizayn": "Motion dizayn",
  "svc:Print va editorial": "Print va editorial",
  "svc:Boshqa": "Boshqa",
  "footer.cookies": "Cookie siyosati",
  "footer.privacy": "Maxfiylik siyosati",
  "footer.city": "Toshkent",
} as const;

export type MessageKey = keyof typeof uz;

/**
 * Ruscha. Bu yerda **faqat interfeys** — mijozning kontenti Payload'da.
 *
 * Tarjima to'liq bo'lmasa ham sayt buzilmaydi: yetishmagan kalit
 * o'zbekchasiga qaytadi.
 */
const ru: Partial<Record<MessageKey, string>> = {
  "nav.portfolio": "Портфолио",
  "nav.services": "Услуги",
  "nav.about": "О нас",
  "nav.blog": "Блог",
  "nav.menu": "Меню",
  "nav.close": "Закрыть меню",
  "nav.theme": "Переключить светлую/тёмную тему",
  "nav.language": "Язык сайта",

  "home.works.kicker": "Работы",
  "home.works.title": "Наши работы",
  "home.works.all": "Все работы",
  "home.services.kicker": "Услуги",
  "home.services.lead":
    "Каждый проект начинается со стратегии и заканчивается целостной визуальной системой.",
  "home.trust.kicker": "Доверие",
  "home.clients": "Нам доверяют более 50 компаний",
  "home.testimonials.lead":
    "С некоторыми клиентами мы работаем уже три года — ниже их собственные слова.",
  "home.blog.kicker": "Мысли",
  "home.blog.all": "Все статьи",

  "portfolio.kicker": "Работы",
  "portfolio.empty": "Работы появятся здесь совсем скоро.",
  "portfolio.empty.hint":
    "Мы готовим первые проекты к публикации. А пока свяжитесь с нами напрямую.",
  "project.brief": "Задача",
  "project.solution": "Решение",
  "project.next": "Следующий проект",

  "services.kicker": "Услуги",
  "services.empty": "Список услуг обновляется.",
  "services.unsure": "Не знаете, что именно нужно?",
  "services.empty.hint": "Напишите, что вам нужно — ответим напрямую.",

  "about.kicker": "Агентство",
  "about.values.kicker": "Ценности",
  "about.values.title": "Как мы работаем",
  "about.team.kicker": "Команда",
  "about.team.title": "Кто работает",
  "about.contact.kicker": "Контакты",

  "blog.kicker": "Мысли",
  "blog.lead": "Здесь мы публикуем наблюдения о дизайне и брендинге.",
  "blog.empty": "Первая статья пишется.",
  "blog.all": "Все",
  "blog.filter": "Фильтр по категориям",
  "blog.related": "Похожие статьи",
  "blog.back": "← Блог",
  "post.category": "Категория",
  "post.author": "Автор",
  "post.date": "Дата",
  "post.readingTime": "Время чтения",

  "contact.name": "Ваше имя",
  "contact.email": "Ваш email",
  "contact.service": "Тип услуги",
  "contact.message": "О вашей задаче",
  "contact.submit": "Отправить",
  "contact.sending": "Отправляем…",
  "contact.sent": "Сообщение отправлено.",
  "contact.select": "Выберите",
  "contact.error": "Не удалось отправить. Попробуйте чуть позже.",

  "footer.contact": "Контакты",
  "footer.socials": "Соцсети",
  "footer.rights": "Все права защищены",
  "footer.menu": "Меню",
  "footer.newsletter": "Рассылка",
  "footer.subscribe": "Подписаться",
  "footer.subscribed": "Спасибо за подписку!",

  "portfolio.title": "Портфолио",
  "portfolio.lead":
    "Брендинг, веб, UI/UX и печать. Каждый кейс показывает путь от стратегии до решения.",
  "services.title": "Что мы делаем",
  "services.lead":
    "Чаще всего несколько из них идут в одном проекте — мы сами подскажем, что нужно.",
  "blog.title": "Блог",
  "about.title": "О нас",
  "project.client": "Клиент",
  "project.year": "Год",
  "project.categoryLabel": "Категория",
  "project.services": "Услуги",
  "contact.phone": "Телефон",
  "contact.company": "Компания (необязательно)",

  "home.works.heading": "Последние проекты.",
  "home.blog.heading": "Мысли и наблюдения.",
  "home.trust.heading": "Нам доверяют.",
  "home.cta.heading": "Обсудим ваш проект?",
  "home.cta.text":
    "Напишите пару строк — ответим в течение рабочего дня и назначим первую встречу.",
  "services.cta.text":
    "Опишите задачу в двух словах — подскажем подходящую услугу и назовём примерные сроки.",
  "about.contact.text": "Опишите задачу в двух словах — ответим в течение рабочего дня.",
  "notFound.title": "Такая страница не найдена.",
  "notFound.back": "Вернуться на главную",
  "footer.newsletter.lead": "Подпишитесь на новости о проектах и наших мыслях",
  "contact.replyTime": "Свяжемся с вами в течение рабочего дня.",
  "contact.errorLong":
    "Что-то пошло не так. Попробуйте ещё раз или напишите нам напрямую.",

  "meta.portfolio": "Избранные проекты агентства SADO — брендинг, веб, UI/UX и печать.",
  "meta.services": "Брендинг, ребрендинг, нейминг, веб-дизайн, UI/UX и печать — услуги SADO.",
  "meta.about": "SADO — независимое дизайн-агентство, работающее в Ташкенте с 2018 года.",
  "meta.blog": "Наши мысли о дизайне, брендинге и цифровых продуктах.",
  "hero.kicker": "Дизайн-агентство — Ташкент, с 2018 года",
  "hero.heading": "Формируем визуальный облик\nбрендов.",
  "site.description":
    "SADO — дизайн-агентство: стратегия бренда, веб-дизайн и цифровой опыт. Ташкент.",
  "site.tagline": "Дизайн-агентство",
  "common.contact": "Связаться",
  "common.readMore": "Подробнее",
  "contact.budget": "Планируемый бюджет (необязательно)",
  "contact.budget.placeholder": "Например: $2 000 или 25 млн сумов",
  "contact.err.name": "Введите ваше имя",
  "contact.err.phone": "Введите номер телефона",
  "contact.err.service": "Выберите тип услуги",
  "contact.err.budget": "Напишите бюджет короче",
  "svc:Brend strategiyasi": "Стратегия бренда",
  "svc:Brend dizayn": "Бренд-дизайн",
  "svc:Veb-dizayn": "Веб-дизайн",
  "svc:UI/UX dizayn": "UI/UX-дизайн",
  "svc:Motion dizayn": "Моушн-дизайн",
  "svc:Print va editorial": "Печатный дизайн и editorial",
  "svc:Boshqa": "Другое",
  "footer.cookies": "Политика cookie",
  "footer.privacy": "Политика конфиденциальности",
  "footer.city": "Ташкент",
};

const TABLE: Record<SiteLocale, Partial<Record<MessageKey, string>>> = { uz, ru };

export function t(locale: SiteLocale, key: MessageKey): string {
  return TABLE[locale]?.[key] ?? uz[key];
}

/**
 * Bitta til uchun tayyor lug'at — client komponentlarga prop bo'lib ketadi.
 * Ular `t()` ni chaqira olmaydi: `locale` ularga baribir uzatilishi kerak
 * bo'lardi va har bir chaqiruv joyi buni unutishi mumkin.
 */
export type Messages = Record<MessageKey, string>;

export function messages(locale: SiteLocale): Messages {
  return Object.fromEntries(
    (Object.keys(uz) as MessageKey[]).map((k) => [k, t(locale, k)]),
  ) as Messages;
}
