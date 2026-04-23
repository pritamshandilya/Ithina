import { ArrowRight, Check, ChevronDown, Globe, MessageCircle, RotateCcw } from "lucide-react";
import { memo, useEffect, useRef } from "react";

import ChatMessages from "@/components/shared/chat-messages";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DEFAULT_LANGUAGE_CODE,
  PROMO_LANGUAGES,
  getLanguageOption,
  type LanguageCode,
  type LanguageOption,
} from "../lib/promo-languages";
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
  /** Quick-reply suggestion chips returned by the backend draft endpoint. */
  suggestions?: string[];
  onSuggestionClick?: (text: string) => void;
  /** Selected Promo Assistant reply language. Defaults to English when not provided. */
  language?: LanguageCode;
  onLanguageChange?: (code: LanguageCode) => void;
  /** Override the language options list. Defaults to `PROMO_LANGUAGES`. */
  languages?: readonly LanguageOption[];
  children?: React.ReactNode;
}

const ChatPanel = memo(function ChatPanel({
  messages,
  isTyping,
  inputText,
  onInputChange,
  onSubmit,
  onResetChat,
  inputDisabled,
  hasSplit,
  suggestions,
  onSuggestionClick,
  language = DEFAULT_LANGUAGE_CODE,
  onLanguageChange,
  languages = PROMO_LANGUAGES,
  children,
}: ChatPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectedLanguage = getLanguageOption(language);
  const showLanguageSelector = Boolean(onLanguageChange);

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
    if (isTyping || inputDisabled) return;
    const id = window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [isTyping, inputDisabled, messages.length]);

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
          {showLanguageSelector && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={`Reply language: ${selectedLanguage.nativeName}`}
                  title={`Reply language: ${selectedLanguage.nativeName} (${selectedLanguage.englishName})`}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-ithina-border/80 bg-white/[0.03] px-2 py-1.5 text-[11px] font-medium text-slate-300 transition-colors hover:border-ithina-purple/40 hover:bg-ithina-purple/10 hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-ithina-purple/60 disabled:pointer-events-none disabled:opacity-40"
                >
                  <Globe className="size-3.5" aria-hidden />
                  <span className="max-w-[72px] truncate">{selectedLanguage.nativeName}</span>
                  <ChevronDown className="size-3 opacity-70" aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={6} className="min-w-[220px]">
                <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  AI reply language
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {languages.map((lang) => {
                  const active = lang.code === selectedLanguage.code;
                  return (
                    <DropdownMenuItem
                      key={lang.code}
                      onSelect={(event) => {
                        event.preventDefault();
                        if (!active) onLanguageChange?.(lang.code);
                      }}
                      className="flex items-center gap-2 text-[12px]"
                    >
                      <Check
                        className={cn("size-3.5 shrink-0", active ? "text-ithina-purple" : "opacity-0")}
                        aria-hidden
                      />
                      <span className="flex-1 truncate font-medium text-white">{lang.nativeName}</span>
                      <span className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
                        {lang.code}
                      </span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
          {suggestions && suggestions.length > 0 && !isTyping && !inputDisabled && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {suggestions.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => onSuggestionClick?.(chip)}
                  className="rounded-xl border border-ithina-purple/25 bg-white/[0.04] px-3 py-2.5 text-left text-[12px] font-medium leading-snug text-slate-100 transition-all hover:border-ithina-purple/45 hover:bg-ithina-purple/10"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
          <div className="group flex min-w-0 items-center gap-2 rounded-xl border border-ithina-border/60 bg-ithina-bg px-2 py-2 shadow-inner transition-all duration-300 focus-within:border-ithina-purple/40 focus-within:shadow-[0_0_20px_rgba(168,85,247,0.08)]">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleIntentKeyDown}
              placeholder={selectedLanguage.inputPlaceholder}
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
});

export default ChatPanel;
