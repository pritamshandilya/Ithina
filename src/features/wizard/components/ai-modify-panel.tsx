import { ArrowRight, ChevronLeft, Clock, MessageSquare, Plus, Trash2, Zap } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import ChatMarkdown from "@/components/shared/chat-markdown";
import { cn } from "@/lib/utils";

export interface AiChatMessage {
  role: "user" | "ai";
  text: string;
}

export interface AiChatSession {
  id: string;
  title: string;
  messages: AiChatMessage[];
  createdAt: number;
}

const AI_MODIFY_REPLIES = [
  "Updated! Header is now bolder and the price font has been increased.",
  "Applied — changed the colour scheme as requested.",
  "Done. Added the urgency badge to the top-right corner.",
  "Layout adjusted. The product name now appears above the price.",
  "Regenerating with your changes applied to the selected variant...",
  "Colour contrast improved. The background is now darker for better readability.",
  "Font weight updated to bold for the price element.",
  "The promotional badge position has been shifted to the top-left.",
];

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function deriveTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim();
  if (trimmed.length <= 30) return trimmed;
  return `${trimmed.slice(0, 28)}…`;
}

function createNewSession(): AiChatSession {
  return {
    id: generateSessionId(),
    title: `New Chat`,
    messages: [],
    createdAt: Date.now(),
  };
}

function timeLabel(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return `${Math.floor(diff / 3_600_000)}h ago`;
}

export interface AiModifyPanelLiveConfig {
  disabled?: boolean;
  isRefining: boolean;
  onSend: (message: string) => void;
  /** When this changes to a new non-empty string, an AI reply bubble is appended. */
  lastAiResponse?: string;
}

interface AiModifyPanelProps {
  resetKey?: number;
  live?: AiModifyPanelLiveConfig;
}

function AiModifyPanelLive({
  resetKey,
  disabled,
  isRefining,
  onSend,
  lastAiResponse,
}: { resetKey?: number } & AiModifyPanelLiveConfig) {
  const [sessions, setSessions] = useState<AiChatSession[]>(() => [createNewSession()]);
  const [activeId, setActiveId] = useState<string>(() => sessions[0].id);
  const [chatInput, setChatInput] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const prevAiResponseRef = useRef<string | undefined>(undefined);
  /** Session that should receive the next `lastAiResponse` (set when user sends in live mode). */
  const pendingReplySessionIdRef = useRef<string | null>(null);

  const activeSession = sessions.find((s) => s.id === activeId) ?? sessions[0];

  useEffect(() => {
    if (resetKey !== undefined) {
      const fresh = createNewSession();
      setSessions([fresh]);
      setActiveId(fresh.id);
      setChatInput("");
      setHistoryOpen(false);
      prevAiResponseRef.current = undefined;
      pendingReplySessionIdRef.current = null;
    }
  }, [resetKey]);

  useEffect(() => {
    if (!isRefining) inputRef.current?.focus();
  }, [isRefining]);

  // Route API AI text to the session that triggered the request
  useEffect(() => {
    if (!lastAiResponse || lastAiResponse === prevAiResponseRef.current) return;
    prevAiResponseRef.current = lastAiResponse;
    const targetId = pendingReplySessionIdRef.current ?? activeId;
    pendingReplySessionIdRef.current = null;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === targetId ? { ...s, messages: [...s.messages, { role: "ai", text: lastAiResponse }] } : s,
      ),
    );
  }, [lastAiResponse, activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession.messages, isRefining, activeId]);

  useEffect(() => {
    if (!historyOpen) inputRef.current?.focus();
  }, [activeId, historyOpen]);

  const addNewTab = useCallback(() => {
    const fresh = createNewSession();
    setSessions((prev) => [...prev, fresh]);
    setActiveId(fresh.id);
    setChatInput("");
    setHistoryOpen(false);
  }, []);

  const switchSession = useCallback((id: string) => {
    setActiveId(id);
    setChatInput("");
    setHistoryOpen(false);
  }, []);

  const deleteSession = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setSessions((prev) => {
        if (prev.length === 1) {
          const fresh = createNewSession();
          setActiveId(fresh.id);
          setHistoryOpen(false);
          prevAiResponseRef.current = undefined;
          pendingReplySessionIdRef.current = null;
          return [fresh];
        }
        const idx = prev.findIndex((s) => s.id === id);
        const next = prev.filter((s) => s.id !== id);
        if (id === activeId) {
          const newActive = next[Math.max(0, idx - 1)];
          setActiveId(newActive.id);
          setHistoryOpen(false);
        }
        return next;
      });
      setChatInput("");
    },
    [activeId],
  );

  const send = useCallback(() => {
    const text = chatInput.trim();
    if (!text || isRefining || disabled) return;
    pendingReplySessionIdRef.current = activeId;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeId) return s;
        const updated: AiChatMessage[] = [...s.messages, { role: "user", text }];
        const title = s.messages.length === 0 ? deriveTitle(text) : s.title;
        return { ...s, messages: updated, title };
      }),
    );
    setChatInput("");
    onSend(text);
  }, [chatInput, isRefining, disabled, onSend, activeId]);

  return (
    <div className="relative flex w-64 shrink-0 flex-col overflow-hidden border-l border-ithina-border bg-ithina-bg/20">
      {/* History drawer */}
      <div
        className={cn(
          "absolute inset-0 z-10 flex flex-col bg-ithina-sidebar transition-transform duration-200 ease-out",
          historyOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-ithina-border/60 px-3 py-2.5">
          <button
            type="button"
            onClick={() => setHistoryOpen(false)}
            className="flex size-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label="Close history"
          >
            <ChevronLeft className="size-3.5" strokeWidth={2.5} />
          </button>
          <p className="flex-1 text-xs font-semibold text-white">Chat History</p>
          <button
            type="button"
            onClick={addNewTab}
            title="New chat"
            className="flex size-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-ithina-purple/15 hover:text-ithina-purple"
            aria-label="New chat"
          >
            <Plus className="size-3.5" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2">
          {sessions.map((s) => {
            const isActive = s.id === activeId;
            const preview = s.messages.find((m) => m.role === "user")?.text ?? "No messages yet";
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => switchSession(s.id)}
                className={cn(
                  "group relative flex w-full flex-col gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-all",
                  isActive
                    ? "border-ithina-purple/40 bg-ithina-purple/10"
                    : "border-transparent hover:border-ithina-border hover:bg-white/[0.04]",
                )}
              >
                {isActive && (
                  <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-ithina-purple" />
                )}
                <div className="flex items-center gap-1.5 pr-4">
                  <MessageSquare className="size-3 shrink-0 text-ithina-purple/60" strokeWidth={2} aria-hidden />
                  <p className={cn("truncate text-[11px] font-semibold", isActive ? "text-white" : "text-slate-300")}>
                    {s.title}
                  </p>
                </div>
                <p className="truncate pl-[18px] text-[10px] text-slate-600">{preview}</p>
                <div className="flex items-center justify-between pl-[18px]">
                  <span className="text-[9px] text-slate-700">{timeLabel(s.createdAt)}</span>
                  <span className="text-[9px] text-slate-700">
                    {s.messages.length} msg{s.messages.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => deleteSession(e, s.id)}
                  className="absolute bottom-2 right-2 flex size-5 items-center justify-center rounded-md text-slate-700 opacity-0 transition-all hover:bg-red-500/15 hover:text-red-400 group-hover:opacity-100"
                  aria-label={`Delete ${s.title}`}
                >
                  <Trash2 className="size-3" strokeWidth={2} />
                </button>
              </button>
            );
          })}
        </div>

        <div className="shrink-0 border-t border-ithina-border/40 px-3 py-2">
          <p className="text-[9px] text-slate-700">
            {sessions.length} session{sessions.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex shrink-0 items-center gap-2 border-b border-ithina-border/60 px-3 py-2.5">
        <div className="flex size-5 items-center justify-center rounded-md bg-ithina-purple/15">
          <Zap className="size-3 text-ithina-purple" strokeWidth={2} aria-hidden />
        </div>
        <p className="flex-1 text-xs font-semibold text-white">AI Modify</p>
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          title="Chat history"
          className="flex size-6 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
          aria-label="View chat history"
        >
          <Clock className="size-3.5" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={addNewTab}
          title="New chat"
          className="flex size-6 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-ithina-purple/15 hover:text-ithina-purple"
          aria-label="New chat session"
        >
          <Plus className="size-3.5" strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-b border-ithina-border/40 bg-ithina-purple/5 px-3 py-1.5">
        <span className="size-1.5 shrink-0 rounded-full bg-ithina-purple" />
        <p className="min-w-0 flex-1 truncate text-[10px] font-medium text-slate-400">{activeSession.title}</p>
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          className="shrink-0 text-[9px] text-ithina-purple/60 hover:text-ithina-purple"
        >
          switch
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
        {activeSession.messages.length === 0 && !isRefining && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6">
            <div className="flex size-9 items-center justify-center rounded-full bg-ithina-purple/10">
              <Zap className="size-4.5 text-ithina-purple/60" strokeWidth={1.5} aria-hidden />
            </div>
            <p className="text-center text-[10px] leading-relaxed text-slate-600">
              Describe changes to apply.
              <br />
              <span className="text-slate-700">&quot;Make header green&quot;</span>
            </p>
          </div>
        )}

        {activeSession.messages.map((m, idx) =>
          m.role === "user" ? (
            <div
              key={`${activeId}-u-${idx}`}
              className="ml-auto max-w-[92%] rounded-2xl bg-ithina-purple/20 px-3 py-2 text-xs text-slate-100"
            >
              {m.text}
            </div>
          ) : (
            <div
              key={`${activeId}-a-${idx}`}
              className="mr-auto max-w-[92%] rounded-2xl border border-white/[0.08] bg-ithina-panel px-3 py-2 text-xs text-slate-300"
            >
              <p className="mb-1 font-mono text-[9px] font-bold uppercase tracking-widest text-ithina-purple">AI</p>
              <ChatMarkdown content={m.text} className="text-[11px] leading-relaxed text-slate-300 [&_p]:mb-1 [&_p:last-child]:mb-0" />
            </div>
          ),
        )}

        {isRefining && (
          <div className="mr-auto inline-flex items-center gap-1.5 rounded-xl border border-ithina-purple/20 bg-ithina-purple/10 px-2.5 py-2">
            <span className="size-1.5 animate-pulse rounded-full bg-ithina-purple [animation-delay:0ms]" />
            <span className="size-1.5 animate-pulse rounded-full bg-ithina-purple [animation-delay:180ms]" />
            <span className="size-1.5 animate-pulse rounded-full bg-ithina-purple [animation-delay:360ms]" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex shrink-0 gap-2 border-t border-ithina-border/60 p-2.5">
        <input
          ref={inputRef}
          type="text"
          placeholder="Describe changes…"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              send();
            }
          }}
          disabled={disabled || isRefining}
          className="flex-1 rounded-lg border border-ithina-border bg-ithina-panel px-3 py-1.5 text-xs text-white placeholder:text-slate-600 transition-colors focus:border-ithina-purple focus:outline-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={send}
          disabled={isRefining || !chatInput.trim() || disabled}
          className="shrink-0 rounded-lg bg-ithina-purple p-1.5 text-white transition-colors hover:bg-ithina-purple-hover disabled:opacity-40"
          aria-label="Send"
        >
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function AiModifyPanel({ resetKey, live }: AiModifyPanelProps) {
  if (live) {
    return (
      <AiModifyPanelLive resetKey={resetKey} {...live} />
    );
  }

  const [sessions, setSessions] = useState<AiChatSession[]>(() => [createNewSession()]);
  const [activeId, setActiveId] = useState<string>(() => sessions[0].id);
  const [chatInput, setChatInput] = useState("");
  const [chatTyping, setChatTyping] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const typingTimerRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const activeSession = sessions.find((s) => s.id === activeId) ?? sessions[0];

  useEffect(() => {
    if (resetKey !== undefined) {
      const fresh = createNewSession();
      setSessions([fresh]);
      setActiveId(fresh.id);
      setChatInput("");
      setChatTyping(false);
      setHistoryOpen(false);
    }
  }, [resetKey]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession.messages, chatTyping]);

  useEffect(() => {
    if (!historyOpen) inputRef.current?.focus();
  }, [activeId, historyOpen]);

  const addNewTab = useCallback(() => {
    const fresh = createNewSession();
    setSessions((prev) => [...prev, fresh]);
    setActiveId(fresh.id);
    setChatInput("");
    setChatTyping(false);
    setHistoryOpen(false);
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
  }, []);

  const switchSession = useCallback((id: string) => {
    setActiveId(id);
    setChatInput("");
    setHistoryOpen(false);
  }, []);

  const deleteSession = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setSessions((prev) => {
        if (prev.length === 1) {
          const fresh = createNewSession();
          setActiveId(fresh.id);
          setHistoryOpen(false);
          return [fresh];
        }
        const idx = prev.findIndex((s) => s.id === id);
        const next = prev.filter((s) => s.id !== id);
        if (id === activeId) {
          const newActive = next[Math.max(0, idx - 1)];
          setActiveId(newActive.id);
          setHistoryOpen(false);
        }
        return next;
      });
      setChatInput("");
    },
    [activeId],
  );

  const sendChat = useCallback(() => {
    const text = chatInput.trim();
    if (!text || chatTyping) return;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeId) return s;
        const updatedMessages: AiChatMessage[] = [...s.messages, { role: "user", text }];
        const title = s.messages.length === 0 ? deriveTitle(text) : s.title;
        return { ...s, messages: updatedMessages, title };
      }),
    );
    setChatInput("");
    setChatTyping(true);

    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      const reply = AI_MODIFY_REPLIES[Math.floor(Math.random() * AI_MODIFY_REPLIES.length)];
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeId) return s;
          return { ...s, messages: [...s.messages, { role: "ai", text: reply }] };
        }),
      );
      setChatTyping(false);
    }, 1100);
  }, [chatInput, chatTyping, activeId]);

  return (
    <div className="relative flex w-64 shrink-0 flex-col overflow-hidden border-l border-ithina-border bg-ithina-bg/20">

      {/* ── History drawer (slides in over the chat area) ─────────────── */}
      <div
        className={cn(
          "absolute inset-0 z-10 flex flex-col bg-ithina-sidebar transition-transform duration-200 ease-out",
          historyOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Drawer header */}
        <div className="flex shrink-0 items-center gap-2 border-b border-ithina-border/60 px-3 py-2.5">
          <button
            type="button"
            onClick={() => setHistoryOpen(false)}
            className="flex size-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label="Close history"
          >
            <ChevronLeft className="size-3.5" strokeWidth={2.5} />
          </button>
          <p className="flex-1 text-xs font-semibold text-white">Chat History</p>
          <button
            type="button"
            onClick={addNewTab}
            title="New chat"
            className="flex size-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-ithina-purple/15 hover:text-ithina-purple"
            aria-label="New chat"
          >
            <Plus className="size-3.5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Session list */}
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2">
          {sessions.map((s) => {
            const isActive = s.id === activeId;
            const preview = s.messages.find((m) => m.role === "user")?.text ?? "No messages yet";
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => switchSession(s.id)}
                className={cn(
                  "group relative flex w-full flex-col gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-all",
                  isActive
                    ? "border-ithina-purple/40 bg-ithina-purple/10"
                    : "border-transparent hover:border-ithina-border hover:bg-white/[0.04]",
                )}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-ithina-purple" />
                )}
                <div className="flex items-center gap-1.5 pr-4">
                  <MessageSquare className="size-3 shrink-0 text-ithina-purple/60" strokeWidth={2} aria-hidden />
                  <p className={cn("truncate text-[11px] font-semibold", isActive ? "text-white" : "text-slate-300")}>
                    {s.title}
                  </p>
                </div>
                <p className="truncate pl-[18px] text-[10px] text-slate-600">{preview}</p>
                <div className="flex items-center justify-between pl-[18px]">
                  <span className="text-[9px] text-slate-700">{timeLabel(s.createdAt)}</span>
                  <span className="text-[9px] text-slate-700">
                    {s.messages.length} msg{s.messages.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={(e) => deleteSession(e, s.id)}
                  className="absolute bottom-2 right-2 flex size-5 items-center justify-center rounded-md text-slate-700 opacity-0 transition-all hover:bg-red-500/15 hover:text-red-400 group-hover:opacity-100"
                  aria-label={`Delete ${s.title}`}
                >
                  <Trash2 className="size-3" strokeWidth={2} />
                </button>
              </button>
            );
          })}
        </div>

        {/* Drawer footer */}
        <div className="shrink-0 border-t border-ithina-border/40 px-3 py-2">
          <p className="text-[9px] text-slate-700">
            {sessions.length} session{sessions.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ── Panel header ──────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center gap-2 border-b border-ithina-border/60 px-3 py-2.5">
        <div className="flex size-5 items-center justify-center rounded-md bg-ithina-purple/15">
          <Zap className="size-3 text-ithina-purple" strokeWidth={2} aria-hidden />
        </div>
        <p className="flex-1 text-xs font-semibold text-white">AI Modify</p>

        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          title="Chat history"
          className="flex size-6 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
          aria-label="View chat history"
        >
          <Clock className="size-3.5" strokeWidth={2} />
        </button>

        <button
          type="button"
          onClick={addNewTab}
          title="New chat"
          className="flex size-6 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-ithina-purple/15 hover:text-ithina-purple"
          aria-label="New chat session"
        >
          <Plus className="size-3.5" strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-b border-ithina-border/40 bg-ithina-purple/5 px-3 py-1.5">
        <span className="size-1.5 shrink-0 rounded-full bg-ithina-purple" />
        <p className="min-w-0 flex-1 truncate text-[10px] font-medium text-slate-400">
          {activeSession.title}
        </p>
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          className="shrink-0 text-[9px] text-ithina-purple/60 hover:text-ithina-purple"
        >
          switch
        </button>
      </div>

      {/* ── Chat messages ─────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
        {activeSession.messages.length === 0 && !chatTyping && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6">
            <div className="flex size-9 items-center justify-center rounded-full bg-ithina-purple/10">
              <Zap className="size-4.5 text-ithina-purple/60" strokeWidth={1.5} aria-hidden />
            </div>
            <p className="text-center text-[10px] leading-relaxed text-slate-600">
              Describe changes to apply.
              <br />
              <span className="text-slate-700">&quot;Make header green&quot;</span>
            </p>
          </div>
        )}

        {activeSession.messages.map((m, idx) => (
          <div
            key={`${m.role}-${idx}`}
            className={cn(
              "max-w-[92%]",
              m.role === "user"
                ? "ml-auto rounded-2xl bg-ithina-purple/20 px-3 py-2 text-sm text-slate-100"
                : "mr-auto rounded-2xl border border-white/80 bg-ithina-panel px-3.5 py-2.5 text-slate-200",
            )}
          >
            {m.role === "ai" && (
              <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ithina-purple">AI</p>
            )}
            <ChatMarkdown content={m.text} className="text-[12px] leading-relaxed" />
          </div>
        ))}

        {chatTyping && (
          <div className="mr-auto inline-flex items-center gap-1.5 rounded-xl border border-ithina-purple/20 bg-ithina-purple/10 px-2.5 py-2">
            <span className="size-1.5 animate-pulse rounded-full bg-ithina-purple [animation-delay:0ms]" />
            <span className="size-1.5 animate-pulse rounded-full bg-ithina-purple [animation-delay:180ms]" />
            <span className="size-1.5 animate-pulse rounded-full bg-ithina-purple [animation-delay:360ms]" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input area ────────────────────────────────────────────────── */}
      <div className="flex shrink-0 gap-2 border-t border-ithina-border/60 p-2.5">
        <input
          ref={inputRef}
          type="text"
          placeholder="Describe changes…"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendChat();
            }
          }}
          className="flex-1 rounded-lg border border-ithina-border bg-ithina-panel px-3 py-1.5 text-xs text-white placeholder:text-slate-600 transition-colors focus:border-ithina-purple focus:outline-none"
        />
        <button
          type="button"
          onClick={sendChat}
          disabled={chatTyping || !chatInput.trim()}
          className="shrink-0 rounded-lg bg-ithina-purple p-1.5 text-white transition-colors hover:bg-ithina-purple-hover disabled:opacity-40"
          aria-label="Send"
        >
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

export default memo(AiModifyPanel);
