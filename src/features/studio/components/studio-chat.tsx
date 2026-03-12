import { ArrowRight, MessageCircle } from "lucide-react";
import { memo } from "react";

import ChatMessages from "@/components/shared/chat-messages";
import type { ChatMessage, StudioState } from "@/types/studio";

interface StudioChatProps {
  messages: ChatMessage[];
  isTyping: boolean;
  inputText: string;
  onInputChange: (v: string) => void;
  onSubmit: () => void;
  state: StudioState;
}

function StudioChat({ messages, isTyping, inputText, onInputChange, onSubmit, state }: StudioChatProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="flex min-h-[200px] flex-1 flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-xl">
      <header className="flex shrink-0 items-center gap-3 border-b border-ithina-border bg-white/[0.01] px-6 py-4">
        <div className="flex size-8 items-center justify-center rounded-lg border border-ithina-purple/20 bg-ithina-purple/10">
          <MessageCircle className="size-4 text-ithina-purple" />
        </div>
        <h2 className="text-sm font-semibold tracking-wide text-white">Creative Assistant</h2>
      </header>

      <ChatMessages messages={messages} isTyping={isTyping} />

      <div className="shrink-0 border-t border-ithina-border bg-ithina-bg/50 p-4">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            type="text"
            disabled={state === "choose"}
            placeholder={state === "choose" ? "Select a variant first..." : "Refine layout via chat..."}
            aria-label="Chat refinement input"
            className="w-full rounded-lg border border-ithina-border bg-ithina-bg py-3.5 pl-4 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-ithina-purple focus:outline-none disabled:opacity-50"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={state === "choose" || isTyping}
            aria-label="Send message"
            className="absolute right-2 rounded-lg p-1.5 text-ithina-muted transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <ArrowRight className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default memo(StudioChat);
