import { format } from "date-fns";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock3,
  FileText,
  Link2,
  Pencil,
  Trash2,
} from "lucide-react";

import type { DocumentRowProps } from "./referenceDocumentsTab.types";
import { getStatusUi } from "./referenceDocumentsTab.utils";
import { RuleSelectorDropdown } from "./RuleSelectorDropdown";
import { Button } from "@/components/ui/button";

export function ReferenceDocumentRow({
  document,
  uploadedByLabel,
  ruleNames,
  rules,
  isEditing,
  editLinkedRuleIds,
  onEditLinkedRuleIdsChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  isSaving,
  extractionStatus,
  onRunExtraction,
  onReviewCandidates,
  onCreateDraftRules,
  onDelete,
  isDeleting,
}: DocumentRowProps) {
  const linkedLabels = document.linkedRuleIds.map(
    (id) => ruleNames.get(id) || id,
  );
  const statusUi = getStatusUi(extractionStatus);

  return (
    <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="bg-muted shrink-0 rounded-lg p-2">
          <FileText className="text-muted-foreground size-5" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-medium">{document.name}</p>
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${statusUi.classes}`}
            >
              {extractionStatus === "processing" ? (
                <Clock3 className="mr-1 size-3" />
              ) : null}
              {extractionStatus === "ready" ? (
                <Bot className="mr-1 size-3" />
              ) : null}
              {extractionStatus === "imported" ? (
                <CheckCircle2 className="mr-1 size-3" />
              ) : null}
              {extractionStatus === "failed" ? (
                <AlertTriangle className="mr-1 size-3" />
              ) : null}
              {statusUi.label}
            </span>
          </div>
          <p className="text-muted-foreground text-xs">
            Uploaded {format(new Date(document.uploadedDate), "MMM d, yyyy")} by{" "}
            {uploadedByLabel ?? document.uploadedBy}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:items-end">
        {isEditing ? (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[440px] sm:flex-row sm:items-start sm:justify-end sm:gap-2">
            <RuleSelectorDropdown
              rules={rules}
              selectedIds={editLinkedRuleIds}
              onChange={onEditLinkedRuleIdsChange}
              placeholder="Select rules to link"
              usePortal
              panelAlign="right"
              triggerClassName="flex w-full sm:w-[240px] items-center justify-between gap-2 rounded-md border border-border bg-card px-2 py-1.5 text-left text-xs hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={onCancelEdit}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={onSaveEdit} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-muted-foreground flex max-w-[520px] items-center gap-2 text-sm">
              {document.linkedRuleIds.length > 0 ? (
                <>
                  <Link2 className="size-4 shrink-0" />
                  <span className="truncate">
                    Linked to {linkedLabels.join(", ")}
                  </span>
                </>
              ) : (
                <span className="italic">Not linked to any rules</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={onStartEdit}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Edit rule links"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onRunExtraction}
                disabled={extractionStatus === "processing"}
              >
                <Bot className="size-4" />
                {extractionStatus === "processing"
                  ? "Extracting..."
                  : "Extract Rules"}
              </Button>
              <Button variant="outline" size="sm" onClick={onReviewCandidates}>
                Review
              </Button>
              <Button
                size="sm"
                onClick={onCreateDraftRules}
                disabled={
                  extractionStatus !== "ready" &&
                  extractionStatus !== "imported"
                }
              >
                Create Drafts
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive"
                aria-label="Delete document"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
