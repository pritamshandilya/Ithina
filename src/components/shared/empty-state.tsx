import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export default function EmptyState({
  title = "No data available",
  description = "Data will appear here once available.",
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-12 text-center", className)}>
      <Inbox className="size-10 text-slate-600" strokeWidth={1.5} />
      <h3 className="text-sm font-medium text-slate-400">{title}</h3>
      <p className="max-w-xs text-xs text-slate-500">{description}</p>
    </div>
  );
}
