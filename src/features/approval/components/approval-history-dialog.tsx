import { useMemo } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCampaignTimeline } from "@/hooks/use-campaigns";
import { formatCampaignDateTime } from "@/lib/format-datetime";

export interface ApprovalHistoryTarget {
  id: string;
  title: string;
}

interface ApprovalHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: ApprovalHistoryTarget | null;
}

function formatEventLine(ev: { event_type: string; message: string; created_at: string }) {
  const t = ev.event_type.replace(/_/g, " ");
  return { title: t, body: ev.message, when: ev.created_at };
}

export function ApprovalHistoryDialog({ open, onOpenChange, target }: ApprovalHistoryDialogProps) {
  const idForQuery = open && target?.id ? target.id : "";
  const { data: events = [], isLoading, isError, error } = useCampaignTimeline(idForQuery);

  const rows = useMemo(() => {
    if (!idForQuery) return [];
    return [...events]
      .filter((e) => e.is_visible_to_user !== false)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((ev) => {
        const line = formatEventLine(ev);
        return { ...line, id: ev.id };
      });
  }, [events, idForQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose className="max-w-lg max-h-[85vh] flex flex-col gap-0">
        <DialogHeader>
          <DialogTitle>Approval history</DialogTitle>
          <DialogDescription className="text-left">
            {target?.title ? (
              <span className="font-medium text-foreground">{target.title}</span>
            ) : (
              "Timeline for this campaign."
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto border-t border-border/40 py-3">
          {!idForQuery || !target ? null : isLoading ? (
            <p className="text-sm text-muted-foreground">Loading events…</p>
          ) : isError ? (
            <p className="text-sm text-destructive" role="alert">
              {(error as Error)?.message ?? "Could not load history."}
            </p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events yet for this campaign.</p>
          ) : (
            <ol className="space-y-4 border-l border-border/60 pl-4">
              {rows.map((r) => (
                <li key={r.id} className="relative pl-1">
                  <div className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-primary/80" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {r.title}
                  </p>
                  {r.body ? <p className="mt-0.5 text-sm text-foreground/90 whitespace-pre-wrap">{r.body}</p> : null}
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground/80">
                    {formatCampaignDateTime(r.when)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
