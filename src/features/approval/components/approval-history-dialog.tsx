import { Calendar, CircleDot, History, MessageSquare, User } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCampaignTimeline } from "@/hooks/use-campaigns";
import { formatCampaignDateTime } from "@/lib/format-datetime";
import { cn } from "@/lib/utils";

export interface ApprovalHistoryTarget {
  id: string;
  title: string;
}

interface ApprovalHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: ApprovalHistoryTarget | null;
}

function formatTypeLabel(eventType: string) {
  return eventType.replace(/_/g, " ");
}

function formatActorLine(ev: { actor_type: string; user_id: string | null }): string {
  const role = ev.actor_type ? formatTypeLabel(ev.actor_type) : "System";
  if (ev.user_id) {
    return `${role} · ${ev.user_id.slice(0, 8)}…`;
  }
  return role;
}

function TimelineIcon({ eventType }: { eventType: string }) {
  const t = eventType.toLowerCase();
  const cls = "size-4 shrink-0 text-primary";
  if (t.includes("chat") || t.includes("message")) {
    return <MessageSquare className={cls} strokeWidth={2} aria-hidden />;
  }
  if (t.includes("submit") || t.includes("approval") || t.includes("pending")) {
    return <CircleDot className={cls} strokeWidth={2} aria-hidden />;
  }
  if (t.includes("publish") || t.includes("deploy") || t.includes("complete")) {
    return <History className={cls} strokeWidth={2} aria-hidden />;
  }
  return <History className={cls} strokeWidth={2} aria-hidden />;
}

function stepBadgeLabel(index: number): string | null {
  if (index === 0) return "Latest";
  if (index === 1) return "1 step ago";
  return `${index} steps ago`;
}

export function ApprovalHistoryDialog({ open, onOpenChange, target }: ApprovalHistoryDialogProps) {
  const idForQuery = open && target?.id ? target.id : "";
  const { data: events = [], isLoading, isError, error } = useCampaignTimeline(idForQuery);

  const rows = useMemo(() => {
    if (!idForQuery) return [];
    return [...events]
      .filter((e) => e.is_visible_to_user !== false)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [events, idForQuery]);

  const idShort = target?.id && target.id.length > 8 ? target.id.slice(0, 8) : (target?.id ?? "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose
        className="flex min-h-0 max-h-[min(90vh,760px)] w-[calc(100%-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="shrink-0 px-6 pb-4 pt-6">
          <div className="flex items-start gap-3 pr-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/35 bg-primary/15 text-primary">
              <History className="size-5" strokeWidth={2} aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <DialogTitle className="text-lg">Approval history</DialogTitle>
              <DialogDescription className="text-left">
                {target?.title ? (
                  <span className="font-medium text-foreground/90">{target.title}</span>
                ) : (
                  "Timeline for this campaign."
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain border-t border-ithina-border/50 px-6 py-4 scrollbar-gutter-stable"
          role="region"
          aria-label="Activity timeline"
        >
          {!idForQuery || !target ? null : isLoading ? (
            <p className="text-sm text-muted-foreground">Loading events…</p>
          ) : isError ? (
            <p className="text-sm text-destructive" role="alert">
              {(error as Error)?.message ?? "Could not load history."}
            </p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events yet for this campaign.</p>
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl border border-ithina-border/80 bg-ithina-bg/60 p-4 shadow-inner shadow-black/10">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Item details
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Campaign</p>
                    <p className="text-sm font-medium text-foreground">{target.title}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Campaign ID</p>
                    <p className="font-mono text-xs text-foreground/90">{idShort || "—"}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Activity timeline
                </p>
                <div className="relative ml-1 border-l-2 border-border/70 pl-6">
                  {rows.map((ev, index) => {
                    const isLatest = index === 0;
                    const typeLabel = formatTypeLabel(ev.event_type);
                    const badge = stepBadgeLabel(index);
                    return (
                      <div key={ev.id} className="relative pb-6 last:pb-0">
                        <div
                          className={cn(
                            "absolute -left-[29px] top-2 z-10 size-3.5 rounded-full border-2 border-ithina-panel",
                            isLatest ? "bg-primary shadow-[0_0_0_3px] shadow-primary/25" : "bg-muted-foreground/50",
                          )}
                          aria-hidden
                        />
                        <div
                          className={cn(
                            "overflow-hidden rounded-xl border text-left transition-colors",
                            isLatest
                              ? "border-primary/40 bg-primary/[0.08] ring-1 ring-primary/20"
                              : "border-ithina-border/80 bg-ithina-panel/40",
                          )}
                        >
                          <div
                            className={cn(
                              "flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2.5 sm:px-4",
                              isLatest
                                ? "border-primary/25 bg-primary/[0.06]"
                                : "border-ithina-border/50",
                            )}
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <TimelineIcon eventType={ev.event_type} />
                              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground/95">
                                {typeLabel}
                              </p>
                            </div>
                            {badge ? (
                              <span
                                className={cn(
                                  "shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold",
                                  isLatest
                                    ? "border-primary/30 bg-ithina-panel/80 text-primary"
                                    : "border-border/80 bg-ithina-bg/50 text-muted-foreground",
                                )}
                              >
                                {badge}
                              </span>
                            ) : null}
                          </div>
                          <div className="space-y-3 px-3 py-3 sm:px-4">
                            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-6">
                              <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                                <User className="size-3.5 shrink-0 opacity-80" aria-hidden />
                                <span className="text-foreground/85">{formatActorLine(ev)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="size-3.5 shrink-0 opacity-80" aria-hidden />
                                <time
                                  className="font-mono text-[11px] text-foreground/70"
                                  dateTime={ev.created_at}
                                >
                                  {formatCampaignDateTime(ev.created_at)}
                                </time>
                              </div>
                            </div>
                            {ev.message ? (
                              <div className="rounded-lg border border-border/50 bg-black/25 px-3 py-2.5">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  Message
                                </p>
                                <p className="mt-1.5 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                                  {ev.message}
                                </p>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t border-ithina-border/50 bg-ithina-panel px-6 py-3 sm:py-3">
          <DialogClose asChild>
            <Button type="button" className="min-w-[100px]">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
