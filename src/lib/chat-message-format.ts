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
  /** When true the card renders Launch campaign / Edit action buttons. */
  hasActions?: boolean;
}

export interface OptionItem {
  icon: string;
  label: string;
  sub: string;
}

export type AssistantMessageChunk =
  | { kind: "markdown"; source: string }
  | { kind: "html"; html: string }
  | { kind: "chip-list"; intro: string; items: string[] }
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
  if (start && !byLabel.has("Start")) {
    byLabel.set("Start", { label: "Start", value: start });
  }
  const end = formatIsoDateUsShort(enrichment.scheduleEndIso);
  if (end && !byLabel.has("End")) {
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

  // Show action buttons when the card has a name + offer + at least one date/product
  const hasName = rows.some((r) => r.label === "Name");
  const hasOffer = rows.some((r) => r.label === "Offer");
  const hasDateOrProduct = rows.some((r) =>
    r.label === "Start" || r.label === "End" || r.label === "Products" ||
    r.label === "Main Item" || r.label === "Free Item",
  );
  const hasActions = hasName && hasOffer && hasDateOrProduct;

  return { intro, rows, hasActions };
}

// ─── Option-grid detection ────────────────────────────────────────────────────

const PROMO_TYPE_KEYWORDS = /buy.{0,10}get|bogo|percent|discount|bundle|clearance|bogof/i;

const PROMO_OPTION_MAP: Array<{ test: RegExp; icon: string; label: string; sub: string }> = [
  { test: /buy\s*\d\s*get\s*\d\s*free|bogo/i, icon: "🎁", label: "Buy 2 Get 1 Free", sub: "BOGO offer" },
  { test: /percent|%\s*(?:off|discount)/i, icon: "%", label: "% Discount", sub: "10–50% off" },
  { test: /bundle/i, icon: "📦", label: "Bundle Deal", sub: "Buy together, save" },
  { test: /clearance/i, icon: "🏷️", label: "Clearance", sub: "Overstock & expiry" },
];

function tryBuildOptionGrid(text: string): AssistantMessageChunk | null {
  if (!PROMO_TYPE_KEYWORDS.test(text)) return null;

  const listItems = extractMarkdownListItems(text);
  const candidates = listItems.length >= 2 ? listItems : [text];

  const matched: OptionItem[] = [];
  for (const item of candidates) {
    for (const opt of PROMO_OPTION_MAP) {
      if (opt.test.test(item) && !matched.find((m) => m.label === opt.label)) {
        matched.push({ icon: opt.icon, label: opt.label, sub: opt.sub });
      }
    }
  }

  if (matched.length < 2) return null;

  const introMatch = text.match(/^([^\n?]+\?)/);
  const intro = introMatch ? introMatch[1].trim() : "What type of promotion?";

  return { kind: "option-grid", intro, options: matched };
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

// ─── Category chip-list detection ────────────────────────────────────────────

const CATEGORY_INTRO_RE = /categor(?:y|ies)|available in your store|pick a categor/i;

function tryBuildChipList(intro: string, items: string[]): AssistantMessageChunk | null {
  if (items.length < 3) return null;
  return { kind: "chip-list", intro, items };
}

// ─── Main export ──────────────────────────────────────────────────────────────

const bubbleClass =
  "max-w-full rounded-2xl rounded-tl-sm border border-ithina-purple/15 bg-gradient-to-br from-ithina-purple/[0.08] to-ithina-purple/[0.03] px-3 py-2 text-[13px] leading-snug text-slate-200 shadow-sm";

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

  // Strip markdown bold markers for plain-text analysis only
  const plainText = trimmed.replace(/\*\*/g, "");

  // ── Campaign summary detection (runs FIRST on the whole raw text) ───────────
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
      const { lead, question, note } = extractSummaryNarrative(plainText, card);
      const slimCard: SummaryCard = { ...card, intro: "" };
      const out: AssistantMessageChunk[] = [];
      if (lead?.trim()) out.push(markdownChunk(lead.trim()));
      out.push({ kind: "summary-card", card: slimCard, question, note });
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
          const { lead, question, note } = extractSummaryNarrative(combined, card);
          const slimCard: SummaryCard = { ...card, intro: "" };
          const out: AssistantMessageChunk[] = [];
          if (lead?.trim()) out.push(markdownChunk(lead.trim()));
          out.push({ kind: "summary-card", card: slimCard, question, note });
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
      const chip = tryBuildChipList(intro || "Pick a category:", items);
      if (chip) return [chip];
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

  // Category chip-list from markdown bullet list
  if (/\n/.test(trimmed)) {
    const mdItems = extractMarkdownListItems(trimmed);
    const introLine = trimmed.split("\n").find((l) => !/^[-*•]/.test(l.trim()) && l.trim())?.trim() ?? "";
    if (mdItems.length >= 3 && (CATEGORY_INTRO_RE.test(introLine) || mdItems.length >= 8)) {
      const chip = tryBuildChipList(introLine || "Pick a category:", mdItems);
      if (chip) return [chip];
    }
  }

  if (blocks.length === 0) return [markdownChunk(trimmed)];
  return blocks.map((block) => markdownChunk(block));
}

/** Shared bubble styles for assistant message rows (used by chat UI). */
export const assistantBubbleClassName = bubbleClass;
