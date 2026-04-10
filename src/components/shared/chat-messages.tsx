import { useCallback, useEffect, useRef } from "react";



import AssistantStaggeredBubbles from "@/components/shared/assistant-staggered-bubbles";

import { cn } from "@/lib/utils";

import type { ChatMessage } from "@/types/wizard";



interface ChatMessagesProps {

  messages: ChatMessage[];

  isTyping: boolean;

  className?: string;

}



export default function ChatMessages({ messages, isTyping, className }: ChatMessagesProps) {

  const scrollRef = useRef<HTMLDivElement>(null);



  const scrollToBottom = useCallback(() => {

    requestAnimationFrame(() => {

      const el = scrollRef.current;

      if (el) el.scrollTop = el.scrollHeight;

    });

  }, []);



  useEffect(() => {

    scrollToBottom();

  }, [messages, isTyping, scrollToBottom]);



  return (

    <div ref={scrollRef} className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto scroll-smooth p-3", className)}>

      {messages.map((msg, idx) => (

        <div

          key={idx}

          className={cn(

            "mb-2 flex flex-col animate-[slideUp_0.3s_ease-out]",

            msg.role === "user" ? "items-end" : "items-start",

          )}

        >

          {msg.role === "user" ? (

            <div className="max-w-[90%] rounded-2xl rounded-tr-sm border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[13px] leading-snug text-slate-200 shadow-sm backdrop-blur-sm">

              {msg.text}

            </div>

          ) : (

            <AssistantStaggeredBubbles

              text={msg.text}

              messageKey={idx}

              onLayoutChange={scrollToBottom}

            />

          )}

        </div>

      ))}

      {isTyping && (

        <div className="mb-2 flex items-center gap-1.5 px-2 py-3 animate-[fadeIn_0.3s_ease-out]" aria-label="AI is typing">

          <span className="size-1.5 animate-bounce rounded-full bg-ithina-purple/80 [animation-delay:-0.32s]" />

          <span className="size-1.5 animate-bounce rounded-full bg-ithina-purple/80 [animation-delay:-0.16s]" />

          <span className="size-1.5 animate-bounce rounded-full bg-ithina-purple/80" />

        </div>

      )}

    </div>

  );

}

