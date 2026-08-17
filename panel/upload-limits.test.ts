import { describe, expect, test } from "bun:test";
import { isVideo } from "@/lib/site-format";
import {
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  VIDEO_TYPES,
  isAllowedType,
  isVideoType,
  limitFor,
  rejectMessage,
  resolveUploadType,
} from "@/panel/upload-limits";

/**
 * Yuklash cheklovlari. Bu yerdagi har bir test jonli xatodan keyin yozilgan:
 * mijoz 1 MB'lik mp4 ni yuklay olmadi, chunki client `image/*` ni o'tkazardi,
 * server esa beshta turni bilardi va rad etish xabari nima kelganini
 * aytmasdi — sabab na mijozga, na bizga ko'rinardi.
 */
describe("yuklash uchun ruxsat etilgan turlar", () => {
  test("mijoz yuklaydigan video turlari qabul qilinadi", () => {
    for (const t of ["video/mp4", "video/webm", "video/quicktime"]) {
      expect(isAllowedType(t)).toBe(true);
      expect(isVideoType(t)).toBe(true);
      expect(limitFor(t)).toBe(MAX_VIDEO_BYTES);
    }
  });

  test("keng tarqalgan rasm turlari qabul qilinadi", () => {
    for (const t of ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]) {
      expect(isAllowedType(t)).toBe(true);
      expect(limitFor(t)).toBe(MAX_IMAGE_BYTES);
    }
  });

  test("notanish tur rad etiladi", () => {
    expect(isAllowedType("application/pdf")).toBe(false);
    expect(isAllowedType("")).toBe(false);
  });

  /**
   * Eng muhim kafolat: saytdagi `isVideo()` kengaytma bo'yicha video deb
   * bilgan hamma narsa YUKLANA olishi kerak. Ilgari `.mov` sayt tomonda
   * qo'llab-quvvatlanardi, lekin yuklashda ro'yxatda yo'q edi.
   */
  test("sayt video deb tanigan kengaytmalar yuklana oladi", () => {
    const byType: Record<string, string> = {
      "video/mp4": "kadr.mp4",
      "video/webm": "kadr.webm",
      "video/quicktime": "kadr.mov",
    };
    for (const [type, name] of Object.entries(byType)) {
      expect(isVideo(name)).toBe(true);
      expect(isAllowedType(type)).toBe(true);
    }
  });
});

/**
 * ASOSIY REGRESSIYA TESTI.
 *
 * Bun'ning `formData()` client yuborgan MIME turini tashlab, uni fayl
 * nomidan qayta hisoblaydi va katta harfli kengaytmada bo'sh qoldiradi.
 * Mijoz videoni yuklay olmagani aynan shundan edi — `IMG_4821.MOV`.
 * Bu testlar o'sha holatni qo'riqlaydi.
 */
describe("serverdagi tur tiklanishi (Bun formData quirk)", () => {
  test("katta harfli kengaytma — bo'sh turdan tiklanadi", () => {
    for (const name of ["IMG_4821.MOV", "KADR.MP4", "Clip.WebM", "Photo.JPG"]) {
      const type = resolveUploadType({ name, type: "" });
      expect(isAllowedType(type)).toBe(true);
    }
  });

  test("iPhone videosi qabul qilinadi va video chegarasini oladi", () => {
    const type = resolveUploadType({ name: "IMG_4821.MOV", type: "" });
    expect(type).toBe("video/quicktime");
    expect(limitFor(type)).toBe(MAX_VIDEO_BYTES);
  });

  test("tur to'g'ri kelgan bo'lsa o'zgartirilmaydi", () => {
    expect(resolveUploadType({ name: "kadr.mp4", type: "video/mp4" })).toBe("video/mp4");
    // Nom bilan tur ziddiyatida TUR ustun: brauzer aytganiga ishonamiz.
    expect(resolveUploadType({ name: "kadr.txt", type: "video/mp4" })).toBe("video/mp4");
  });

  test("kengaytmasiz va notanish fayl baribir rad etiladi", () => {
    expect(isAllowedType(resolveUploadType({ name: "kadr", type: "" }))).toBe(false);
    expect(isAllowedType(resolveUploadType({ name: "hisobot.pdf", type: "" }))).toBe(false);
  });
});

describe("rad etish xabari", () => {
  test("qabul qilingan turni va fayl nomini aytadi", () => {
    const msg = rejectMessage({ name: "hisobot.pdf", type: "application/pdf" });
    expect(msg).toContain("hisobot.pdf");
    expect(msg).toContain("application/pdf");
  });

  test("turi bo'sh bo'lsa ham tushunarli qoladi", () => {
    const msg = rejectMessage({ name: "kadr.mp4", type: "" });
    expect(msg).toContain("kadr.mp4");
    expect(msg).toContain("aniqlanmagan");
  });
});

describe("client va server ro'yxati", () => {
  /**
   * Ikkalasi ayni shu moduldan o'qiydi, ya'ni drift konstruksiya bo'yicha
   * mumkin emas. Test ro'yxatning bo'shab qolishidan qo'riqlaydi.
   */
  test("ro'yxatlar bo'sh emas va kesishmaydi", () => {
    expect(IMAGE_TYPES.length).toBeGreaterThan(0);
    expect(VIDEO_TYPES.length).toBeGreaterThan(0);
    const overlap = IMAGE_TYPES.filter((t) => (VIDEO_TYPES as readonly string[]).includes(t));
    expect(overlap).toEqual([]);
  });
});
