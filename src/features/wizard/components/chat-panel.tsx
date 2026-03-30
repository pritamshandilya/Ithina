import { ArrowRight, MessageCircle } from "lucide-react";
import { memo } from "react";

import ChatMessages from "@/components/shared/chat-messages";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/wizard";

interface ChatPanelProps {
  messages: ChatMessage[];
  isTyping: boolean;
  inputText: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
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
  inputDisabled,
  hasSplit,
  children,
}: ChatPanelProps) {
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col overflow-hidden rounded-2xl border border-ithina-border/60 bg-ithina-panel shadow-xl transition-all duration-500",
        hasSplit ? "h-full w-[360px]" : "w-full",
      )}
    >
      {hasSplit && (
        <header className="flex shrink-0 items-center gap-3 border-b border-ithina-border/50 bg-white/[0.01] px-6 py-4">
          <div className="flex size-8 items-center justify-center rounded-lg border border-ithina-purple/20 bg-ithina-purple/10 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
            <MessageCircle className="size-4 text-ithina-purple" />
          </div>
          <h2 className="text-sm font-semibold tracking-wide text-white">Promo Assistant</h2>
        </header>
      )}

      {hasSplit && (
        <ChatMessages messages={messages} isTyping={isTyping} className="p-6" />
      )}

      <div className={cn("shrink-0 bg-ithina-bg/40", hasSplit ? "mt-auto border-t border-ithina-border/50 p-5" : "p-5")}>
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
          <div className="group relative flex items-center rounded-xl border border-ithina-border/60 bg-ithina-bg shadow-inner transition-all duration-300 focus-within:border-ithina-purple/40 focus-within:shadow-[0_0_20px_rgba(168,85,247,0.08)]">
            <input
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              type="text"
              placeholder="Describe your promotion intent..."
              aria-label="Promotion intent input"
              className="w-full bg-transparent py-4 pl-5 pr-14 text-sm text-white placeholder:text-slate-500 focus:outline-none disabled:opacity-50"
              disabled={inputDisabled}
              autoComplete="off"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="absolute right-3 flex size-8 items-center justify-center rounded-lg bg-white/[0.04] text-slate-400 transition-all duration-200 hover:bg-ithina-purple hover:text-white hover:shadow-[0_0_12px_rgba(168,85,247,0.3)] disabled:opacity-50"
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
