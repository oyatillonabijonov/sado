import { expect, test } from 'bun:test';
import { fromBlocks, fromText, toBlocks, toText, type Block } from './lexical';

/**
 * The panel's editor writes plain text and picture references into a Lexical
 * document and reads them back out. If that round-trip drifts, the studio loses
 * work silently — which is the one failure mode this whole approach cannot have.
 */

const SAMPLE = `## Sarlavha

Birinchi xatboshi.

- bir
- ikki

1. birinchi
2. ikkinchi

> iqtibos

\`\`\`json
{ "min": 30000000, "max": 60000000 }
\`\`\`

### Kichik sarlavha

Oxirgi xatboshi.`;

test('text survives a round trip unchanged', () => {
  const { text, lossy } = toText(fromText(SAMPLE));
  expect(lossy).toBe(false);
  expect(text).toBe(SAMPLE);
});

test('a second pass changes nothing', () => {
  const once = toText(fromText(SAMPLE)).text;
  expect(toText(fromText(once)).text).toBe(once);
});

test('a single newline starts a new paragraph', () => {
  // Deliberate: one Enter means one paragraph, the way a chat box behaves.
  // Stated as a test so nobody "fixes" it into a soft break by accident.
  expect(toText(fromText('bir\nikki')).text).toBe('bir\n\nikki');
});

test('a code block keeps its language and its indentation', () => {
  const src = '```ts\nfunction a() {\n  return 1;\n}\n```';
  const doc = fromText(src) as { root: { children: { language?: string }[] } };
  expect(doc.root.children[0].language).toBe('ts');
  expect(toText(doc).text).toBe(src);
});

test('pictures sit between runs of text and come back in the same order', () => {
  const blocks: Block[] = [
    { kind: 'text', text: 'Birinchi.' },
    { kind: 'image', media: 7 },
    { kind: 'text', text: '## Ikkinchi\n\nMatn.' },
    { kind: 'image', media: 12 },
  ];
  let n = 0;
  const { blocks: back, lossy } = toBlocks(fromBlocks(blocks, () => `id-${n++}`));
  expect(lossy).toBe(false);
  expect(back).toEqual(blocks);
});

test('an upload node is the shape Payload stores', () => {
  const doc = fromBlocks([{ kind: 'image', media: 3 }], () => 'fixed') as {
    root: { children: Record<string, unknown>[] };
  };
  expect(doc.root.children[0]).toEqual({
    type: 'upload',
    format: '',
    version: 3,
    id: 'fixed',
    relationTo: 'media',
    value: 3,
    fields: {},
  });
});

test('a picture with nothing chosen is dropped rather than stored empty', () => {
  const doc = fromBlocks([{ kind: 'image', media: null }]);
  expect(toBlocks(doc).blocks).toEqual([]);
});

test('toText reports pictures as loss, because it cannot carry them', () => {
  // The short prose fields (a service's "what we do") are a single textarea with
  // no picture support. If one ever ends up holding an image, that has to be
  // visible rather than quietly discarded on the next save.
  const doc = fromBlocks([{ kind: 'text', text: 'a' }, { kind: 'image', media: 4 }]);
  expect(toText(doc).lossy).toBe(true);
  expect(toBlocks(doc).lossy).toBe(false);
});

test('a node the syntax cannot express is reported, not swallowed', () => {
  const doc = {
    root: {
      type: 'root',
      children: [
        { type: 'table', children: [] },
        { type: 'paragraph', children: [{ type: 'text', text: 'qoldi' }] },
      ],
    },
  };
  const { blocks, lossy } = toBlocks(doc);
  expect(lossy).toBe(true);
  expect(blocks).toEqual([{ kind: 'text', text: 'qoldi' }]);
});

/**
 * Havola ilgari `lossy` deb belgilanardi — sintaksisda uni ifodalash yo'li
 * yo'q edi va manzili keyingi saqlashda yo'qolardi. Endi `[matn](url)` bor,
 * ya'ni havolali hujjat yana tahrirlanadigan bo'ldi.
 */
test('havola manzili bilan birga matnga o‘giriladi', () => {
  const doc = {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', text: 'bizning ' },
            {
              type: 'link',
              fields: { linkType: 'custom', url: 'https://example.uz' },
              children: [{ type: 'text', text: 'sayt' }],
            },
          ],
        },
      ],
    },
  };
  const { blocks, lossy } = toBlocks(doc);
  expect(lossy).toBe(false);
  expect(blocks).toEqual([{ kind: 'text', text: 'bizning [sayt](https://example.uz)' }]);
});

/** Ichki havolaning URL'i yo'q — u hujjatga ishora qiladi va sig'maydi. */
test('URL‘siz ichki havola hamon yo‘qotish deb belgilanadi', () => {
  const doc = {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              fields: { linkType: 'internal', doc: { relationTo: 'posts', value: 1 } },
              children: [{ type: 'text', text: 'maqola' }],
            },
          ],
        },
      ],
    },
  };
  const { blocks, lossy } = toBlocks(doc);
  expect(lossy).toBe(true);
  expect(blocks).toEqual([{ kind: 'text', text: 'maqola' }]);
});

test('an empty document is still a valid Lexical root', () => {
  const doc = fromText('') as { root: { children: unknown[] } };
  expect(doc.root.children.length).toBe(1);
  expect(toText(doc).text).toBe('');
});

/* --------------------------------------------------- inline belgilar -- */

/**
 * Qalin, kursiv va havola — ikki tomonga.
 *
 * Ular **inline**, ya'ni sarlavha, iqtibos va ro'yxat bandi ichida ham
 * ishlaydi. Ikki tomonlama sinov shu uchala joyni ham qamraydi: bitta
 * yo'nalishda ishlab, ikkinchisida buzilsa mijoz yozganini qayta ochganda
 * yo'qotardi.
 */
const INLINE_SAMPLE = `## **Qalin** sarlavha

Oddiy, **qalin**, *kursiv* va [havola](https://sado.agency) bitta qatorda.

- **qalin** band
- [havolali](https://example.uz) band

> *kursiv* iqtibos`;

test('inline belgilar matn → Lexical → matn aylanishida saqlanadi', () => {
  const doc = fromText(INLINE_SAMPLE, () => 'id');
  const { text, lossy } = toText(doc);
  expect(lossy).toBe(false);
  expect(text).toBe(INLINE_SAMPLE);
});

test('qalin va kursiv to‘g‘ri bitmask bilan yoziladi', () => {
  const doc = fromText('**q** va *k*', () => 'id') as {
    root: { children: { children: { text: string; format: number; type: string }[] }[] };
  };
  const nodes = doc.root.children[0].children;
  expect(nodes.map((n) => [n.text, n.format])).toEqual([
    ['q', 1],
    [' va ', 0],
    ['k', 2],
  ]);
});

test('havola Payload kutgan shaklda yoziladi', () => {
  const doc = fromText('[sayt](https://sado.agency)', () => 'havola-1') as {
    root: { children: { children: Record<string, unknown>[] }[] };
  };
  const node = doc.root.children[0].children[0];
  expect(node.type).toBe('link');
  expect(node.version).toBe(3);
  expect(node.id).toBe('havola-1');
  expect(node.fields).toEqual({ linkType: 'custom', url: 'https://sado.agency', newTab: false });
  expect(node.children).toEqual([
    { type: 'text', text: 'sayt', format: 0, style: '', mode: 'normal', detail: 0, version: 1 },
  ]);
});

/**
 * Tagi chizilgan matn (bitmask 8) — bu sintaksisda belgisi yo'q. Ilgari u
 * jimgina oddiy matnga aylanardi; endi ogohlantirish chiqadi va saqlash
 * to'siladi, ya'ni mijoz formatini bilmasdan yo'qotmaydi.
 */
test('ifodalab bo‘lmaydigan format yo‘qotish deb belgilanadi', () => {
  const doc = {
    root: {
      type: 'root',
      children: [{ type: 'paragraph', children: [{ type: 'text', text: 'tagi chizilgan', format: 8 }] }],
    },
  };
  const { blocks, lossy } = toBlocks(doc);
  expect(lossy).toBe(true);
  expect(blocks).toEqual([{ kind: 'text', text: 'tagi chizilgan' }]);
});

test('kod bloki ichidagi yulduzcha belgi emas', () => {
  const source = '```ts\nconst a = b ** 2;\n```';
  const doc = fromText(source, () => 'id');
  expect(toText(doc).text).toBe(source);
});

test('yolg‘iz yulduzcha matnda shundoq qoladi', () => {
  // Ekranlash yo'q: naqsh juftlik talab qiladi, ya'ni juftsiz belgi tegilmaydi.
  const doc = fromText('2 * 3 = 6', () => 'id');
  expect(toText(doc).text).toBe('2 * 3 = 6');
});
