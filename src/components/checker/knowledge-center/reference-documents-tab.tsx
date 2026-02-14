/**
 * Reference Documents Tab
 *
 * Upload and manage policy/reference documents (PDF only).
 * Associate documents with one or multiple rules (policy grounding).
 * Storage only – no AI parsing in Phase 1.
 *
 * Link new uploads to rules: Select rules before uploading. The document
 * will be stored and linked to those rules for audit traceability.
 */

import { useMemo, useRef, useState } from "react";
import { Upload, FileText, Link2, Search, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useComplianceRules,
  useReferenceDocuments,
  useUpdateReferenceDocumentLinks,
  useUploadReferenceDocument,
} from "@/features/checker/hooks";
import { useToast } from "@/hooks/use-toast";
import { mockCheckerUser } from "@/lib/api/mock-data";
import { format } from "date-fns";
import type { ReferenceDocument } from "@/types/checker";

export function ReferenceDocumentsTab() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editLinkedRuleIds, setEditLinkedRuleIds] = useState<string[]>([]);

  const { data: documents, isLoading, error } = useReferenceDocuments();
  const { data: rules } = useComplianceRules();
  const uploadDoc = useUploadReferenceDocument();
  const updateLinks = useUpdateReferenceDocumentLinks();

  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    if (!searchQuery.trim()) return documents;
    const q = searchQuery.toLowerCase();
    const ruleNames = new Map(rules?.map((r) => [r.ruleId, r.ruleName.toLowerCase()]) ?? []);
    return documents.filter((doc) => {
      if (doc.name.toLowerCase().includes(q)) return true;
      const linkedNames = doc.linkedRuleIds
        .map((id) => ruleNames.get(id) ?? id.toLowerCase())
        .join(" ");
      return linkedNames.includes(q);
    });
  }, [documents, searchQuery, rules]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast({
        title: "Invalid file type",
        description: "Only PDF documents are supported in Phase 1.",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    uploadDoc.mutate(
      {
        name: file.name,
        uploadedBy: `${mockCheckerUser.firstName} ${mockCheckerUser.lastName} (${mockCheckerUser.email})`,
        linkedRuleIds: selectedRuleIds,
      },
      {
        onSuccess: () => {
          toast({
            title: "Document uploaded",
            description: selectedRuleIds.length
              ? `Linked to ${selectedRuleIds.length} rule(s).`
              : `${file.name} has been uploaded.`,
          });
          e.target.value = "";
        },
        onError: (err) => {
          toast({
            title: "Upload failed",
            description: err instanceof Error ? err.message : "Could not upload document.",
            variant: "destructive",
          });
          e.target.value = "";
        },
      }
    );
  };

  const startEditLinks = (doc: ReferenceDocument) => {
    setEditingDocId(doc.id);
    setEditLinkedRuleIds([...doc.linkedRuleIds]);
  };

  const saveEditLinks = () => {
    if (!editingDocId) return;
    updateLinks.mutate(
      { documentId: editingDocId, linkedRuleIds: editLinkedRuleIds },
      {
        onSuccess: () => {
          toast({ title: "Links updated", description: "Document rule links have been updated." });
          setEditingDocId(null);
        },
        onError: (err) => {
          toast({
            title: "Update failed",
            description: err instanceof Error ? err.message : "Could not update links.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const ruleNames = useMemo(
    () => new Map(rules?.map((r) => [r.ruleId, `${r.ruleId} – ${r.ruleName}`]) ?? []),
    [rules]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Reference Documents</h2>
          <p className="text-sm text-muted-foreground">
            Upload policy documents to ground compliance rules (PDF only)
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button onClick={handleUploadClick} disabled={uploadDoc.isPending}>
          <Upload className="size-4" />
          {uploadDoc.isPending ? "Uploading…" : "Upload PDF"}
        </Button>
      </div>

      {/* Link new uploads to rules – select rules BEFORE uploading */}
      {rules && rules.length > 0 && (
        <div className="rounded-lg border border-border bg-card/50 p-4">
          <h3 className="mb-1 text-sm font-medium text-foreground">
            Link new uploads to rules (optional)
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">
            Select rules below before uploading. The next document you upload will be linked to
            these rules for audit traceability.
          </p>
          <div className="flex flex-wrap gap-2">
            {rules.map((r) => (
              <label
                key={r.ruleId}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  checked={selectedRuleIds.includes(r.ruleId)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRuleIds((prev) => [...prev, r.ruleId]);
                    } else {
                      setSelectedRuleIds((prev) => prev.filter((id) => id !== r.ruleId));
                    }
                  }}
                  className="rounded"
                />
                <span>{r.ruleId} – {r.ruleName}</span>
              </label>
            ))}
          </div>
          {selectedRuleIds.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              {selectedRuleIds.length} rule(s) selected for next upload
            </p>
          )}
        </div>
      )}

      {/* Search documents */}
      {documents && documents.length > 0 && (
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search by document name or linked rule..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search documents"
          />
        </div>
      )}

      {/* Document list */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            Loading documents…
          </div>
        ) : error ? (
          <div className="p-6 text-destructive">
            Failed to load documents. Please try again.
          </div>
        ) : !documents || documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
            <FileText className="size-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              No reference documents yet. Upload a PDF to associate with your rules.
            </p>
            <Button onClick={handleUploadClick}>
              <Upload className="size-4" />
              Upload PDF
            </Button>
          </div>
        ) : !filteredDocuments.length ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12 text-center">
            <p className="text-muted-foreground">
              No documents match &quot;{searchQuery}&quot;
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-sm underline text-accent hover:text-accent/80"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredDocuments.map((doc) => (
              <DocumentRow
                key={doc.id}
                document={doc}
                ruleNames={ruleNames}
                rules={rules ?? []}
                isEditing={editingDocId === doc.id}
                editLinkedRuleIds={editLinkedRuleIds}
                onEditLinkedRuleIdsChange={setEditLinkedRuleIds}
                onStartEdit={() => startEditLinks(doc)}
                onSaveEdit={saveEditLinks}
                onCancelEdit={() => setEditingDocId(null)}
                isSaving={updateLinks.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentRow({
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
}: {
  document: ReferenceDocument;
  ruleNames: Map<string, string>;
  rules: Array<{ ruleId: string; ruleName: string }>;
  isEditing: boolean;
  editLinkedRuleIds: string[];
  onEditLinkedRuleIdsChange: (ids: string[]) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  isSaving: boolean;
}) {
  const linkedLabels = document.linkedRuleIds.map((id) => ruleNames.get(id) || id);

  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-muted p-2">
          <FileText className="size-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">{document.name}</p>
          <p className="text-xs text-muted-foreground">
            Uploaded {format(new Date(document.uploadedDate), "MMM d, yyyy")} by{" "}
            {document.uploadedBy}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:items-end">
        {isEditing ? (
          <div className="flex flex-wrap gap-2">
            {rules.map((r) => (
              <label
                key={r.ruleId}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-2 py-1.5 text-xs hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  checked={editLinkedRuleIds.includes(r.ruleId)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onEditLinkedRuleIdsChange([...editLinkedRuleIds, r.ruleId]);
                    } else {
                      onEditLinkedRuleIdsChange(editLinkedRuleIds.filter((id) => id !== r.ruleId));
                    }
                  }}
                  className="rounded"
                />
                <span>{r.ruleId}</span>
              </label>
            ))}
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={onCancelEdit} disabled={isSaving}>
                Cancel
              </Button>
              <Button size="sm" onClick={onSaveEdit} disabled={isSaving}>
                {isSaving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {document.linkedRuleIds.length > 0 ? (
                <>
                  <Link2 className="size-4 shrink-0" />
                  <span>Linked to {linkedLabels.join(", ")}</span>
                </>
              ) : (
                <span className="italic">Not linked to any rules</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onStartEdit}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Edit rule links"
            >
              <Pencil className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
