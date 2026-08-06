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

test('a link keeps its words and is reported, because its address cannot survive', () => {
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
              fields: { url: 'https://example.uz' },
              children: [{ type: 'text', text: 'sayt' }],
            },
          ],
        },
      ],
    },
  };
  const { blocks, lossy } = toBlocks(doc);
  expect(lossy).toBe(true);
  expect(blocks).toEqual([{ kind: 'text', text: 'bizning sayt' }]);
});

test('an empty document is still a valid Lexical root', () => {
  const doc = fromText('') as { root: { children: unknown[] } };
  expect(doc.root.children.length).toBe(1);
  expect(toText(doc).text).toBe('');
});
