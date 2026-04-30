import { ChevronDown, ChevronUp, Info, Zap } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import ChatMarkdown from "@/components/shared/chat-markdown";
import {
  assistantBubbleClassName,
  getAssistantMessageChunks,
  type AssistantMessageChunk,
  type OptionItem,
  type SummaryCard,
} from "@/lib/chat-message-format";
import { cn } from "@/lib/utils";
import type { ChatSummaryEnrichment } from "@/types/wizard";

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div
      className="flex w-fit max-w-full items-center gap-1.5 self-start rounded-2xl rounded-tl-sm border border-ithina-purple/[0.22] bg-gradient-to-br from-ithina-purple/[0.10] to-ithina-purple/[0.03] px-3 py-2 shadow-[0_4px_24px_rgba(168,85,247,0.13),0_1px_4px_rgba(0,0,0,0.22)] backdrop-blur-sm"
      aria-label="Ithina is typing"
      role="status"
    >
      <span className="size-1.5 animate-bounce rounded-full bg-ithina-purple/80 [animation-delay:-0.32s]" />
      <span className="size-1.5 animate-bounce rounded-full bg-ithina-purple/80 [animation-delay:-0.16s]" />
      <span className="size-1.5 animate-bounce rounded-full bg-ithina-purple/80" />
    </div>
  );
}

const CHIP_PREVIEW_COUNT = 5;

function ChipList({
  intro,
  items,
  closing,
}: {
  intro: string;
  items: string[];
  closing?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const normalizedItems = useMemo(
    () =>
      items
        .map((item) => item.replace(/\*\*/g, "").replace(/`([^`]+)`/g, "$1").trim())
        .filter(Boolean),
    [items],
  );
  const visible = expanded ? normalizedItems : normalizedItems.slice(0, CHIP_PREVIEW_COUNT);
  const remaining = normalizedItems.length - CHIP_PREVIEW_COUNT;

  return (
    <div className="min-w-0">
      {intro.trim() ? (
        <div className="mb-2.5 min-w-0 text-[13px] leading-snug text-slate-200 [&_p]:mb-1 [&_p:last-child]:mb-0">
          <ChatMarkdown content={intro} />
        </div>
      ) : null}
      {/* Chips sit in the same surface as the outer assistant bubble—no second bordered frame. */}
      <div className="flex flex-wrap gap-2">
        {visible.map((item, idx) => (
          <span
            key={`${idx}-${item}`}
            className="inline-flex max-w-full items-center rounded-full border border-ithina-purple/35 bg-ithina-purple/[0.1] px-3 py-1.5 text-[12px] font-medium leading-tight break-words text-ithina-purple/95"
          >
            {item}
          </span>
        ))}
        {remaining > 0 && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-ithina-purple/40 bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-ithina-purple/85 transition-colors hover:border-ithina-purple/60 hover:bg-ithina-purple/10 hover:text-ithina-purple"
          >
            + {remaining} more
            <ChevronDown className="size-3 shrink-0 opacity-80" />
          </button>
        )}
      </div>
      {expanded && remaining > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="mt-2 inline-flex items-center gap-1 rounded-full border border-dashed border-ithina-purple/40 bg-transparent px-3 py-1.5 text-[11px] text-ithina-purple/80 transition-colors hover:border-ithina-purple/55 hover:text-ithina-purple"
        >
          Show less
          <ChevronUp className="size-3" />
        </button>
      )}
      {closing?.trim() ? (
        <div className="mt-2.5 min-w-0 text-[13px] leading-snug text-slate-300 [&_p]:mb-1 [&_p:last-child]:mb-0">
          <ChatMarkdown content={closing} />
        </div>
      ) : null}
    </div>
  );
}

/** Labels that belong together in a visual group — a divider appears between groups. */
const CARD_GROUPS: string[][] = [
  ["Name", "Offer"],
  ["Start", "End"],
  ["Products", "Main Item", "Free Item"],
];

function getGroupIndex(label: string): number {
  return CARD_GROUPS.findIndex((g) => g.includes(label));
}

function SummaryCardView({
  card,
  question,
  note,
}: {
  card: SummaryCard;
  question?: string;
  note?: string;
}) {
  return (
    <div>
      {card.intro && (
        <p className="mb-2.5 text-[13px] leading-snug text-slate-200">{card.intro}</p>
      )}

      {/* ── Card rows ── */}
      <div className="rounded-xl border border-white/[0.09] bg-white/[0.04]">
        {card.rows.map((row, i) => {
          const curGroup = getGroupIndex(row.label);
          const nextRow = card.rows[i + 1];
          const nextGroup = nextRow ? getGroupIndex(nextRow.label) : -1;
          const isLastInGroup = curGroup !== nextGroup;
          const isLastRow = i === card.rows.length - 1;

          return (
            <div key={i}>
              <div
                className={cn(
                  "flex items-center justify-between gap-3 px-3",
                  row.badge ? "min-h-[2.875rem] py-3" : "py-2.5",
                )}
              >
                <span className="shrink-0 text-[11px] text-slate-400">{row.label}</span>
                {row.badge ? (
                  <span className="shrink-0 rounded-full border border-white/25 bg-ithina-purple px-2.5 py-1 text-[11px] font-semibold leading-tight text-white shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
                    {row.value}
                  </span>
                ) : (
                  <span className="max-w-[60%] text-right text-[12px] font-medium leading-snug text-slate-100">
                    {row.value}
                  </span>
                )}
              </div>
              {!isLastRow && (
                <div className={cn("mx-3 h-px shrink-0", isLastInGroup ? "bg-white/[0.1]" : "bg-white/[0.04]")} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Follow-up question (markdown: lists, bold, strikethrough, code) ── */}
      {question && (
        <div className="mt-2.5 min-w-0 text-[13px] leading-snug text-slate-300 [&_p]:text-inherit">
          <ChatMarkdown content={question} />
        </div>
      )}

      {/* ── Backend reminder / constraint text (e.g. "Remember, campaigns can run…") ── */}
      {note && (
        <div
          className="mt-2.5 flex gap-2.5 rounded-lg border border-ithina-amber/25 bg-ithina-amber/[0.07] px-3 py-2.5"
          role="note"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-ithina-amber" aria-hidden />
          <div className="min-w-0 text-[12px] leading-snug text-slate-300 [&_p]:mb-1 [&_p:last-child]:mb-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ithina-amber">
              Note
            </p>
            <div className="mt-1">
              <ChatMarkdown content={note} className="text-[12px] leading-snug text-slate-300" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OptionGridCard({
  opt,
  selected,
  onSelect,
}: {
  opt: OptionItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const sub = opt.sub?.trim() ?? "";
  const hasDetails = Boolean(sub);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "min-w-0 cursor-pointer rounded-xl border p-2.5 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-ithina-purple/55",
        selected
          ? "border-ithina-purple/70 bg-ithina-purple/15 shadow-[0_0_0_1px_theme(colors.ithina.purple/0.4)_inset]"
          : "border-ithina-purple/25 bg-white/[0.04] hover:border-ithina-purple/45 hover:bg-ithina-purple/10",
      )}
    >
      <span className="mb-1 block text-[17px] leading-none">{opt.icon}</span>
      <span className="block text-[13px] font-semibold leading-tight text-slate-100">{opt.label}</span>
      {hasDetails ? (
        <div
          className="mt-0.5 min-w-0"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {detailsOpen ? (
            <p
              className={cn(
                "text-[13px] leading-relaxed text-slate-300",
                "max-h-60 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]",
              )}
            >
              {sub}
            </p>
          ) : null}
          <button
            type="button"
            aria-expanded={detailsOpen}
            onClick={(e) => {
              e.stopPropagation();
              setDetailsOpen((v) => !v);
            }}
            className="mt-1.5 inline-flex items-center gap-0.5 rounded-md px-0 py-0.5 text-[12px] font-semibold text-ithina-purple/90 transition-colors hover:text-ithina-purple"
          >
            {detailsOpen ? (
              <>
                Hide details
                <ChevronUp className="size-3.5 shrink-0 opacity-90" aria-hidden />
              </>
            ) : (
              <>
                Show details
                <ChevronDown className="size-3.5 shrink-0 opacity-90" aria-hidden />
              </>
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function OptionGrid({ intro, options }: { intro: string; options: OptionItem[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="min-w-0">
      {intro.trim() ? (
        <div className="mb-2.5 min-w-0 text-[13px] font-medium leading-snug text-slate-100 [&_p]:mb-1 [&_p:last-child]:mb-0">
          <ChatMarkdown content={intro} />
        </div>
      ) : null}
      {/* items-start: neighbor cards stay top-aligned and compact when another card expands (no stretch-to-row). */}
      <div
        className={cn(
          "grid gap-2 items-start",
          options.length === 1 ? "grid-cols-1" : "grid-cols-2",
        )}
      >
        {options.map((opt) => (
          <OptionGridCard
            key={opt.label}
            opt={opt}
            selected={selected === opt.label}
            onSelect={() => setSelected(opt.label)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Bot name label ───────────────────────────────────────────────────────────

function BotLabel({ hidden }: { hidden?: boolean }) {
  return (
    <span
      className="mb-1 flex items-center gap-1.5 font-mono text-[9px] tracking-widest text-ithina-purple"
      aria-hidden={hidden}
    >
      <Zap className="size-3" aria-hidden />
      Ithina
    </span>
  );
}

// ─── Chunk renderer ───────────────────────────────────────────────────────────

function ChunkBubble({
  chunk,
  chunkIdx,
  messageKey,
}: {
  chunk: AssistantMessageChunk;
  chunkIdx: number;
  messageKey: number;
}) {
  // Plain text/markdown shrinks to content; structured blocks need full width for tables/grids.
  const isInline = chunk.kind === "markdown" || chunk.kind === "html";

  return (
    <div
      key={`${messageKey}-${chunkIdx}`}
      className={cn(
        assistantBubbleClassName,
        isInline ? "w-fit" : "w-full",
        chunk.kind === "html" && "[&_a]:text-ithina-purple [&_a]:underline",
      )}
    >
      <BotLabel hidden={chunkIdx > 0} />

      {chunk.kind === "html" && (
        <div dangerouslySetInnerHTML={{ __html: chunk.html }} />
      )}

      {chunk.kind === "markdown" && (
        <ChatMarkdown content={chunk.source} />
      )}

      {chunk.kind === "chip-list" && (
        <ChipList intro={chunk.intro} items={chunk.items} closing={chunk.closing} />
      )}

      {chunk.kind === "summary-card" && (
        <SummaryCardView card={chunk.card} question={chunk.question} note={chunk.note} />
      )}

      {chunk.kind === "option-grid" && (
        <OptionGrid intro={chunk.intro} options={chunk.options} />
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface AssistantStaggeredBubblesProps {
  text: string;
  /** Stable id for this message row (e.g. list index). Resets stagger when the assistant sends a new reply. */
  messageKey: number;
  onLayoutChange?: () => void;
  /** Draft schedule / staged SKUs when the model omits them in follow-up text. */
  summaryEnrichment?: ChatSummaryEnrichment | null;
}

/**
 * Renders assistant reply as one or more bubbles; structured content (chip-list,
 * summary-card, option-grid) is shown as rich UI components inside a single bubble.
 */
const AssistantStaggeredBubbles = memo(function AssistantStaggeredBubbles({
  text,
  messageKey,
  onLayoutChange,
  summaryEnrichment,
}: AssistantStaggeredBubblesProps) {
  const chunks = useMemo(
    () => getAssistantMessageChunks(text, summaryEnrichment),
    [text, summaryEnrichment],
  );
  const [visibleCount, setVisibleCount] = useState(1);
  const [showThinking, setShowThinking] = useState(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    clearTimers();
    if (chunks.length === 0) {
      setVisibleCount(0);
      setShowThinking(false);
      return;
    }
    if (chunks.length === 1) {
      setVisibleCount(1);
      setShowThinking(false);
      return;
    }

    setVisibleCount(1);
    setShowThinking(false);

    let cancelled = false;
    let visible = 1;

    const runStep = () => {
      if (cancelled || visible >= chunks.length) return;
      setShowThinking(true);
      const thinkMs = 620 + Math.floor(Math.random() * 480);
      const t = window.setTimeout(() => {
        if (cancelled) return;
        setShowThinking(false);
        visible += 1;
        setVisibleCount(visible);
        if (visible < chunks.length) {
          const gap = 160 + Math.floor(Math.random() * 140);
          const t2 = window.setTimeout(runStep, gap);
          timersRef.current.push(t2);
        }
      }, thinkMs);
      timersRef.current.push(t);
    };

    const t0 = window.setTimeout(runStep, 420);
    timersRef.current.push(t0);

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [text, messageKey, clearTimers, chunks.length]);

  useEffect(() => {
    onLayoutChange?.();
  }, [visibleCount, showThinking, chunks.length, onLayoutChange]);

  if (chunks.length === 0) return null;

  return (
    <div className="flex w-[95%] min-w-0 max-w-[95%] flex-col gap-1.5">
      {chunks.slice(0, visibleCount).map((chunk, chunkIdx) => (
        <ChunkBubble
          key={`${messageKey}-${chunkIdx}`}
          chunk={chunk}
          chunkIdx={chunkIdx}
          messageKey={messageKey}
        />
      ))}
      {showThinking && <TypingDots />}
    </div>
  );
});

export default AssistantStaggeredBubbles;
