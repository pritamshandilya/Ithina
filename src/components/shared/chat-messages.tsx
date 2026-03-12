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
        <div key={idx} className={cn("mb-4 flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
          {msg.role === "user" ? (
            <div className="max-w-[90%] rounded-2xl rounded-tr-sm border border-white/10 bg-white/5 px-4 py-3.5 text-[13px] leading-relaxed text-slate-200 shadow-sm">
              {msg.text}
            </div>
          ) : (
            <div className="max-w-[95%] rounded-2xl rounded-tl-sm border border-ithina-purple/20 bg-ithina-purple/10 px-4 py-3.5 text-[13px] leading-relaxed text-slate-200">
              <span className="mb-1.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-ithina-purple">
                <Zap className="size-3" />
                System
              </span>
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.text) }} />
            </div>
          )}
        </div>
      ))}
      {isTyping && (
        <div className="mb-5 flex gap-1.5 px-4 py-3" aria-label="AI is typing">
          <span className="size-1.5 animate-bounce rounded-full bg-ithina-purple [animation-delay:-0.32s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-ithina-purple [animation-delay:-0.16s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-ithina-purple" />
        </div>
      )}
    </div>
  );
}
