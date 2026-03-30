import { Zap } from "lucide-react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import type { ChatMessage } from "@/types/wizard";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isTyping: boolean;
  className?: string;
}

export default function ChatMessages({ messages, isTyping, className }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  return (
    <div ref={scrollRef} className={cn("flex flex-1 flex-col overflow-y-auto scroll-smooth p-5", className)}>
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={cn(
            "mb-4 flex flex-col animate-[slideUp_0.3s_ease-out]",
            msg.role === "user" ? "items-end" : "items-start",
          )}
        >
          {msg.role === "user" ? (
            <div className="max-w-[90%] rounded-2xl rounded-tr-sm border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-[13px] leading-relaxed text-slate-200 shadow-sm backdrop-blur-sm">
              {msg.text}
            </div>
          ) : (
            <div className="max-w-[95%] rounded-2xl rounded-tl-sm border border-ithina-purple/15 bg-gradient-to-br from-ithina-purple/[0.08] to-ithina-purple/[0.03] px-4 py-3.5 text-[13px] leading-relaxed text-slate-200 shadow-sm">
              <span className="mb-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-ithina-purple">
                <Zap className="size-3" />
                System
              </span>
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.text) }} />
            </div>
          )}
        </div>
      ))}
      {isTyping && (
        <div className="mb-5 flex items-center gap-1.5 px-4 py-3 animate-[fadeIn_0.3s_ease-out]" aria-label="AI is typing">
          <span className="size-1.5 animate-bounce rounded-full bg-ithina-purple/80 [animation-delay:-0.32s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-ithina-purple/80 [animation-delay:-0.16s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-ithina-purple/80" />
        </div>
      )}
    </div>
  );
}
