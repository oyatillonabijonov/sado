/**
 * Plain text ⇄ Lexical, and the block list the editor actually works on.
 *
 * The studio writes in textareas. Nobody is asked to learn a toolbar or the
 * phrase "rich text" — the only syntax is five marks people already use in
 * chat:
 *
 *     ## Sarlavha          → H2
 *     ### Kichik sarlavha  → H3
 *     - qator              → bullet list
 *     1. qator             → numbered list
 *     > iqtibos            → quote
 *     ```                  → code block, fenced
 *
 * Anything else is a paragraph. A blank line separates blocks.
 *
 * **Images are not syntax.** A document is a list of blocks — a run of text, a
 * picture, another run of text — and the editor renders that list directly.
 * That is what makes "put a picture after this paragraph" a button rather than
 * a thing you have to know how to type, and it is the whole reason this file
 * has a block layer at all on top of the text one.
 *
 * **Round-trip honesty.** `toBlocks` reports `lossy: true` when the stored
 * document holds something this syntax cannot express — a table, or a link
 * inside a paragraph, whose URL would survive as bare text and then be lost on
 * the next save. The editor shows a warning and hides the save button rather
 * than flattening it. Those documents stay editable in Payload's own editor at
 * `/admin`.
 */

/** Block-level node types the text syntax can represent. */
const KNOWN = new Set(['paragraph', 'heading', 'list', 'listitem', 'quote', 'code']);

/** Inline node types that survive as plain text without losing anything. */
const INLINE_SAFE = new Set(['text', 'linebreak', 'tab']);

type Node = { type: string; [k: string]: unknown };

export type Block =
  | { kind: 'text'; text: string }
  | { kind: 'image'; media: number | null };

/* ----------------------------------------------------------- to plain -- */

function textOf(node: Node, onLoss: () => void): string {
  const children = (node.children as Node[] | undefined) ?? [];
  return children
    .map((child) => {
      if (child.type === 'text') return String(child.text ?? '');
      if (child.type === 'linebreak') return '\n';
      // A link keeps its words and loses its href. Silently dropping the URL on
      // the next save is exactly the kind of quiet damage this flag exists for.
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

const text = (value: string) => ({
  type: 'text',
  text: value,
  format: 0,
  style: '',
  mode: 'normal',
  detail: 0,
  version: 1,
});

const paragraph = (value: string) => ({ ...base, type: 'paragraph', textFormat: 0, textStyle: '', children: [text(value)] });
const heading = (value: string, tag: 'h2' | 'h3') => ({ ...base, type: 'heading', tag, children: [text(value)] });
const quote = (value: string) => ({ ...base, type: 'quote', children: [text(value)] });
const code = (value: string, language: string) => ({
  ...base,
  type: 'code',
  language: language || 'ts',
  children: [text(value)],
});

const list = (kind: 'number' | 'bullet', items: string[]) => ({
  ...base,
  type: 'list',
  listType: kind,
  tag: kind === 'number' ? 'ol' : 'ul',
  start: 1,
  children: items.map((item, i) => ({
    ...base,
    type: 'listitem',
    value: i + 1,
    checked: undefined,
    children: [text(item)],
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

function nodesFromText(input: string): object[] {
  const children: object[] = [];
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
      children.push(list('bullet', lines.map((l) => l.replace(/^-\s+/, ''))));
      continue;
    }
    if (/^\d+\.\s/.test(lines[0])) {
      children.push(list('number', lines.map((l) => l.replace(/^\d+\.\s+/, ''))));
      continue;
    }

    for (const line of lines) {
      if (line.startsWith('### ')) children.push(heading(line.slice(4), 'h3'));
      else if (line.startsWith('## ')) children.push(heading(line.slice(3), 'h2'));
      else if (line.startsWith('> ')) children.push(quote(line.slice(2)));
      else children.push(paragraph(line));
    }
  }

  return children;
}

function wrap(children: object[]) {
  // Lexical rejects an empty root; a document with one empty paragraph is the
  // shape its own editor produces for "nothing here yet".
  if (!children.length) children.push(paragraph(''));
  return { root: { ...base, type: 'root', children } };
}

export function fromText(input: string) {
  return wrap(nodesFromText(input));
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
    children.push(...nodesFromText(block.text));
  }
  return wrap(children);
}

export const SYNTAX_HINT =
  'Bo‘sh qator — yangi xatboshi. ## — sarlavha, ### — kichik sarlavha, - — ro‘yxat, > — iqtibos.';
