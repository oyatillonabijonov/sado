/**
 * What every save action returns, and how a Payload error becomes a sentence.
 *
 * Not in the actions files, and not by choice: a `'use server'` module may only
 * export async functions, so a type and a synchronous helper cannot live there.
 * It carries no directive at all, so both the actions and the client forms can
 * import it.
 */

export type FormState = { error?: string; ok?: boolean };

/**
 * Payload names invalid fields by their config key, in English, inside a
 * sentence that also names the admin tab they sit in — none of which appears
 * anywhere in this panel. The keys are translated back into the labels the
 * forms actually show.
 */
const FIELD_LABEL: Record<string, string> = {
  // cases
  client: 'Mijoz nomi',
  year: 'Yil',
  heroImage: 'Asosiy rasm',
  title: 'Sarlavha',
  industry: 'Soha',
  role: 'Lavozimi',
  taskOneLiner: 'Bir qatorli tavsif',
  task: 'Vazifa',
  constraints: 'Cheklovlar — kamida bittasi kerak',
  decisions: 'Yechimlar — kamida ikkitasi kerak',
  wouldDoDifferently: 'Nimani boshqacha qilardik',
  resultMetrics: 'Raqamlar',
  // services
  name: 'Nomi',
  duration: 'Muddat',
  whenNeeded: 'Qachon kerak',
  whatWeDo: 'Nima qilamiz',
  outcomes: 'Nima olasiz — uchtasi ham to‘ldirilishi kerak',
  // posts, team, clients
  lead: 'Qisqa tavsif',
  body: 'Maqola matni',
  author: 'Muallif',
  relatedCase: 'Bog‘liq loyiha',
  availableLocales: 'Qaysi tillarda chiqsin',
  bio: 'Qisqacha',
  portrait: 'Surati',
  logo: 'Logotip',
  slug: 'Sahifa manzili',
};

export function explain(error: unknown): string {
  const data = (error as { data?: { errors?: { path?: string }[] } })?.data;

  if (data?.errors?.length) {
    const fields = [
      ...new Set(
        data.errors.map((e) => {
          // Paths arrive as `decisions.0.title`; the first segment is the field.
          const key = String(e.path ?? '').split('.')[0];
          return FIELD_LABEL[key] ?? key;
        }),
      ),
    ];
    return `To‘ldirilmagan joylar bor: ${fields.join(', ')}.`;
  }

  const message = error instanceof Error ? error.message : String(error);
  if (message.toLowerCase().includes('slug') || message.includes('unique')) {
    return 'Bu sahifa manzili band. Manzilni o‘zgartiring.';
  }
  return `Saqlab bo‘lmadi: ${message}`;
}
