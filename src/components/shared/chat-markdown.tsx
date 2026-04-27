import type { Components } from "react-markdown";
import { memo } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

/** Inline inventory / promo status tokens from assistant markdown — maps to pill colors. */
const STATUS_BADGE_COLORS: Record<string, string> = {
  NORMAL: "bg-slate-700/60 text-slate-300",
  "EXPIRING SOON": "bg-amber-900/40 text-amber-300",
  EXPIRING: "bg-amber-900/40 text-amber-300",
  OVERSTOCK: "bg-blue-900/40 text-blue-300",
  "LOW STOCK": "bg-orange-900/40 text-orange-300",
  NEW: "bg-emerald-900/40 text-emerald-300",
  CLEARANCE: "bg-rose-900/40 text-rose-300",
  DAMAGED: "bg-red-900/40 text-red-300",
  RECALLED: "bg-red-900/50 text-red-300",
};

/**
 * APIs sometimes emit Unicode bullets (`•`) instead of Markdown list markers.
 * CommonMark ignores `•`, so lines collapse into one paragraph; normalize to `-`.
 *
 * Also fixes assistant product lines like `… Free | **⚠️margin**` where `|` can confuse
 * GFM/table parsing and glued `⚠️` + text collides under tight line-height.
 */
function normalizeChatMarkdownSource(source: string): string {
  let s = source.replace(
    /^(\s*)[\u2022\u2023\u2043\u2219\u25AA\u25AB\u25E6\u00B7\u30FB][\s\u00A0]*/gm,
    "$1- ",
  );

  // After sentence-join fixes elsewhere, some blobs still have ". *   " mid-line — GFM needs `*` at line start.
  s = s.replace(/([.!?])(\s+)(?=\*\s+)/g, "$1\n\n");

  s = s.replace(/^(\s*(?:[-*+]|\d+\.)\s+)([^\n]*?)\s\|\s/gm, "$1$2 · ");

  s = s.replace(/\u26A0\uFE0F?(?=[A-Za-z*]|-\d)/g, (m) => `${m} `);

  // "1) item" is not valid GFM — normalize to "1. item"
  s = s.replace(/^(\s*)(\d+)\)\s+(.+)$/gm, (_line, sp: string, n: string, rest: string) => `${sp}${n}. ${rest}`);

  // "1.  **Item**" — collapse extra spaces after the ordered-list marker for reliable GFM
  s = s.replace(/^(\s*\d+\.)\s{2,}/gm, "$1 ");

  // Mid-line ordered list: "...sentence. 1. **Item**" needs a newline before `1.`
  s = s.replace(/([.!?])(\s+)(?=\d+\.\s+)/g, "$1\n\n");

  // Standalone "•" mid-line (some models emit without newline)
  s = s.replace(/([.!?\u201d\u2019])\s*\u2022\s+/g, "$1\n- ");

  // LLMs often break bold around numbered lists: "**1. **2." → "**1.** **2.**"
  let prev: string;
  do {
    prev = s;
    s = s.replace(/\*\*(\d+)\.\s*\*\*(\d+)\./g, "**$1.** **$2.**");
  } while (s !== prev);

  // "**1. **Word" — close bold before prose
  s = s.replace(/\*\*(\d+)\.\s*\*\*(?=[A-Za-z])/g, "**$1.** ");

  return s;
}

const chatMarkdownComponents: Partial<Components> = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="my-2 list-outside list-disc space-y-1.5 break-words pl-5 marker:text-ithina-purple/70">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-outside list-decimal space-y-1.5 break-words pl-5 marker:font-mono marker:text-slate-400">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-[1.5]">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-slate-100">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-ithina-purple underline underline-offset-2"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  h1: ({ children }) => (
    <h1 className="mb-2 text-base font-semibold tracking-tight text-slate-100">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 text-[15px] font-semibold tracking-tight text-slate-100">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 text-[13px] font-semibold text-slate-100">{children}</h3>
  ),
  hr: () => <hr className="my-3 border-0 border-t border-white/15" />,
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-ithina-purple/40 pl-3 text-slate-300">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="my-2 max-w-full overflow-x-auto">
      <table className="w-full border-collapse text-left text-[12px] text-slate-200">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="border-b border-white/15">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-white/10">{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => (
    <th className="px-2 py-1.5 font-semibold text-slate-100">{children}</th>
  ),
  td: ({ children }) => <td className="px-2 py-1.5 align-top">{children}</td>,
  del: ({ children }) => <del className="text-slate-400 line-through">{children}</del>,
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-lg border border-white/10 bg-black/25 p-2 font-mono text-[12px] leading-relaxed text-slate-200">
      {children}
    </pre>
  ),
  code: ({ className, children, ...props }) => {
    const inline = !className;
    if (inline) {
      const text = String(children).trim().toUpperCase();
      const statusClass = STATUS_BADGE_COLORS[text];
      return (
        <code
          className={cn(
            "rounded px-1.5 py-px font-mono text-[1em] font-medium",
            statusClass ?? "bg-white/10 text-slate-100",
          )}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={cn("block whitespace-pre font-mono", className)} {...props}>
        {children}
      </code>
    );
  },
};

interface ChatMarkdownProps {
  content: string;
  className?: string;
}

function ChatMarkdownInner({ content, className }: ChatMarkdownProps) {
  const normalized = normalizeChatMarkdownSource(content);
  return (
    <div
      className={cn(
        "promo-chat-md min-w-0 break-words text-[13px] leading-snug text-slate-200",
        className,
      )}
    >
      <Markdown remarkPlugins={[remarkGfm]} components={chatMarkdownComponents}>
        {normalized}
      </Markdown>
    </div>
  );
}

export default memo(ChatMarkdownInner);
