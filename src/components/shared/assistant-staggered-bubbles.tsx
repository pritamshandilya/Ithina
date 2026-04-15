import { ChevronDown, ChevronUp, Info, Pencil, Rocket, Zap } from "lucide-react";
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
      className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-ithina-purple/10 bg-ithina-purple/[0.04] px-3 py-2"
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

function ChipList({ intro, items }: { intro: string; items: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, CHIP_PREVIEW_COUNT);
  const remaining = items.length - CHIP_PREVIEW_COUNT;

  return (
    <div>
      {intro && <p className="mb-2 text-[13px] leading-snug text-slate-200">{intro}</p>}
      <div className="flex flex-wrap gap-1.5">
        {visible.map((item) => (
          <span
            key={item}
            className="rounded-full border border-ithina-purple/30 bg-ithina-purple/10 px-3 py-1 text-[12px] font-medium text-ithina-purple/90"
          >
            {item}
          </span>
        ))}
        {remaining > 0 && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex items-center gap-1 rounded-full border border-dashed border-ithina-purple/30 px-3 py-1 text-[12px] text-ithina-purple/60 transition-colors hover:border-ithina-purple/60 hover:text-ithina-purple"
          >
            + {remaining} more
            <ChevronDown className="size-3" />
          </button>
        )}
        {expanded && remaining > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="flex items-center gap-1 rounded-full border border-dashed border-ithina-purple/30 px-3 py-1 text-[12px] text-ithina-purple/60 transition-colors hover:border-ithina-purple/60 hover:text-ithina-purple"
          >
            − less
            <ChevronUp className="size-3" />
          </button>
        )}
      </div>
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
  onEditClick,
}: {
  card: SummaryCard;
  question?: string;
  note?: string;
  onEditClick?: () => void;
}) {
  const [launched, setLaunched] = useState(false);

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
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-[11px] text-slate-400">{row.label}</span>
                {row.badge ? (
                  <span className="rounded-full border border-ithina-purple/40 bg-ithina-purple/20 px-2.5 py-0.5 text-[11px] font-semibold text-ithina-purple/90">
                    {row.value}
                  </span>
                ) : (
                  <span className="max-w-[60%] text-right text-[12px] font-medium leading-snug text-slate-100">
                    {row.value}
                  </span>
                )}
              </div>
              {!isLastRow && (
                <div className={cn("mx-3 h-px", isLastInGroup ? "bg-white/[0.1]" : "bg-white/[0.04]")} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Follow-up question (full backend message, split from trailing note) ── */}
      {question && (
        <p
          className={cn(
            "mt-2.5 leading-snug text-slate-300",
            card.hasActions ? "text-[12px]" : "text-[13px]",
          )}
        >
          {question}
        </p>
      )}

      {/* ── Backend reminder / constraint text (e.g. "Remember, campaigns can run…") ── */}
      {note && (
        <div
          className="mt-2.5 flex gap-2.5 rounded-lg border border-ithina-amber/25 bg-ithina-amber/[0.07] px-3 py-2.5"
          role="note"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-ithina-amber" aria-hidden />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ithina-amber">
              Note
            </p>
            <p className="mt-1 text-[12px] leading-snug text-slate-300">{note}</p>
          </div>
        </div>
      )}

      {/* ── Action buttons (only when card is a full campaign proposal) ── */}
      {card.hasActions && (
        <div className="mt-2.5 flex gap-2">
          <button
            type="button"
            onClick={() => setLaunched(true)}
            disabled={launched}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-ithina-purple py-2.5 text-[13px] font-semibold text-white shadow-[0_0_16px_rgba(168,85,247,0.3)] transition-all hover:bg-ithina-purple-hover active:scale-[0.98] disabled:cursor-default disabled:opacity-90"
          >
            {launched ? (
              <>
                <Rocket className="size-4 shrink-0" aria-hidden />
                Launched!
              </>
            ) : (
              "Launch campaign"
            )}
          </button>
          <button
            type="button"
            onClick={onEditClick}
            className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-ithina-purple/30 bg-ithina-purple/10 px-4 py-2.5 text-[13px] font-medium text-ithina-purple/90 transition-all hover:bg-ithina-purple/20"
            aria-label="Edit campaign — focus chat and staging grid"
          >
            <Pencil className="size-3.5 shrink-0" aria-hidden />
            Edit
          </button>
        </div>
      )}
    </div>
  );
}

function OptionGrid({ intro, options }: { intro: string; options: OptionItem[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div>
      {intro && <p className="mb-2 text-[13px] leading-snug text-slate-200">{intro}</p>}
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => setSelected(opt.label)}
            className={cn(
              "rounded-xl border p-2.5 text-left transition-all",
              selected === opt.label
                ? "border-ithina-purple/70 bg-ithina-purple/15 shadow-[0_0_0_1px_theme(colors.ithina.purple/0.4)_inset]"
                : "border-ithina-purple/20 bg-white/[0.03] hover:border-ithina-purple/40 hover:bg-ithina-purple/10",
            )}
          >
            <span className="mb-1 block text-[17px]">{opt.icon}</span>
            <span className="block text-[12px] font-semibold leading-tight text-slate-100">
              {opt.label}
            </span>
            <span className="mt-0.5 block text-[10.5px] text-slate-400">{opt.sub}</span>
          </button>
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
  onEditCampaignSummary,
}: {
  chunk: AssistantMessageChunk;
  chunkIdx: number;
  messageKey: number;
  onEditCampaignSummary?: () => void;
}) {
  return (
    <div
      key={`${messageKey}-${chunkIdx}`}
      className={cn(
        assistantBubbleClassName,
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
        <ChipList intro={chunk.intro} items={chunk.items} />
      )}

      {chunk.kind === "summary-card" && (
        <SummaryCardView
          card={chunk.card}
          question={chunk.question}
          note={chunk.note}
          onEditClick={onEditCampaignSummary}
        />
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
  /** Campaign summary Edit — parent scrolls grid and focuses intent input. */
  onEditCampaignSummary?: () => void;
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
  onEditCampaignSummary,
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
    <div className="flex max-w-[95%] flex-col items-start gap-1.5">
      {chunks.slice(0, visibleCount).map((chunk, chunkIdx) => (
        <ChunkBubble
          key={`${messageKey}-${chunkIdx}`}
          chunk={chunk}
          chunkIdx={chunkIdx}
          messageKey={messageKey}
          onEditCampaignSummary={onEditCampaignSummary}
        />
      ))}
      {showThinking && <TypingDots />}
    </div>
  );
});

export default AssistantStaggeredBubbles;
