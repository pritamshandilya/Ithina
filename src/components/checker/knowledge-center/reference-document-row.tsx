import { format } from "date-fns";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock3,
  FileText,
  Link2,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { RuleSelectorDropdown } from "./rule-selector-dropdown";
import type { DocumentRowProps } from "./reference-documents-tab.types";
import { getStatusUi } from "./reference-documents-tab.utils";

export function ReferenceDocumentRow({
  document,
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
}: DocumentRowProps) {
  const linkedLabels = document.linkedRuleIds.map((id) => ruleNames.get(id) || id);
  const statusUi = getStatusUi(extractionStatus);

  return (
    <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 min-w-0">
        <div className="rounded-lg bg-muted p-2 shrink-0">
          <FileText className="size-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium truncate">{document.name}</p>
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${statusUi.classes}`}
            >
              {extractionStatus === "processing" ? <Clock3 className="mr-1 size-3" /> : null}
              {extractionStatus === "ready" ? <Bot className="mr-1 size-3" /> : null}
              {extractionStatus === "imported" ? <CheckCircle2 className="mr-1 size-3" /> : null}
              {extractionStatus === "failed" ? <AlertTriangle className="mr-1 size-3" /> : null}
              {statusUi.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Uploaded {format(new Date(document.uploadedDate), "MMM d, yyyy")} by{" "}
            {document.uploadedBy}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:items-end">
        {isEditing ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            <RuleSelectorDropdown
              rules={rules}
              selectedIds={editLinkedRuleIds}
              onChange={onEditLinkedRuleIdsChange}
              placeholder="Select rules to link"
              triggerClassName="flex min-w-[180px] items-center justify-between gap-2 rounded-md border border-border bg-card px-2 py-1.5 text-left text-xs hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={onCancelEdit} disabled={isSaving}>
                Cancel
              </Button>
              <Button size="sm" onClick={onSaveEdit} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground max-w-[520px]">
              {document.linkedRuleIds.length > 0 ? (
                <>
                  <Link2 className="size-4 shrink-0" />
                  <span className="truncate">Linked to {linkedLabels.join(", ")}</span>
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
                {extractionStatus === "processing" ? "Extracting..." : "Extract Rules"}
              </Button>
              <Button variant="outline" size="sm" onClick={onReviewCandidates}>
                Review
              </Button>
              <Button
                size="sm"
                onClick={onCreateDraftRules}
                disabled={extractionStatus !== "ready" && extractionStatus !== "imported"}
              >
                Create Drafts
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
