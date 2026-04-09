/**
 * Draft Audits Section Component
 * 
 * Displays a list of draft audits (started but not submitted) for the Maker dashboard.
 * Allows workers to resume in-progress audits and continue where they left off.
 * 
 * Features:
 * - List of all draft audits with progress indicators
 * - Resume button to continue draft
 * - Delete button to discard draft
 * - Last saved timestamp
 * - Progress percentage (0-100%)
 * - Empty state when no drafts exist
 * 
 * Draft Lifecycle:
 * 1. Worker starts audit → Draft created
 * 2. Progress auto-saved periodically
 * 3. Worker can resume or delete draft
 * 4. On submit → Draft becomes Pending
 */

import { FileEditIcon, TrashIcon, PlayIcon, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useDraftAudits, useDeleteDraft } from "@/queries/maker";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export interface DraftAuditsSectionProps {
  /**
   * Callback when resume is clicked
   */
  onResume?: (auditId: string, shelfId: string) => void;

  /**
   * Optional CSS class name
   */
  className?: string;
}

export function DraftAuditsSection({
  onResume,
  className,
}: DraftAuditsSectionProps) {
  const { toast } = useToast();
  const { data: drafts, isLoading, error } = useDraftAudits();
  const deleteDraftMutation = useDeleteDraft();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [auditToDelete, setAuditToDelete] = useState<string | null>(null);

  const handleResume = (auditId: string, shelfId: string) => {
    if (onResume) {
      onResume(auditId, shelfId);
    } else {
      toast({
        title: "Coming soon",
        description:
          "Resume draft functionality will navigate to the audit editor in Phase 2.",
      });
    }
  };

  const handleDelete = (auditId: string) => {
    setAuditToDelete(auditId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (auditToDelete) {
      deleteDraftMutation.mutate(auditToDelete, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setAuditToDelete(null);
        },
      });
    }
  };

  // Don't render if no drafts and not loading
  if (!isLoading && !error && (!drafts || drafts.length === 0)) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-accent p-2">
          <FileEditIcon className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Draft Audits
          </h2>
          <p className="text-sm text-muted-foreground">
            Resume in-progress audits and continue where you left off
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Failed to load draft audits
          </p>
        </div>
      )}

      {/* Draft Audits List */}
      {!isLoading && !error && drafts && drafts.length > 0 && (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="rounded-lg border border-accent/30 bg-card p-4 space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">
                      Shelf {draft.shelfId.replace("shelf-", "")}
                    </h3>
                    <span className="status-draft rounded-full px-2 py-0.5 text-xs font-medium">
                      Draft
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Saved{" "}
                    {draft.draftSavedAt &&
                      formatDistanceToNow(new Date(draft.draftSavedAt), {
                        addSuffix: true,
                      })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResume(draft.id, draft.shelfId)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                      "bg-accent text-white hover:opacity-90",
                      "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                    )}
                    aria-label={`Resume draft for shelf ${draft.shelfId}`}
                  >
                    <PlayIcon className="h-4 w-4" />
                    Resume
                  </button>
                  <button
                    onClick={() => handleDelete(draft.id)}
                    disabled={deleteDraftMutation.isPending}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      "border border-destructive/50 bg-background text-destructive hover:bg-destructive/10",
                      "focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                    aria-label={`Delete draft for shelf ${draft.shelfId}`}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {draft.draftProgress !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span className="font-medium text-accent">
                      {draft.draftProgress}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-300"
                      style={{ width: `${draft.draftProgress}%` }}
                      role="progressbar"
                      aria-valuenow={draft.draftProgress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Draft completion: ${draft.draftProgress}%`}
                    />
                  </div>
                </div>
              )}

              {/* Audit Mode Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Mode:</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                  {draft.mode === "vision-edge" ? "Vision Edge" : "Assist Mode"}
                </span>
              </div>
            </div>
          ))}

          {/* Help Text */}
          <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Auto-Save:</strong> Your draft progress is automatically saved every 30 seconds. You can safely close the app and resume later.
            </p>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Draft Audit"
        description="Are you sure you want to delete this draft? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteDraftMutation.isPending}
      />
    </div>
  );
}
