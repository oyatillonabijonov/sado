/**
 * Strukturali ma'lumot (schema.org, JSON-LD).
 *
 * `<` belgisi `<` ga almashtiriladi va bu XAVFSIZLIK uchun, chiroylik
 * uchun emas: sxemaga kiradigan matnning bir qismi paneldan keladi (loyiha
 * nomi, maqola sarlavhasi, muallif). Ichida `</script>` bo'lgan sarlavha
 * skript blokini erta yopib, qolganini HTML sifatida ijro etardi. JSON
 * spetsifikatsiyasi bo'yicha `<` xuddi `<` deb o'qiladi, ya'ni sxema
 * o'zgarmaydi.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
