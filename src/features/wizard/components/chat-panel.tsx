import { ArrowRight, MessageCircle, RotateCcw } from "lucide-react";
import { memo, useEffect, useRef } from "react";

import ChatMessages from "@/components/shared/chat-messages";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/wizard";

interface ChatPanelProps {
  messages: ChatMessage[];
  isTyping: boolean;
  inputText: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  /** Clears chat history, staged SKUs, and draft session (NL wizard). */
  onResetChat?: () => void;
  inputDisabled?: boolean;
  hasSplit: boolean;
  children?: React.ReactNode;
}

function ChatPanel({
  messages,
  isTyping,
  inputText,
  onInputChange,
  onSubmit,
  onResetChat,
  inputDisabled,
  hasSplit,
  children,
}: ChatPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleIntentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault();
    if (isTyping || inputDisabled) return;
    if (!inputText.trim()) return;
    onSubmit();
  };

  useEffect(() => {
    if (!isTyping && !inputDisabled) {
      textareaRef.current?.focus();
    }
  }, [isTyping, inputDisabled]);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-ithina-border/60 bg-ithina-panel shadow-xl transition-all duration-500",
        hasSplit ? "h-full min-h-0 w-full flex-1" : "w-full shrink-0",
      )}
    >
      {hasSplit && (
        <header className="flex shrink-0 items-center gap-2 border-b border-ithina-border/50 bg-white/[0.01] px-4 py-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg border border-ithina-purple/20 bg-ithina-purple/10 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
            <MessageCircle className="size-3.5 text-ithina-purple" />
          </div>
          <h2 className="min-w-0 flex-1 text-sm font-semibold tracking-wide text-white">Promo Assistant</h2>
          {onResetChat && (
            <button
              type="button"
              onClick={onResetChat}
              disabled={isTyping || inputDisabled}
              aria-label="Reset chat and clear staged SKUs"
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-ithina-border/80 bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-slate-400 transition-colors hover:border-ithina-purple/40 hover:bg-ithina-purple/10 hover:text-white disabled:pointer-events-none disabled:opacity-40"
            >
              <RotateCcw className="size-3.5" aria-hidden />
              Reset
            </button>
          )}
        </header>
      )}

      {hasSplit && (
        <ChatMessages messages={messages} isTyping={isTyping} className="p-2.5" />
      )}

      <div className={cn("shrink-0 bg-ithina-bg/40", hasSplit ? "mt-auto border-t border-ithina-border/50 p-4" : "p-4")}>
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
          <div className="group flex min-w-0 items-center gap-2 rounded-xl border border-ithina-border/60 bg-ithina-bg px-2 py-2 shadow-inner transition-all duration-300 focus-within:border-ithina-purple/40 focus-within:shadow-[0_0_20px_rgba(168,85,247,0.08)]">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleIntentKeyDown}
              placeholder="Describe your promotion intent..."
              aria-label="Promotion intent input"
              rows={2}
              className="chat-panel-intent-textarea min-h-[2.75rem] min-w-0 flex-1 resize-none bg-transparent py-2 pl-3 pr-2 text-sm leading-relaxed text-white placeholder:text-slate-500 focus:outline-none disabled:opacity-50"
              disabled={inputDisabled}
              autoComplete="off"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="flex size-8 shrink-0 items-center justify-center self-center rounded-lg bg-white/[0.04] text-slate-400 transition-all duration-200 hover:bg-ithina-purple hover:text-white hover:shadow-[0_0_12px_rgba(168,85,247,0.3)] disabled:opacity-50"
              disabled={isTyping || inputDisabled}
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
          {children}
        </form>
      </div>
    </div>
  );
}

export default memo(ChatPanel);
