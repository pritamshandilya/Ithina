import { formatDistanceToNow } from "date-fns";
import { AlertCircle, FileEdit, LayoutGrid, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDraftAudits,
  useReturnedAudits,
  useAssignedShelves,
  useDeleteDraft,
} from "@/features/maker/hooks";
import { cn } from "@/lib/utils";
import type { Audit } from "@/types/maker";

export interface MakerAttentionSectionProps {
  onResume?: (auditId: string, shelfId: string) => void;
  onViewReport?: (auditId: string, shelfId: string) => void;
  onViewAll?: () => void;
  className?: string;
}

const MAX_ITEMS = 8;
/** Fixed height to match Assigned Shelves; content scrolls when it overflows */
const SECTION_HEIGHT = 420;

function getShelfName(audit: Audit, shelves?: { id: string; shelfName: string }[]) {
  const shelf = shelves?.find((s) => s.id === audit.shelfId);
  return shelf?.shelfName ?? `Shelf ${audit.shelfId.replace("shelf-", "")}`;
}

/**
 * "What Needs Your Attention" - compact list of returned and draft audits
 * with quick actions. Prioritizes returned (needs fix) over drafts.
 */
export function MakerAttentionSection({
  onResume,
  onViewReport,
  onViewAll,
  className,
}: MakerAttentionSectionProps) {
  const { data: drafts = [], isLoading: draftsLoading } = useDraftAudits();
  const { data: returned = [], isLoading: returnedLoading } = useReturnedAudits();
  const { data: shelves } = useAssignedShelves();
  const deleteDraftMutation = useDeleteDraft();

  const isLoading = draftsLoading || returnedLoading;

  // Prioritize returned, then drafts. Take up to MAX_ITEMS total.
  const attentionItems = [
    ...returned.slice(0, MAX_ITEMS).map((a) => ({ ...a, _type: "returned" as const })),
    ...drafts
      .slice(0, Math.max(0, MAX_ITEMS - returned.length))
      .map((a) => ({ ...a, _type: "draft" as const })),
  ];

  const hasItems = attentionItems.length > 0;

  const handleAction = (audit: Audit, action: "resume" | "fix" | "delete") => {
    if (action === "delete") {
      if (window.confirm("Delete this draft? This cannot be undone.")) {
        deleteDraftMutation.mutate(audit.id);
      }
      return;
    }
    if (action === "fix") onViewReport?.(audit.id, audit.shelfId);
    else onResume?.(audit.id, audit.shelfId);
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-6 w-48" />
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <div
          className="flex size-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: "color-mix(in oklch, var(--action-warning) 20%, transparent)" }}
          aria-hidden
        >
          <AlertCircle
            className="size-4"
            style={{ color: "var(--action-warning)" }}
            aria-hidden
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            What Needs Your Attention
          </h2>
          <p className="text-sm text-muted-foreground">
            {hasItems
              ? "Returned audits and drafts requiring action"
              : "You're all caught up"}
          </p>
        </div>
      </div>

      <div
        className="rounded-xl border border-border bg-card overflow-hidden flex flex-col shrink-0"
        style={{ height: SECTION_HEIGHT }}
      >
        {!hasItems ? (
          <div className="flex flex-1 flex-col items-center justify-center py-12 px-6 text-center min-h-0">
            <div
              className="flex size-12 items-center justify-center rounded-full mb-3"
              style={{ backgroundColor: "color-mix(in oklch, var(--maker-approved) 15%, transparent)" }}
              aria-hidden
            >
              <LayoutGrid
                className="size-6"
                style={{ color: "var(--maker-approved)" }}
                aria-hidden
              />
            </div>
            <p className="font-medium text-foreground">All caught up</p>
            <p className="text-sm text-muted-foreground mt-1">
              No returned audits or drafts. Start a new audit when ready.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 overflow-auto">
              <ul className="divide-y divide-border" role="list">
                {attentionItems.map((item) => {
              const isReturned = item._type === "returned";
              const shelfName = getShelfName(item, shelves);
              const date = item.submittedAt || item.draftSavedAt;

              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        isReturned
                          ? "bg-destructive/10"
                          : "bg-accent/10"
                      )}
                      aria-hidden
                    >
                      {isReturned ? (
                        <AlertCircle
                          className="size-4"
                          style={{ color: "var(--destructive)" }}
                          aria-hidden
                        />
                      ) : (
                        <FileEdit
                          className="size-4"
                          style={{ color: "var(--accent)" }}
                          aria-hidden
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">
                        {shelfName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {date
                          ? formatDistanceToNow(new Date(date), { addSuffix: true })
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isReturned ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-destructive/50 text-destructive hover:bg-destructive/10"
                        onClick={() => handleAction(item, "fix")}
                      >
                        View Report
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleAction(item, "resume")}
                          style={{
                            backgroundColor: "var(--maker-primary)",
                            color: "var(--accent-foreground)",
                          }}
                        >
                          Resume
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleAction(item, "delete")}
                          aria-label="Delete draft"
                        >
                          <span className="sr-only">Delete</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden
                          >
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
              </ul>
            </div>
          </>
        )}

        {hasItems && (returned.length > 0 || drafts.length > 0) && onViewAll && (
          <div className="border-t border-border px-4 py-3 bg-muted/20">
            <button
              type="button"
              onClick={onViewAll}
              className="flex w-full items-center justify-center gap-2 text-sm font-medium text-accent hover:text-accent/90 transition-colors py-1"
            >
              View all audits
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
