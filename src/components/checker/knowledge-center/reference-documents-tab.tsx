/**
 * Reference Documents Tab
 *
 * Upload and manage policy/reference documents (PDF only).
 * Phase 1.5 UX: show the document-to-rules workflow clearly.
 */

import { useCallback, useMemo, useState } from "react";
import {
  FileText,
  Search,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  useDeleteReferenceDocument,
  useComplianceRules,
  useGenerateDocumentRules,
  useReferenceDocuments,
  useUpdateReferenceDocumentLinks,
  useUploadReferenceDocument,
} from "@/queries/checker";
import { useToast } from "@/hooks/use-toast";
import type { ReferenceDocument } from "@/types/checker";
import { ReferenceDocumentRow } from "./reference-document-row";
import { ReferenceDocumentsFileUpload } from "./reference-documents-file-upload";
import { RuleSelectorDropdown } from "./rule-selector-dropdown";
import type { ExtractionStatus } from "./reference-documents-tab.types";
import { FLOW_STEPS, getStatusUi } from "./reference-documents-tab.utils";

export function ReferenceDocumentsTab() {
  const { toast } = useToast();
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editLinkedRuleIds, setEditLinkedRuleIds] = useState<string[]>([]);
  const [manualExtractionStatus, setManualExtractionStatus] = useState<
    Record<string, ExtractionStatus>
  >({});
  const [queuedFiles, setQueuedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [confirmDeleteDocument, setConfirmDeleteDocument] = useState<ReferenceDocument | null>(null);

  const { data: documents, isLoading, error } = useReferenceDocuments();
  const { data: rules } = useComplianceRules();
  const uploadDoc = useUploadReferenceDocument();
  const generateRules = useGenerateDocumentRules();
  const deleteDocument = useDeleteReferenceDocument();
  const updateLinks = useUpdateReferenceDocumentLinks();

  const getDocumentExtractionStatus = useCallback(
    (doc: ReferenceDocument): ExtractionStatus => {
      const manualStatus = manualExtractionStatus[doc.id];
      if (manualStatus) return manualStatus;
      if (doc.processingStatus === "EXTRACTING") return "processing";
      if (doc.processingStatus === "FAILED") return "failed";
      if (doc.processingStatus === "COMPLETED" || doc.linkedRuleIds.length > 0) return "ready";
      return "uploaded";
    },
    [manualExtractionStatus]
  );

  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    if (!searchQuery.trim()) return documents;
    const q = searchQuery.toLowerCase();
    const ruleNames = new Map(rules?.map((r) => [r.ruleId, r.ruleName.toLowerCase()]) ?? []);

    return documents.filter((doc) => {
      if (doc.name.toLowerCase().includes(q)) return true;
      const linkedNames = doc.linkedRuleIds.map((id) => ruleNames.get(id) ?? id.toLowerCase()).join(" ");
      const statusText = (getStatusUi(getDocumentExtractionStatus(doc)).label || "").toLowerCase();
      return linkedNames.includes(q) || statusText.includes(q);
    });
  }, [documents, searchQuery, rules, getDocumentExtractionStatus]);

  const handleUploadFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      setUploadError("");

      try {
        for (const file of files) {
          await uploadDoc.mutateAsync({
            file,
            documentType: "COMPLIANCE_REFERENCE",
          });
        }

        toast({
          title: "Upload successful",
          description:
            files.length === 1
              ? selectedRuleIds.length
                ? `Linked to ${selectedRuleIds.length} rule(s).`
                : `${files[0].name} has been uploaded.`
              : `${files.length} files uploaded successfully.`,
        });
        setQueuedFiles([]);
        setShowUploadPanel(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not upload document.";
        setUploadError(message);
        toast({
          title: "Upload failed",
          description: message,
          variant: "destructive",
        });
      }
    },
    [selectedRuleIds, toast, uploadDoc]
  );

  const runExtraction = useCallback(async (documentId: string) => {
    setManualExtractionStatus((prev) => ({ ...prev, [documentId]: "processing" }));
    try {
      await generateRules.mutateAsync(documentId);
      setManualExtractionStatus((prev) => ({ ...prev, [documentId]: "ready" }));
      toast({
        title: "Extraction complete",
        description: "Candidate rules have been generated for this document.",
      });
    } catch (err) {
      setManualExtractionStatus((prev) => ({ ...prev, [documentId]: "failed" }));
      toast({
        title: "Extraction failed",
        description: err instanceof Error ? err.message : "Could not generate rules.",
        variant: "destructive",
      });
    }
  }, [generateRules, toast]);

  const reviewCandidates = useCallback((docName: string) => {
    toast({
      title: "Candidate review",
      description: `Review view for ${docName} will be added next.`,
    });
  }, [toast]);

  const createDraftRules = useCallback((documentId: string, docName: string) => {
    const document = documents?.find((doc) => doc.id === documentId);
    const status = document ? getDocumentExtractionStatus(document) : "uploaded";
    if (status !== "ready" && status !== "imported") {
      toast({
        title: "Run extraction first",
        description: "Extract candidates before creating drafts.",
        variant: "destructive",
      });
      return;
    }
    setManualExtractionStatus((prev) => ({ ...prev, [documentId]: "imported" }));
    toast({
      title: "Draft rules created",
      description: `${docName} candidates are now ready in Compliance Rules as drafts.`,
    });
  }, [documents, getDocumentExtractionStatus, toast]);

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
    () => new Map(rules?.map((r) => [r.ruleId, `${r.ruleId} - ${r.ruleName}`]) ?? []),
    [rules]
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Reference Documents</h2>
          <p className="text-sm text-muted-foreground">Upload policy documents, extract candidate rules, and create drafts.</p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setUploadError("");
            setShowUploadPanel(true);
          }}
          disabled={uploadDoc.isPending}
        >
          <Upload className="size-4" />
          Add New Doc
        </Button>
      </div>

      <div className="mt-3 shrink-0 rounded-lg border border-border bg-card/40 p-3">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
          {FLOW_STEPS.map((step, idx) => (
            <div key={step.title} className="rounded-md border border-border/80 bg-background/20 px-2.5 py-2">
              <p className="text-xs font-semibold text-foreground">{idx + 1}. {step.title}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {rules && rules.length > 0 && (
        <div className="mt-3 shrink-0 rounded-lg border border-border bg-card/50 p-3">
          <h3 className="mb-1 text-sm font-medium text-foreground">Link new uploads to rules (optional)</h3>
          <RuleSelectorDropdown
            rules={rules.map((r) => ({ ruleId: r.ruleId, ruleName: r.ruleName }))}
            selectedIds={selectedRuleIds}
            onChange={setSelectedRuleIds}
            placeholder="Select rules for next upload"
          />
        </div>
      )}

      <Modal
        isOpen={showUploadPanel}
        onClose={() => {
          if (uploadDoc.isPending) return;
          setShowUploadPanel(false);
          setQueuedFiles([]);
          setUploadError("");
        }}
        className="max-w-3xl"
      >
        <div className="rounded-lg border border-border bg-card p-6 shadow-lg min-h-[520px]">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-base font-semibold text-foreground">Add New Document</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowUploadPanel(false);
                setQueuedFiles([]);
                setUploadError("");
              }}
              disabled={uploadDoc.isPending}
            >
              Cancel
            </Button>
          </div>
          <ReferenceDocumentsFileUpload
            onFileSelect={(files) => setQueuedFiles(files ?? [])}
            onUpload={handleUploadFiles}
            uploadedFiles={queuedFiles}
            isProcessing={uploadDoc.isPending}
            error={uploadError}
            acceptedFileTypes=".pdf"
            maxFileSizeMB={5}
            maxTotalSizeMB={25}
            multiple={false}
            maxFiles={1}
            title="Upload Policy PDF"
            description="Drag and drop a policy document, then upload."
            variant="default"
            showPreview
          />
        </div>
      </Modal>

      {documents && documents.length > 0 && (
        <div className="mt-3 shrink-0 relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            placeholder="Search by document, linked rule, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search documents"
          />
        </div>
      )}

      <div className="mt-3 flex-1 min-h-0 overflow-auto">
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">Loading documents...</div>
          ) : error ? (
            <div className="p-6 text-destructive">Failed to load documents. Please try again.</div>
          ) : !documents || documents.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center gap-4 p-10 text-center">
              <FileText className="size-12 text-muted-foreground" />
              <p className="text-muted-foreground">No documents yet. Upload a policy PDF to start.</p>
              <Button
                type="button"
                onClick={() => {
                  setUploadError("");
                  setShowUploadPanel(true);
                }}
                disabled={uploadDoc.isPending}
              >
                <Upload className="size-4" />
                Add New Doc
              </Button>
            </div>
          ) : !filteredDocuments.length ? (
            <div className="flex min-h-full flex-col items-center justify-center gap-2 p-10 text-center">
              <p className="text-muted-foreground">No documents match &quot;{searchQuery}&quot;</p>
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
                <ReferenceDocumentRow
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
                  extractionStatus={getDocumentExtractionStatus(doc)}
                  onRunExtraction={() => runExtraction(doc.id)}
                  onReviewCandidates={() => reviewCandidates(doc.name)}
                  onCreateDraftRules={() => createDraftRules(doc.id, doc.name)}
                  onDelete={() => setConfirmDeleteDocument(doc)}
                  isDeleting={deleteDocument.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        isOpen={!!confirmDeleteDocument}
        onClose={() => setConfirmDeleteDocument(null)}
        onConfirm={() => {
          if (!confirmDeleteDocument) return;
          deleteDocument.mutate(confirmDeleteDocument.id, {
            onSuccess: () => {
              toast({
                title: "Document deleted",
                description: `${confirmDeleteDocument.name} has been removed.`,
              });
              setConfirmDeleteDocument(null);
            },
            onError: (err) => {
              toast({
                title: "Delete failed",
                description: err instanceof Error ? err.message : "Could not delete document.",
                variant: "destructive",
              });
            },
          });
        }}
        title="Delete document?"
        description={
          confirmDeleteDocument
            ? `This will permanently remove ${confirmDeleteDocument.name}.`
            : "This will permanently remove the selected document."
        }
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteDocument.isPending}
      />
    </div>
  );
}
