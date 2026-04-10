import { Zap } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  assistantBubbleClassName,
  getAssistantMessageChunks,
} from "@/lib/chat-message-format";
import { cn } from "@/lib/utils";

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

interface AssistantStaggeredBubblesProps {
  text: string;
  /** Stable id for this message row (e.g. list index). Resets stagger when the assistant sends a new reply. */
  messageKey: number;
  onLayoutChange?: () => void;
}

/**
 * Renders assistant reply as multiple bubbles; reveals later bubbles after a short
 * “thinking” delay so multi-part replies feel conversational.
 */
const AssistantStaggeredBubbles = memo(function AssistantStaggeredBubbles({
  text,
  messageKey,
  onLayoutChange,
}: AssistantStaggeredBubblesProps) {
  const chunks = useMemo(() => getAssistantMessageChunks(text), [text]);
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
      {chunks.slice(0, visibleCount).map((html, chunkIdx) => (
        <div
          key={`${messageKey}-${chunkIdx}`}
          className={cn(
            assistantBubbleClassName,
            "[&_a]:text-ithina-purple [&_a]:underline",
          )}
        >
          <span
            className="mb-1 flex items-center gap-1.5 font-mono text-[9px] tracking-widest text-ithina-purple"
            aria-hidden={chunkIdx > 0}
          >
            <Zap className="size-3" aria-hidden />
            Ithina
          </span>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      ))}
      {showThinking && <TypingDots />}
    </div>
  );
});

export default AssistantStaggeredBubbles;
