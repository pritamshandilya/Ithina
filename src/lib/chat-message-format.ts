import { sanitizeHtml } from "@/lib/sanitize";
import { formatIsoDateUsShort } from "@/lib/wizard-datetime";
import type { ChatSummaryEnrichment } from "@/types/wizard";

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

// ─── Structured chunk types ───────────────────────────────────────────────────

export interface SummaryCardRow {
  label: string;
  value: string;
  badge?: boolean;
}

export interface SummaryCard {
  intro: string;
  rows: SummaryCardRow[];
}

export interface OptionItem {
  icon: string;
  label: string;
  sub: string;
}

export type AssistantMessageChunk =
  | { kind: "markdown"; source: string }
  | { kind: "html"; html: string }
  | { kind: "chip-list"; intro: string; items: string[]; closing?: string }
  | { kind: "summary-card"; card: SummaryCard; question?: string; note?: string }
  | { kind: "option-grid"; intro: string; options: OptionItem[] };

function htmlChunk(html: string): AssistantMessageChunk {
  return { kind: "html", html };
}

function markdownChunk(source: string): AssistantMessageChunk {
  return { kind: "markdown", source };
}

// ─── List extraction helpers ──────────────────────────────────────────────────

/** Extract items from an HTML <ul> or <ol> block. */
function extractHtmlListItems(html: string): string[] {
  const matches = [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)];
  return matches.map((m) => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean);
}

/** Extract items from Markdown bullet lines (- item / * item / • item). */
function extractMarkdownListItems(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^[-*•]\s/.test(l))
    .map((l) => l.replace(/^[-*•]\s+/, "").trim())
    .filter(Boolean);
}

/** Parse SKU list lines like `NORMAL 55-inch TV — Buy this` / `… Get this free!`. */
function extractMainAndFreeFromBulletList(text: string): { main?: string; free?: string } {
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => /^[-*•]\s/.test(l));
  let main: string | undefined;
  let free: string | undefined;
  for (const line of lines) {
    const body = line.replace(/^[-*•]\s+/, "").trim();
    if (/buy\s+this/i.test(body)) {
      main = body
        .replace(/^(NORMAL|LOW\s+STOCK|OVERSTOCK)\s+/i, "")
        .replace(/\s*[—–-]\s*Buy\s+this.*$/i, "")
        .trim();
    }
    if (/get\s+this\s+free/i.test(body)) {
      free = body
        .replace(/^(NORMAL|LOW\s+STOCK|OVERSTOCK)\s+/i, "")
        .replace(/\s*[—–-].*$/i, "")
        .trim();
    }
  }
  return { main, free };
}

const SUMMARY_ROW_ORDER = ["Name", "Offer", "Main Item", "Free Item", "Start", "End", "Products"];

function reorderSummaryRows(rows: SummaryCardRow[]): SummaryCardRow[] {
  const byLabel = new Map(rows.map((r) => [r.label, r]));
  const out: SummaryCardRow[] = [];
  for (const label of SUMMARY_ROW_ORDER) {
    const r = byLabel.get(label);
    if (r) out.push(r);
  }
  for (const r of rows) {
    if (!out.some((x) => x.label === r.label)) out.push(r);
  }
  return out;
}

function mergeSummaryEnrichment(
  rows: SummaryCardRow[],
  enrichment?: ChatSummaryEnrichment | null,
): SummaryCardRow[] {
  if (!enrichment) return reorderSummaryRows(rows);
  const byLabel = new Map(rows.map((r) => [r.label, r]));

  const start = formatIsoDateUsShort(enrichment.scheduleStartIso);
  // Backend campaign_meta dates are source of truth; overwrite NLP-parsed dates.
  if (start) {
    byLabel.set("Start", { label: "Start", value: start });
  }
  const end = formatIsoDateUsShort(enrichment.scheduleEndIso);
  if (end) {
    byLabel.set("End", { label: "End", value: end });
  }
  const pl = enrichment.productsLabel?.trim();
  if (pl && !byLabel.has("Products") && !byLabel.has("Main Item") && !byLabel.has("Free Item")) {
    byLabel.set("Products", { label: "Products", value: pl });
  }

  const backendName = enrichment.campaignName?.trim();
  if (backendName) {
    byLabel.set("Name", { label: "Name", value: backendName });
  }

  return reorderSummaryRows(Array.from(byLabel.values()));
}

// ─── Summary-card detection ───────────────────────────────────────────────────

/**
 * Returns true when `text` looks like a campaign proposal — i.e. it mentions
 * a named campaign AND either a date range OR a promo offer type.
 * Works on the full raw string so sentence-split doesn't break detection.
 */
function looksLikeCampaignProposal(text: string): boolean {
  const hasName = /(?:call(?:ing)?(?:\s+it)?|campaign(?:\s+name)?|named?|title(?:d)?)[:\s]+['"]?[A-Z]/i.test(text)
    || /['"][A-Z][^'"]{2,40}['"]/i.test(text);

  const hasDate = /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}\b/i.test(text)
    || /\b\d{4}-\d{2}-\d{2}\b/.test(text)
    || /\b(?:this\s+(?:friday|saturday|sunday|monday|tuesday|wednesday|thursday)|next\s+\w+day)\b/i.test(text)
    || /\bApril\s+\d{1,2}\b|\bkick\s+(?:it\s+)?off\b/i.test(text);

  const hasOffer = /\b(?:bundle|bogo|buy.{0,10}get|discount|clearance|free\s+item|free\s+\w+)\b/i.test(text);

  return hasName && (hasDate || hasOffer);
}

/** Extract campaign name from quoted text or "call it …" patterns (no loose /i on trailing capture — avoids "name and schedule…"). */
function extractCampaignName(text: string): string | null {
  const quoted = text.match(/['"]([A-Z][^'"]{2,80})['"]/);
  if (quoted) return quoted[1].trim();
  const callQuoted = text.match(/call(?:ing)?(?:\s+it)?\s+['"]([^'"]+)['"]/i);
  if (callQuoted?.[1]) return callQuoted[1].trim();
  const campaignColon = text.match(/campaign\s+name\s*:\s*['"]?([A-Z][^\n.'"\!?]{2,60})/i);
  if (campaignColon?.[1]) return campaignColon[1].replace(/['"]\s*$/, "").trim();
  const bundleTitle = text.match(/\b((?:[A-Z][a-z]+\s+){1,4}Bundle)\b/);
  if (bundleTitle) return bundleTitle[1].trim();
  return null;
}

/** Extract promo offer type from text. */
function extractOfferType(text: string): string | null {
  const m = text.match(/\b(buy\s*\d\s*get\s*\d\s*free|bogo(?:f)?|bundle(?:\s+deal)?|clearance|[\d]+%\s*(?:off|discount)|free\s+\w+(?:\s+\w+)?)\b/i);
  return m ? m[0].trim() : null;
}

/** Extract a date from text that follows a trigger word like "kick it off", "Friday", etc. */
function extractDateNear(text: string, triggers: RegExp): string | null {
  const DATE_PATTERN = /(?:(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s*\d{4})?|\d{4}-\d{2}-\d{2}|(?:this\s+)?(?:friday|saturday|sunday|monday|tuesday|wednesday|thursday)(?:\s*,\s*(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?)?)/i;

  const m = text.match(new RegExp(triggers.source + "[^.]*?" + DATE_PATTERN.source, "i"));
  if (m) {
    const dateM = m[0].match(DATE_PATTERN);
    return dateM ? dateM[0].trim() : null;
  }
  return null;
}

function buildSummaryCard(allText: string, enrichment?: ChatSummaryEnrichment | null): SummaryCard | null {
  let rows: SummaryCardRow[] = [];

  // Campaign name
  const name = extractCampaignName(allText);
  if (name) rows.push({ label: "Name", value: name });

  // Offer type
  const offer = extractOfferType(allText);
  if (offer) rows.push({ label: "Offer", value: offer, badge: true });

  // Products mentioned: pairing X with Y, or N items/products
  const pairingMatch = allText.match(/(?:pair(?:ing)?\s+(?:the\s+)?(.{5,60}?)\s+with\s+(?:a\s+free\s+)?(.{5,60?})(?:\s+makes|\s+add|\s+would|\.|,))/i);
  if (pairingMatch) {
    rows.push({ label: "Main Item", value: pairingMatch[1].replace(/\*\*/g, "").trim() });
    rows.push({ label: "Free Item", value: pairingMatch[2].replace(/\*\*/g, "").trim() });
  } else {
    const fromBullets = extractMainAndFreeFromBulletList(allText);
    if (fromBullets.main) {
      rows.push({ label: "Main Item", value: fromBullets.main });
    }
    if (fromBullets.free) {
      rows.push({ label: "Free Item", value: fromBullets.free });
    }
    if (!fromBullets.main && !fromBullets.free) {
      const countMatch = allText.match(/\b(all\s+(?:three|two|four|five|\d+)|(\d+))\s+(?:food\s+)?(?:item|product|sku)s?\b/i);
      if (countMatch) {
        rows.push({ label: "Products", value: countMatch[0].trim() });
      }
    }
  }

  // Start date
  const start = extractDateNear(allText, /kick\s+(?:it\s+)?off(?:\s+this)?|start(?:ing)?(?:\s+(?:on|this))?|from\b/i);
  if (start) rows.push({ label: "Start", value: start });

  // End date
  const end = extractDateNear(allText, /run(?:ning)?\s+(?:it\s+)?through|end(?:ing)?(?:\s+on)?|through\b|until\b|to\b(?!\s+catch)/i);
  if (end && end !== start) rows.push({ label: "End", value: end });

  rows = mergeSummaryEnrichment(rows, enrichment);

  if (rows.length < 2) return null;

  // Intro is rendered separately (lead markdown chunk + deduped); keep card scannable.
  const intro = "";

  return { intro, rows };
}

// ─── Option-grid detection ────────────────────────────────────────────────────

const PROMO_TYPE_KEYWORDS = /buy.{0,10}get|bogo|percent|discount|bundle|clearance|bogof/i;

const PROMO_OPTION_MAP: Array<{ test: RegExp; icon: string; label: string; sub: string }> = [
  { test: /buy\s*\d\s*get\s*\d\s*free|bogo/i, icon: "🎁", label: "Buy 2 Get 1 Free", sub: "BOGO offer" },
  {
    test: /\bdiscount\b|percentage\s+off|\bpercent\b|%\s*(?:off|discount)/i,
    icon: "💸",
    label: "% Discount",
    sub: "10–50% off",
  },
  { test: /bundle|free\s+gift/i, icon: "📦", label: "Bundle Deal", sub: "Buy together, save" },
  { test: /clearance/i, icon: "🏷️", label: "Clearance", sub: "Overstock & expiry" },
];

/**
 * Split `• **Title** — description...` (or `–` / hyphen) into card label + body from the API string.
 * Icons are inferred from keywords only; all copy is dynamic.
 */
function parsePromoBulletLine(raw: string): OptionItem {
  const strippedBold = raw.replace(/\*\*/g, "").trim();
  let label: string;
  let sub: string;
  const em = strippedBold.match(/^(.+?)\s*[—–]\s+([\s\S]+)$/);
  const spacedHyphen = strippedBold.match(/^(.+?)\s+-\s+([\s\S]+)$/);
  if (em) {
    label = em[1].trim();
    sub = em[2].trim();
  } else if (spacedHyphen) {
    label = spacedHyphen[1].trim();
    sub = spacedHyphen[2].trim();
  } else {
    label = strippedBold;
    sub = "";
  }

  let icon = "✨";
  const forTest = strippedBold.toLowerCase();
  for (const opt of PROMO_OPTION_MAP) {
    if (opt.test.test(forTest)) {
      icon = opt.icon;
      break;
    }
  }
  return { icon, label, sub };
}

/** Text before the first markdown bullet line (intro paragraph for option-grid). */
function introBeforeMarkdownBullets(text: string): string {
  const lines = text.split("\n");
  const idx = lines.findIndex((l) => /^[-*•]\s/.test(l.trim()));
  if (idx <= 0) return "";
  return lines.slice(0, idx).join("\n").trim();
}

function tryBuildOptionGrid(text: string): AssistantMessageChunk | null {
  if (!PROMO_TYPE_KEYWORDS.test(text)) return null;

  const listItems = extractMarkdownListItems(text);
  const candidates = listItems.length >= 2 ? listItems : [text];

  const matched: OptionItem[] = [];
  for (const item of candidates) {
    const line = item.replace(/\*\*/g, "").trim();
    if (!PROMO_OPTION_MAP.some((opt) => opt.test.test(line))) continue;
    const parsed = parsePromoBulletLine(item);
    if (!matched.some((m) => m.label === parsed.label)) matched.push(parsed);
  }

  if (matched.length < 2) return null;

  const head = introBeforeMarkdownBullets(text);
  const intro = head || "What type of promotion?";

  return { kind: "option-grid", intro, options: matched };
}

/**
 * Explains Discount / BOGO / Bundle / Clearance in bullets — must run BEFORE campaign-summary
 * detection so staged wizard enrichment does not steal the closing question or reorder chunks.
 */
function tryBuildPromoTypesExplainerChunks(raw: string): AssistantMessageChunk[] | null {
  const trimmed = raw.replace(/\r\n/g, "\n").trim();
  const lines = trimmed.split("\n");
  let firstBullet = -1;
  let lastBullet = -1;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (/^[-*•]\s/.test(t)) {
      if (firstBullet < 0) firstBullet = i;
      lastBullet = i;
    }
  }
  if (firstBullet < 0) return null;

  const items = extractMarkdownListItems(trimmed);
  if (items.length < 2) return null;

  const options = items.map(parsePromoBulletLine).filter((o) => o.label.length > 0);
  if (options.length < 2) return null;

  const plain = trimmed.replace(/\*\*/g, "").toLowerCase();
  const promoContext = /\b(promotion|promo)\b/.test(plain);
  const explainsTypes =
    /\b(types of promotions?|main types|three main types)\b/.test(plain) ||
    /\bset up\b[\s\S]{0,48}\b(types|promotion)/i.test(plain) ||
    (promoContext && /discount|bogo|bundle|clearance/i.test(plain));

  if (!explainsTypes) return null;

  const intro = lines.slice(0, firstBullet).join("\n").trim();
  const closing = lines.slice(lastBullet + 1).join("\n").trim() || undefined;

  const out: AssistantMessageChunk[] = [
    {
      kind: "option-grid",
      intro: intro || "What type of promotion?",
      options,
    },
  ];
  if (closing) out.push(markdownChunk(closing));
  return out;
}

/** True when this sentence mostly repeats what the summary card already shows. */
function redundantWithCard(s: string, card: SummaryCard): boolean {
  const nameRow = card.rows.find((r) => r.label === "Name");
  const startRow = card.rows.find((r) => r.label === "Start");
  const endRow = card.rows.find((r) => r.label === "End");
  const t = s.trim();
  const lower = t.toLowerCase();

  if (nameRow?.value) {
    const nv = nameRow.value.trim();
    if (
      nv.length > 2 &&
      lower.includes(nv.toLowerCase()) &&
      /\b(how about|campaign name|for the (?:campaign )?name|call it|title\b|named\b)\b/i.test(t)
    ) {
      return true;
    }
  }
  if (
    (startRow?.value || endRow?.value) &&
    /\b(schedule|starting|start on|run(?:ning)?|through|until|weekend|kick off|i(?:'d)?\s+suggest)\b/i.test(lower)
  ) {
    if (/\b(apr(il)?|mon|tue|wed|thu|fri|sat|sun|monday|friday|sunday|\d{1,2}(?:st|nd|rd|th)|202\d)\b/i.test(lower)) {
      return true;
    }
  }
  return false;
}

function isNoteToneSentence(s: string): boolean {
  return /\b(remember|usually|traffic|capture|constraint|up to \d+\s*days|days from today|policy|tip:|that way|make sure)\b/i.test(s);
}

/**
 * Split backend prose into lead (short opener), closing question, and note (tips / post-question reminders)
 * while dropping sentences that duplicate the card rows.
 */
function extractSummaryNarrative(plainText: string, card: SummaryCard): {
  lead?: string;
  question?: string;
  note?: string;
} {
  const sentences = plainText
    .split(/(?<=[.!?])\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
  if (sentences.length === 0) return {};

  const questionIdxs = sentences.map((s, i) => (s.endsWith("?") ? i : -1)).filter((i) => i >= 0);
  const closingIdx =
    questionIdxs.length > 0 ? questionIdxs[questionIdxs.length - 1] : -1;

  if (closingIdx < 0) {
    const nr = sentences.filter((s) => !redundantWithCard(s, card));
    if (nr.length === 0) return {};
    const joined = nr.join(" ").trim();
    if (joined.length > 280) {
      return { note: joined };
    }
    return { lead: joined };
  }

  let question: string | undefined = sentences[closingIdx];
  const before = sentences.slice(0, closingIdx);
  const afterClosing = sentences.slice(closingIdx + 1);

  const nonRedundantBefore = before.filter((s) => !redundantWithCard(s, card));

  const noteFromMiddle = nonRedundantBefore.filter((s) => isNoteToneSentence(s) || s.length > 100);
  const leadCandidates = nonRedundantBefore.filter((s) => !noteFromMiddle.includes(s));

  let lead = leadCandidates.join(" ").trim() || undefined;
  if (lead && lead.length > 160) {
    lead = undefined;
  }

  const noteParts = [...noteFromMiddle, ...afterClosing].filter(Boolean);
  let note = noteParts.join(" ").trim() || undefined;

  if (question && redundantWithCard(question, card)) {
    question = undefined;
  }

  if (note && question && note.includes(question)) {
    note = note.replace(question, "").trim() || undefined;
  }

  return {
    lead,
    question: question?.trim(),
    note: note?.trim() || undefined,
  };
}

/** Last non-list line(s) ending with `?` — closing prompt; everything above is detail (e.g. markdown lists). */
function extractClosingQuestionParagraph(full: string): { before: string; closing: string } | null {
  const t = full.trim();
  if (!t.includes("?")) return null;

  const lines = t.split("\n");
  let closeStart = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line.endsWith("?")) continue;
    if (/^\s*[-*]\s/.test(raw) || /^\s*\d+\.\s/.test(raw)) continue;
    closeStart = i;
    break;
  }

  if (closeStart === -1) {
    const lastQ = t.lastIndexOf("?");
    if (lastQ === -1) return null;
    const nl = t.lastIndexOf("\n", lastQ);
    const closing = (nl === -1 ? t.slice(0, lastQ + 1) : t.slice(nl + 1, lastQ + 1)).trim();
    const before = (nl === -1 ? "" : t.slice(0, nl)).trim();
    if (!closing.endsWith("?")) return null;
    return { before, closing };
  }

  const closing = lines.slice(closeStart).join("\n").trim();
  const before = lines.slice(0, closeStart).join("\n").trim();
  return { before, closing };
}

/** Last short non-list paragraph (often apology / sign-off ending with `.`) so detail can move to prior bubbles. */
function extractClosingTailParagraph(full: string): { before: string; closing: string } | null {
  const t = full.trim();
  const paras = t.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (paras.length < 2) return null;
  const last = paras[paras.length - 1];
  if (last.length > 420) return null;
  if (/^\s*[-*]\s/m.test(last) || /^\s*\d+\.\s/m.test(last)) return null;
  const before = paras.slice(0, -1).join("\n\n").trim();
  if (before.length < 40) return null;
  return { before, closing: last };
}

function extractDetailAndClosing(full: string): { before: string; closing: string } | null {
  return extractClosingQuestionParagraph(full) ?? extractClosingTailParagraph(full);
}

const DETAIL_CHUNK_MAX = 720;

/** Pack paragraphs into staggered bubble-sized markdown chunks. */
function splitIntoMarkdownChunks(text: string, maxLen = DETAIL_CHUNK_MAX): string[] {
  const paras = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (paras.length === 0) return [];

  const out: string[] = [];
  let buf = "";

  const flush = () => {
    if (buf.trim()) out.push(buf.trim());
    buf = "";
  };

  const emitHardSlices = (p: string) => {
    let i = 0;
    while (i < p.length) {
      let end = Math.min(i + maxLen, p.length);
      if (end < p.length) {
        const nl = p.lastIndexOf("\n", end);
        const sp = p.lastIndexOf(" ", end);
        const cut = Math.max(nl > i + 24 ? nl : -1, sp > i + 24 ? sp : -1);
        if (cut !== -1) end = cut;
      }
      const slice = p.slice(i, end).trim();
      if (slice) out.push(slice);
      i = end;
      while (i < p.length && /\s/.test(p[i]!)) i++;
    }
  };

  for (const p of paras) {
    const candidate = buf ? `${buf}\n\n${p}` : p;
    if (candidate.length <= maxLen) {
      buf = candidate;
      continue;
    }
    flush();
    if (p.length <= maxLen) {
      buf = p;
      continue;
    }
    emitHardSlices(p);
  }
  flush();
  return out;
}

/**
 * Move long markdown out of the summary card into follow-up bubbles (possibly several chunks).
 * `note` then `question` so the closing line stays at the end for extraction.
 */
function partitionSummaryMarkdownTail(
  question: string | undefined,
  note: string | undefined,
): { cardQuestion?: string; cardNote?: string; detailMarkdownPieces: string[] } {
  const combined = [note, question].filter(Boolean).join("\n\n").trim();
  if (!combined) return { detailMarkdownPieces: [] };

  const newlineCount = combined.match(/\n/g)?.length ?? 0;
  const hasList = /(?:^|\n)\s*[-*]\s+\S/m.test(combined);
  const needsSplit =
    combined.length > 220 ||
    newlineCount >= 2 ||
    hasList ||
    /~~|`/.test(combined) ||
    newlineCount >= 4;

  if (!needsSplit) {
    return {
      cardQuestion: question,
      cardNote: note,
      detailMarkdownPieces: [],
    };
  }

  const extracted = extractDetailAndClosing(combined);
  if (!extracted) {
    return {
      detailMarkdownPieces: splitIntoMarkdownChunks(combined),
      cardQuestion: undefined,
      cardNote: undefined,
    };
  }

  const { before, closing } = extracted;
  if (!before.trim()) {
    return {
      cardQuestion: closing,
      cardNote: undefined,
      detailMarkdownPieces: [],
    };
  }

  return {
    detailMarkdownPieces: splitIntoMarkdownChunks(before.trim()),
    cardQuestion: closing,
    cardNote: undefined,
  };
}

// ─── Category chip-list detection ────────────────────────────────────────────

const CATEGORY_INTRO_RE =
  /categor(?:y|ies)|full\s+list\s+of\s+categories|list\s+of\s+categories|available\s+in\s+your\s+store|pick\s+a\s+categor/i;

/** True when list lines look like SKU/product rows (prices, stock, backtick badges, strikethrough). */
function looksLikeProductList(items: string[]): boolean {
  const productSignals = /\$[\d.,]+|~~|Stock:|→|`[^`\n]+`|⚠|✓|\bSKU\b|\bmargin\b/i;
  const hits = items.filter((i) => productSignals.test(i));
  return hits.length >= Math.ceil(items.length * 0.5);
}

/** One chip per category name; comma-separated substrings in a single bullet become multiple chips. */
function expandCategoryChipItems(rawItems: string[]): string[] {
  const out: string[] = [];
  for (const line of rawItems) {
    const cleaned = line
      .replace(/\*\*/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^[\s-•*]+/, "")
      .trim();
    if (!cleaned) continue;
    if (/[，,]/.test(cleaned) && cleaned.length < 200) {
      for (const p of cleaned.split(/[，,]\s*/)) {
        const t = p.trim();
        if (t) out.push(t);
      }
    } else {
      out.push(cleaned);
    }
  }
  return out;
}

function tryBuildChipList(
  intro: string,
  items: string[],
  closing?: string,
  expandCommas = false,
): AssistantMessageChunk | null {
  let list = items;
  if (expandCommas) {
    list = expandCategoryChipItems(items);
  }
  if (list.length < 3) return null;
  return {
    kind: "chip-list",
    intro,
    items: list,
    ...(closing?.trim() ? { closing: closing.trim() } : {}),
  };
}

/**
 * Split "intro paragraph + bullet categories + closing question" (markdown) into parts.
 * Used so we never drop the trailing sentence and can stagger intro / chips / closing.
 */
function extractCategoryListParts(text: string): {
  intro: string;
  items: string[];
  closing?: string;
} | null {
  const lines = text.split("\n");
  let firstBullet = -1;
  let lastBullet = -1;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (/^[-*•]\s/.test(t)) {
      if (firstBullet < 0) firstBullet = i;
      lastBullet = i;
    }
  }
  if (firstBullet < 0) return null;

  const items = extractMarkdownListItems(text);
  if (items.length < 3) return null;
  if (looksLikeProductList(items)) return null;

  const intro = lines.slice(0, firstBullet).join("\n").trim();
  const closingRaw = lines.slice(lastBullet + 1).join("\n").trim();

  const introLine = text.split("\n").find((l) => l.trim() && !/^[-*•]\s/.test(l.trim()))?.trim() ?? "";
  const matchesCategoryIntent =
    CATEGORY_INTRO_RE.test(introLine) || CATEGORY_INTRO_RE.test(intro) || items.length >= 8;
  if (!matchesCategoryIntent) return null;

  return {
    intro: intro || "Pick a category:",
    items,
    closing: closingRaw || undefined,
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

const bubbleClass =
  "max-w-full rounded-2xl rounded-tl-sm border border-ithina-purple/15 bg-gradient-to-br from-ithina-purple/[0.08] to-ithina-purple/[0.03] px-3 py-2 text-[13px] leading-snug text-slate-200 shadow-sm";

/** When the reply is only empty JSON, avoid showing raw `[]` / `{}` in the chat UI. */
function isTrivialStructuredPayload(trimmed: string): boolean {
  if (!trimmed) return true;
  try {
    const v = JSON.parse(trimmed) as unknown;
    if (v === null) return true;
    if (typeof v === "string" && v.trim() === "") return true;
    if (Array.isArray(v) && v.length === 0) return true;
    if (
      typeof v === "object" &&
      v !== null &&
      !Array.isArray(v) &&
      Object.keys(v as Record<string, unknown>).length === 0
    ) {
      return true;
    }
  } catch {
    /* not JSON — show as normal text */
  }
  return false;
}

const TRIVIAL_PAYLOAD_FALLBACK =
  "Thanks — I've noted that. Let me know if you'd like anything else.";

/**
 * Returns one fragment per chat bubble: Markdown (rendered in the UI), sanitized HTML,
 * chip-list, summary-card, or option-grid depending on what the API returned.
 */
export function getAssistantMessageChunks(
  raw: string,
  summaryEnrichment?: ChatSummaryEnrichment | null,
): AssistantMessageChunk[] {
  const trimmed = raw.replace(/\r\n/g, "\n").trim();
  if (!trimmed) return [];

  if (isTrivialStructuredPayload(trimmed)) {
    return [markdownChunk(TRIVIAL_PAYLOAD_FALLBACK)];
  }

  // Explains promo types (Discount / BOGO / …) — before campaign-summary so enrichment
  // does not merge unrelated draft_meta into this reply or reorder the closing question.
  const promoTypesChunks = tryBuildPromoTypesExplainerChunks(trimmed);
  if (promoTypesChunks) return promoTypesChunks;

  // Category chip-list — must run before campaign-summary. Otherwise enrichment +
  // `partitionSummaryMarkdownTail` turns the bullet block into plain markdown and
  // the UI shows a long list instead of pills inside assistant bubbles.
  if (/\n/.test(trimmed)) {
    const categoryParts = extractCategoryListParts(trimmed);
    if (categoryParts) {
      const intro = categoryParts.intro.trim() || "";
      const chip = tryBuildChipList(intro, categoryParts.items, categoryParts.closing, true);
      if (chip) {
        return [chip];
      }
    }
  }

  // Strip markdown bold markers for plain-text analysis only
  const plainText = trimmed.replace(/\*\*/g, "");

  // ── Campaign summary detection (runs on the whole raw text) ─────────────────
  // This catches multi-sentence AI responses before they get split into bubbles.
  // Enrichment fills Start/End/Products when the model omits them on follow-up turns.
  const proposalFromText = looksLikeCampaignProposal(plainText);
  const proposalFromEnrichment = Boolean(
    summaryEnrichment?.campaignName?.trim() ||
      summaryEnrichment?.scheduleStartIso ||
      summaryEnrichment?.scheduleEndIso ||
      summaryEnrichment?.productsLabel?.trim(),
  );
  if (proposalFromText || (proposalFromEnrichment && /bundle|campaign|offer|promo/i.test(plainText))) {
    const card = buildSummaryCard(plainText, summaryEnrichment);
    if (card) {
      const { lead, question, note } = extractSummaryNarrative(trimmed, card);
      const part = partitionSummaryMarkdownTail(question, note);
      const slimCard: SummaryCard = { ...card, intro: "" };
      const out: AssistantMessageChunk[] = [];
      if (lead?.trim()) out.push(markdownChunk(lead.trim()));
      out.push({
        kind: "summary-card",
        card: slimCard,
        question: part.cardQuestion,
        note: part.cardNote,
      });
      for (const piece of part.detailMarkdownPieces) {
        if (piece.trim()) out.push(markdownChunk(piece.trim()));
      }
      return out;
    }
  }

  // ── HTML paths ──────────────────────────────────────────────────────────────
  if (/<\s*p[\s>]/i.test(trimmed)) {
    const pMatches = [...trimmed.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)];
    if (pMatches.length > 1) {
      const blocks = pMatches.map((m) => m[1].trim().replace(/\n/g, " ").replace(/\*\*/g, ""));
      const combined = blocks.join(" ");

      const combinedProposal =
        looksLikeCampaignProposal(combined) ||
        (Boolean(
          summaryEnrichment?.campaignName?.trim() ||
            summaryEnrichment?.scheduleStartIso ||
            summaryEnrichment?.scheduleEndIso ||
            summaryEnrichment?.productsLabel?.trim(),
        ) &&
          /bundle|campaign|offer|promo/i.test(combined));
      if (combinedProposal) {
        const card = buildSummaryCard(combined, summaryEnrichment);
        if (card) {
          const htmlCombined = pMatches.map((m) => m[1].trim().replace(/\n/g, "\n")).join("\n\n");
          const { lead, question, note } = extractSummaryNarrative(
            htmlCombined || combined,
            card,
          );
          const part = partitionSummaryMarkdownTail(question, note);
          const slimCard: SummaryCard = { ...card, intro: "" };
          const out: AssistantMessageChunk[] = [];
          if (lead?.trim()) out.push(markdownChunk(lead.trim()));
          out.push({
            kind: "summary-card",
            card: slimCard,
            question: part.cardQuestion,
            note: part.cardNote,
          });
          for (const piece of part.detailMarkdownPieces) {
            if (piece.trim()) out.push(markdownChunk(piece.trim()));
          }
          return out;
        }
      }

      return pMatches.map((m) =>
        htmlChunk(sanitizeHtml(m[1].trim().replace(/\n/g, "<br />"))),
      );
    }

    // Single <p> — check for option-grid content
    const singleText = pMatches[0]?.[1]?.replace(/<[^>]+>/g, "") ?? trimmed;
    const optGrid = tryBuildOptionGrid(singleText);
    if (optGrid) return [optGrid];

    return [htmlChunk(sanitizeHtml(trimmed.replace(/\n/g, "<br />")))];
  }

  if (/<\s*ul[\s>]/i.test(trimmed) || /<\s*ol[\s>]/i.test(trimmed)) {
    const items = extractHtmlListItems(trimmed);
    const introMatch = trimmed.match(/^([\s\S]*?)(?=<ul|<ol)/i);
    const intro = introMatch ? introMatch[1].replace(/<[^>]+>/g, "").trim() : "";

    if (CATEGORY_INTRO_RE.test(intro) || items.length >= 5) {
      const afterMatch = trimmed.match(/<\/(?:ul|ol)>\s*([\s\S]*)$/i);
      const afterText = afterMatch?.[1]
        ?.replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .trim();
      const listChip = tryBuildChipList(
        intro.trim() || "Pick a category:",
        items,
        afterText,
        true,
      );
      if (listChip) {
        return [listChip];
      }
    }

    return [htmlChunk(sanitizeHtml(trimmed.replace(/\n/g, "<br />")))];
  }

  // ── Plain-text / Markdown paths ─────────────────────────────────────────────
  const blocks = toDisplayBlocks(trimmed);

  // Option-grid detection (plain text with promo type keywords)
  if (blocks.length <= 2) {
    const optGrid = tryBuildOptionGrid(plainText);
    if (optGrid) return [optGrid];
  }

  if (blocks.length === 0) return [markdownChunk(trimmed)];
  return blocks.map((block) => markdownChunk(block));
}

/** Shared bubble styles for assistant message rows (used by chat UI). */
export const assistantBubbleClassName = bubbleClass;
