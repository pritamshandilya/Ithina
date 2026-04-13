import type { Components } from "react-markdown";
import { memo } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

/**
 * APIs sometimes emit Unicode bullets (`•`) instead of Markdown list markers.
 * CommonMark ignores `•`, so lines collapse into one paragraph; normalize to `-`.
 */
function normalizeChatMarkdownSource(source: string): string {
  return source.replace(
    /^(\s*)[\u2022\u2023\u2043\u2219\u25AA\u25AB\u25E6\u00B7\u30FB][\s\u00A0]*/gm,
    "$1- ",
  );
}

const chatMarkdownComponents: Partial<Components> = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1 break-words pl-4">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1 break-words pl-4">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-snug">{children}</li>,
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
    return inline ? (
      <code
        className="rounded bg-white/10 px-1 py-px font-mono text-[0.85em] text-slate-100"
        {...props}
      >
        {children}
      </code>
    ) : (
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
    <div className={cn("min-w-0 break-words text-[13px] leading-snug text-slate-200", className)}>
      <Markdown remarkPlugins={[remarkGfm]} components={chatMarkdownComponents}>
        {normalized}
      </Markdown>
    </div>
  );
}

export default memo(ChatMarkdownInner);
