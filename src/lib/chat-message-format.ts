import { sanitizeHtml } from "@/lib/sanitize";

/**
 * Split on `. ` / `? ` / `! ` before a typical English sentence start (capital + lowercase),
 * so we don't break `Hi there! I'm your...`.
 */
const SENTENCE_BOUNDARY = /(?<=[.!?])\s+(?=[A-Z][a-z])/;

function looksLikeHtml(s: string): boolean {
  return /<\s*[a-z][\s/>]/i.test(s);
}

/** Pack sentences into smaller bubbles when a block is still very long. */
function splitLongPlainText(s: string, maxLen: number): string[] {
  const parts = s.split(SENTENCE_BOUNDARY).map((x) => x.trim()).filter(Boolean);
  if (parts.length <= 1) return [s];

  const out: string[] = [];
  let buf = "";
  for (const p of parts) {
    const candidate = buf ? `${buf} ${p}` : p;
    if (candidate.length <= maxLen) {
      buf = candidate;
    } else {
      if (buf) out.push(buf);
      buf = p;
    }
  }
  if (buf) out.push(buf);
  return out.length ? out : [s];
}

/**
 * Prefer API `\n\n` blocks; otherwise split long single-line prose into sentence chunks.
 * Long sentences are packed into multiple smaller bubbles (max ~280 chars each).
 */
function toDisplayBlocks(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n");
  const blocks = normalized.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (blocks.length === 0) return [];

  let primary: string[];
  if (blocks.length > 1) {
    primary = blocks;
  } else {
    const only = blocks[0];
    if (only.length < 100 || looksLikeHtml(only) || /\n/.test(only)) {
      primary = blocks;
    } else {
      const sentences = only.split(SENTENCE_BOUNDARY).map((s) => s.trim()).filter(Boolean);
      primary = sentences.length > 1 ? sentences : blocks;
    }
  }

  const expanded: string[] = [];
  for (const b of primary) {
    if (b.length <= 280 || looksLikeHtml(b)) {
      expanded.push(b);
    } else {
      expanded.push(...splitLongPlainText(b, 280));
    }
  }
  return expanded;
}

const bubbleClass =
  "max-w-full rounded-2xl rounded-tl-sm border border-ithina-purple/15 bg-gradient-to-br from-ithina-purple/[0.08] to-ithina-purple/[0.03] px-3 py-2 text-[13px] leading-snug text-slate-200 shadow-sm";

/**
 * Returns one sanitized HTML fragment per chat bubble (paragraphs, sentence chunks,
 * or multiple `<p>` blocks from the API).
 */
export function getAssistantMessageChunks(raw: string): string[] {
  const trimmed = raw.replace(/\r\n/g, "\n").trim();
  if (!trimmed) return [];

  if (/<\s*p[\s>]/i.test(trimmed)) {
    const pMatches = [...trimmed.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)];
    if (pMatches.length > 1) {
      return pMatches.map((m) =>
        sanitizeHtml(m[1].trim().replace(/\n/g, "<br />")),
      );
    }
    return [sanitizeHtml(trimmed.replace(/\n/g, "<br />"))];
  }

  if (/<\s*ul[\s>]/i.test(trimmed) || /<\s*ol[\s>]/i.test(trimmed)) {
    return [sanitizeHtml(trimmed.replace(/\n/g, "<br />"))];
  }

  const blocks = toDisplayBlocks(trimmed);
  if (blocks.length === 0) return [sanitizeHtml(trimmed)];

  return blocks.map((block) => sanitizeHtml(block.replace(/\n/g, "<br />")));
}

/** Shared bubble styles for assistant message rows (used by chat UI). */
export const assistantBubbleClassName = bubbleClass;
