/**
 * Plain text ⇄ Lexical, and the block list the editor actually works on.
 *
 * The studio writes in textareas. Nobody is asked to learn the phrase "rich
 * text" — the syntax is marks people already use in chat, and the toolbar in
 * `BlockEditor` inserts them so nobody has to remember any of it:
 *
 *     ## Sarlavha          → H2
 *     ### Kichik sarlavha  → H3
 *     - qator              → bullet list
 *     1. qator             → numbered list
 *     > iqtibos            → quote
 *     ```                  → code block, fenced
 *     **qalin**            → bold
 *     *kursiv*             → italic
 *     [matn](https://…)    → link
 *
 * Anything else is a paragraph. A blank line separates blocks.
 *
 * The last three are **inline** and therefore work inside a heading, a quote
 * or a list item too — they are applied to the text of every block, not to
 * whole lines.
 *
 * **Images are not syntax.** A document is a list of blocks — a run of text, a
 * picture, another run of text — and the editor renders that list directly.
 * That is what makes "put a picture after this paragraph" a button rather than
 * a thing you have to know how to type, and it is the whole reason this file
 * has a block layer at all on top of the text one.
 *
 * **Round-trip honesty.** `toBlocks` reports `lossy: true` when the stored
 * document holds something this syntax cannot express — a table, or a text run
 * that is underlined, struck through or inline-code, whose formatting would
 * survive as bare words and then be lost on the next save. The editor shows a
 * warning and hides the save button rather than flattening it. Those documents
 * stay editable in Payload's own editor.
 */

/** Block-level node types the text syntax can represent. */
const KNOWN = new Set(['paragraph', 'heading', 'list', 'listitem', 'quote', 'code']);

/** Inline node types that survive without losing anything. */
const INLINE_SAFE = new Set(['text', 'linebreak', 'tab', 'link', 'autolink']);

/**
 * Lexical's text format bitmask. Only the first two have a mark in this
 * syntax; the rest are reported as loss rather than silently flattened.
 *
 * Ilgari bu yerda tekshiruv umuman yo'q edi: qalin matn oddiy matn bo'lib
 * o'qilardi va keyingi saqlashda qalinligini yo'qotardi — jimgina, ogohlantirishsiz.
 */
const BOLD = 1;
const ITALIC = 2;
const REPRESENTABLE = BOLD | ITALIC;

type Node = { type: string; [k: string]: unknown };

export type Block =
  | { kind: 'text'; text: string }
  | { kind: 'image'; media: number | null };

/* ----------------------------------------------------------- to plain -- */

/** `**` va `*` — qalinni oldin, aks holda `**x**` `*` bo'lib bo'linardi. */
function marked(value: string, format: number): string {
  if (!value) return value;
  let out = value;
  if (format & ITALIC) out = `*${out}*`;
  if (format & BOLD) out = `**${out}**`;
  return out;
}

function textOf(node: Node, onLoss: () => void): string {
  const children = (node.children as Node[] | undefined) ?? [];
  return children
    .map((child) => {
      if (child.type === 'text') {
        const format = Number(child.format ?? 0);
        // Tagi chizilgan, o'chirilgan yoki inline kod — bu sintaksisda belgisi
        // yo'q. Matni qoladi, formati esa keyingi saqlashda yo'qolardi.
        if (format & ~REPRESENTABLE) onLoss();
        return marked(String(child.text ?? ''), format);
      }
      if (child.type === 'linebreak') return '\n';
      if (child.type === 'link' || child.type === 'autolink') {
        const fields = (child.fields ?? {}) as { url?: string; linkType?: string };
        const url = String(fields.url ?? '');
        const label = textOf(child, onLoss);
        // Ichki havola (`linkType: 'internal'`) hujjatga ishora qiladi, URL'i
        // yo'q — uni `[matn](…)` ga sig'dirib bo'lmaydi.
        if (!url) {
          onLoss();
          return label;
        }
        return `[${label}](${url})`;
      }
      if (!INLINE_SAFE.has(child.type)) onLoss();
      return textOf(child, onLoss);
    })
    .join('');
}

function blockToText(node: Node, onLoss: () => void): string {
  switch (node.type) {
    case 'heading':
      return `${node.tag === 'h3' ? '###' : '##'} ${textOf(node, onLoss)}`;
    case 'quote':
      return `> ${textOf(node, onLoss)}`;
    case 'code':
      // The language rides on the opening fence so it survives the round trip —
      // the seeded articles carry `json`, and dropping it would re-highlight
      // them as plain text on the live site.
      return `\`\`\`${node.language ?? ''}\n${textOf(node, onLoss)}\n\`\`\``;
    case 'list': {
      const numbered = node.listType === 'number';
      return ((node.children as Node[] | undefined) ?? [])
        .map((li, i) => `${numbered ? `${i + 1}.` : '-'} ${textOf(li, onLoss)}`)
        .join('\n');
    }
    default:
      return textOf(node, onLoss);
  }
}

const relId = (value: unknown): number | null => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value !== '') return Number(value);
  if (value && typeof value === 'object' && 'id' in value) return Number((value as { id: number }).id);
  return null;
};

/** The whole document as one string. For the short prose fields with no pictures. */
export function toText(doc: unknown): { text: string; lossy: boolean } {
  const { blocks, lossy } = toBlocks(doc);
  const images = blocks.some((b) => b.kind === 'image');
  const text = blocks
    .filter((b): b is { kind: 'text'; text: string } => b.kind === 'text')
    .map((b) => b.text)
    .join('\n\n')
    .trim();
  return { text, lossy: lossy || images };
}

/** The document as the editor sees it: runs of text with pictures between them. */
export function toBlocks(doc: unknown): { blocks: Block[]; lossy: boolean } {
  const root = (doc as { root?: Node })?.root;
  const children = (root?.children as Node[] | undefined) ?? [];

  let lossy = false;
  const onLoss = () => {
    lossy = true;
  };

  const blocks: Block[] = [];
  let run: string[] = [];

  const flush = () => {
    const text = run.join('\n\n').trim();
    if (text) blocks.push({ kind: 'text', text });
    run = [];
  };

  for (const node of children) {
    if (node.type === 'upload') {
      flush();
      blocks.push({ kind: 'image', media: relId(node.value) });
      continue;
    }
    if (!KNOWN.has(node.type)) {
      onLoss();
      continue;
    }
    run.push(blockToText(node, onLoss));
  }
  flush();

  return { blocks, lossy };
}

/* ------------------------------------------------------------ builders -- */

const base = { format: '' as const, indent: 0, version: 1, direction: 'ltr' as const };

const text = (value: string, format = 0) => ({
  type: 'text',
  text: value,
  format,
  style: '',
  mode: 'normal',
  detail: 0,
  version: 1,
});

const link = (url: string, children: object[], id: string) => ({
  ...base,
  type: 'link',
  version: 3,
  id,
  // `linkType: 'custom'` — URL to'g'ridan-to'g'ri yoziladi. `'internal'` bo'lsa
  // Payload `doc` kutadi va bu sintaksisda hujjatga ishora qilishning yo'li yo'q.
  fields: { linkType: 'custom', url, newTab: false },
  children,
});

/**
 * Bitta qatorni inline tugunlarga bo'ladi: `**qalin**`, `*kursiv*`,
 * `[matn](url)`.
 *
 * Bitta regex uchalasini birdan skanerlaydi — ketma-ket uchta o'tish
 * qilinsa ichma-ich joylashgan belgilar (havola matni ichidagi qalin)
 * ikki marta o'ralib ketardi. Qalin muqarrar ravishda kursivdan oldin
 * keladi, aks holda `**x**` `*` bo'lib bo'linardi.
 *
 * Ekranlash (`\*`) ataylab yo'q: matnda yolg'iz turgan yulduzcha shundoq
 * qoladi, chunki naqsh juftlik talab qiladi. Bu `##` ning qator boshida
 * ishlashi bilan bir xil kelishuv — sintaksis mavjud yozuvni buzmaydi.
 */
const INLINE = /\*\*([^*]+)\*\*|\*([^*\n]+)\*|\[([^\]\n]+)\]\(([^)\s]+)\)/g;

function inlineNodes(value: string, newId: () => string): object[] {
  const out: object[] = [];
  let last = 0;

  for (const m of value.matchAll(INLINE)) {
    const at = m.index;
    if (at > last) out.push(text(value.slice(last, at)));
    if (m[1] !== undefined) out.push(text(m[1], BOLD));
    else if (m[2] !== undefined) out.push(text(m[2], ITALIC));
    else out.push(link(m[4], [text(m[3])], newId()));
    last = at + m[0].length;
  }

  if (last < value.length) out.push(text(value.slice(last)));
  // Lexical bo'sh `children` ni ham qabul qiladi, lekin bo'sh xatboshi
  // bitta bo'sh matn tuguni bilan yoziladi — uning o'z muharriri shunday qiladi.
  return out.length ? out : [text('')];
}

const paragraph = (children: object[]) => ({ ...base, type: 'paragraph', textFormat: 0, textStyle: '', children });
const heading = (children: object[], tag: 'h2' | 'h3') => ({ ...base, type: 'heading', tag, children });
const quote = (children: object[]) => ({ ...base, type: 'quote', children });
const code = (value: string, language: string) => ({
  ...base,
  type: 'code',
  language: language || 'ts',
  // Kod bloki ichida `**` va `[…]` belgi emas, kodning o'zi.
  children: [text(value)],
});

const list = (kind: 'number' | 'bullet', items: object[][]) => ({
  ...base,
  type: 'list',
  listType: kind,
  tag: kind === 'number' ? 'ol' : 'ul',
  start: 1,
  children: items.map((children, i) => ({
    ...base,
    type: 'listitem',
    value: i + 1,
    checked: undefined,
    children,
  })),
});

/**
 * Payload's upload node, version 3.
 *
 * `id` is the node's own identity, not the picture's — Payload uses it to track
 * sub-fields and rejects a version-3 node without one. `value` may be an id or
 * a populated document; an id is what we have and what Payload stores anyway.
 */
const upload = (media: number, id: string) => ({
  type: 'upload',
  format: '' as const,
  version: 3,
  id,
  relationTo: 'media',
  value: media,
  fields: {},
});

function nodesFromText(input: string, newId: () => string): object[] {
  const children: object[] = [];
  const inline = (value: string) => inlineNodes(value, newId);
  const chunks = input.replace(/\r\n/g, '\n').split(/\n{2,}/);

  for (const chunk of chunks) {
    // A fenced block is taken verbatim: no trimming, no line splitting, or the
    // indentation that makes code readable would be the first thing lost.
    const fence = chunk.match(/^```([a-z0-9]*)\n([\s\S]*?)\n?```$/i);
    if (fence) {
      children.push(code(fence[2], fence[1]));
      continue;
    }

    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    // A chunk is a list when its *first* line opens one; mixed chunks are rare
    // enough that guessing per line would only produce surprising output.
    if (lines[0].startsWith('- ')) {
      children.push(list('bullet', lines.map((l) => inline(l.replace(/^-\s+/, '')))));
      continue;
    }
    if (/^\d+\.\s/.test(lines[0])) {
      children.push(list('number', lines.map((l) => inline(l.replace(/^\d+\.\s+/, '')))));
      continue;
    }

    for (const line of lines) {
      if (line.startsWith('### ')) children.push(heading(inline(line.slice(4)), 'h3'));
      else if (line.startsWith('## ')) children.push(heading(inline(line.slice(3)), 'h2'));
      else if (line.startsWith('> ')) children.push(quote(inline(line.slice(2))));
      else children.push(paragraph(inline(line)));
    }
  }

  return children;
}

function wrap(children: object[]) {
  // Lexical rejects an empty root; a document with one empty paragraph is the
  // shape its own editor produces for "nothing here yet".
  if (!children.length) children.push(paragraph([text('')]));
  return { root: { ...base, type: 'root', children } };
}

export function fromText(input: string, newId: () => string = () => crypto.randomUUID()) {
  return wrap(nodesFromText(input, newId));
}

/**
 * The editor's hidden input, back into blocks.
 *
 * Validated rather than trusted: a server action is a public HTTP endpoint and
 * this string arrives from the browser. Anything unrecognised is dropped, which
 * is what an empty document looks like — never a thrown error mid-save.
 */
export function parseBlocks(raw: unknown): Block[] {
  let value: unknown;
  try {
    value = JSON.parse(String(raw ?? '[]'));
  } catch {
    return [];
  }
  if (!Array.isArray(value)) return [];

  return value.flatMap((item): Block[] => {
    if (!item || typeof item !== 'object') return [];
    const block = item as Record<string, unknown>;
    if (block.kind === 'text') return [{ kind: 'text', text: String(block.text ?? '') }];
    if (block.kind === 'image') {
      const media = Number(block.media);
      return [{ kind: 'image', media: Number.isFinite(media) && media > 0 ? media : null }];
    }
    return [];
  });
}

/** Every word in a document, for the reading-time estimate. */
export function blocksToPlain(blocks: Block[]): string {
  return blocks
    .filter((b): b is { kind: 'text'; text: string } => b.kind === 'text')
    .map((b) => b.text)
    .join('\n\n');
}

export function fromBlocks(blocks: Block[], newId: () => string = () => crypto.randomUUID()) {
  const children: object[] = [];
  for (const block of blocks) {
    if (block.kind === 'image') {
      if (block.media) children.push(upload(block.media, newId()));
      continue;
    }
    children.push(...nodesFromText(block.text, newId));
  }
  return wrap(children);
}

export const SYNTAX_HINT =
  'Bo‘sh qator — yangi xatboshi. Formatlash uchun matnni belgilab, tepadagi tugmalardan foydalaning.';
