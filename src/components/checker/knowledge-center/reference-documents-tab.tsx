/**
 * Reference Documents Tab
 *
 * Upload and manage policy/reference documents (PDF only).
 * Phase 1.5 UX: show the document-to-rules workflow clearly.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Link2,
  Pencil,
  Search,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

interface RuleOption {
  ruleId: string;
  ruleName: string;
}

type ExtractionStatus = "uploaded" | "processing" | "ready" | "imported" | "failed";

const FLOW_STEPS = [
  { title: "Upload Policy", desc: "Add your store policy PDF." },
  { title: "AI Extracts", desc: "Generate candidate rules from policy text." },
  { title: "Review", desc: "Validate and refine extracted candidates." },
  { title: "Create Drafts", desc: "Promote accepted candidates to drafts." },
] as const;

function getStatusUi(status: ExtractionStatus): { classes: string; label: string } {
  const map: Record<ExtractionStatus, { classes: string; label: string }> = {
    uploaded: {
      classes: "bg-muted/70 text-muted-foreground border-border",
      label: "Uploaded",
    },
    processing: {
      classes: "bg-accent/10 text-accent border-accent/30",
      label: "Processing",
    },
    ready: {
      classes: "bg-chart-2/20 text-chart-2 border-chart-2/30",
      label: "Extraction Ready",
    },
    imported: {
      classes: "bg-chart-4/20 text-chart-4 border-chart-4/30",
      label: "Draft Rules Created",
    },
    failed: {
      classes: "bg-destructive/15 text-destructive border-destructive/40",
      label: "Failed",
    },
  };
  return map[status];
}

function RuleSelectorDropdown({
  rules,
  selectedIds,
  onChange,
  placeholder = "Select rules to link",
  triggerClassName,
}: {
  rules: RuleOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  triggerClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const filteredRules = useMemo(() => {
    if (!search.trim()) return rules;
    const q = search.toLowerCase();
    return rules.filter(
      (r) =>
        r.ruleId.toLowerCase().includes(q) || r.ruleName.toLowerCase().includes(q)
    );
  }, [rules, search]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleToggle = useCallback(
    (ruleId: string, checked: boolean) => {
      if (checked) onChange([...selectedIds, ruleId]);
      else onChange(selectedIds.filter((id) => id !== ruleId));
    },
    [selectedIds, onChange]
  );

  const handleSelectAll = useCallback(() => {
    const ids = filteredRules.map((r) => r.ruleId);
    const allSelected = ids.every((id) => selectedIds.includes(id));
    if (allSelected) onChange(selectedIds.filter((id) => !ids.includes(id)));
    else onChange([...new Set([...selectedIds, ...ids])]);
  }, [filteredRules, selectedIds, onChange]);

  const label = selectedIds.length > 0 ? `${selectedIds.length} selected` : placeholder;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={
          triggerClassName ??
          "flex w-full min-w-[200px] items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2 text-left text-sm hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring"
        }
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedIds.length > 0 ? "text-foreground" : "text-muted-foreground"}>{label}</span>
        <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          className="absolute left-0 top-full z-50 mt-1 min-w-[280px] rounded-md border border-border bg-popover shadow-lg"
        >
          <div className="border-b border-border p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                type="search"
                placeholder="Search rules..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-sm"
                autoFocus
              />
            </div>
            <div className="mt-2 flex gap-1">
              <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={handleSelectAll}>
                {filteredRules.every((r) => selectedIds.includes(r.ruleId)) ? "Deselect all" : "Select all"}
              </Button>
              {selectedIds.length > 0 && (
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onChange([])}>
                  Clear
                </Button>
              )}
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredRules.length === 0 ? (
              <p className="px-2 py-4 text-center text-sm text-muted-foreground">No rules match</p>
            ) : (
              filteredRules.map((r) => (
                <label
                  key={r.ruleId}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedIds.includes(r.ruleId)}
                    onCheckedChange={(checked: boolean | "indeterminate") => handleToggle(r.ruleId, checked === true)}
                  />
                  <span className="truncate">{r.ruleId} - {r.ruleName}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ReferenceDocumentsTab() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editLinkedRuleIds, setEditLinkedRuleIds] = useState<string[]>([]);
  const [extractionStatus, setExtractionStatus] = useState<Record<string, ExtractionStatus>>({});

  const { data: documents, isLoading, error } = useReferenceDocuments();
  const { data: rules } = useComplianceRules();
  const uploadDoc = useUploadReferenceDocument();
  const updateLinks = useUpdateReferenceDocumentLinks();

  useEffect(() => {
    if (!documents) return;
    setExtractionStatus((prev) => {
      const next = { ...prev };
      for (const doc of documents) {
        if (!next[doc.id]) next[doc.id] = doc.linkedRuleIds.length > 0 ? "ready" : "uploaded";
      }
      return next;
    });
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    if (!searchQuery.trim()) return documents;
    const q = searchQuery.toLowerCase();
    const ruleNames = new Map(rules?.map((r) => [r.ruleId, r.ruleName.toLowerCase()]) ?? []);

    return documents.filter((doc) => {
      if (doc.name.toLowerCase().includes(q)) return true;
      const linkedNames = doc.linkedRuleIds.map((id) => ruleNames.get(id) ?? id.toLowerCase()).join(" ");
      const statusText = (getStatusUi(extractionStatus[doc.id] ?? "uploaded").label || "").toLowerCase();
      return linkedNames.includes(q) || statusText.includes(q);
    });
  }, [documents, searchQuery, rules, extractionStatus]);

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

  const runExtraction = useCallback((documentId: string) => {
    setExtractionStatus((prev) => ({ ...prev, [documentId]: "processing" }));
    setTimeout(() => {
      setExtractionStatus((prev) => ({ ...prev, [documentId]: "ready" }));
    }, 900);
  }, []);

  const reviewCandidates = useCallback((docName: string) => {
    toast({
      title: "Candidate review",
      description: `Review view for ${docName} will be added next.`,
    });
  }, [toast]);

  const createDraftRules = useCallback((documentId: string, docName: string) => {
    const status = extractionStatus[documentId] ?? "uploaded";
    if (status !== "ready" && status !== "imported") {
      toast({
        title: "Run extraction first",
        description: "Extract candidates before creating drafts.",
        variant: "destructive",
      });
      return;
    }
    setExtractionStatus((prev) => ({ ...prev, [documentId]: "imported" }));
    toast({
      title: "Draft rules created",
      description: `${docName} candidates are now ready in Compliance Rules as drafts.`,
    });
  }, [extractionStatus, toast]);

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
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
        <Button onClick={handleUploadClick} disabled={uploadDoc.isPending}>
          <Upload className="size-4" />
          {uploadDoc.isPending ? "Uploading..." : "Upload Policy PDF"}
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
          <p className="mb-2 text-xs text-muted-foreground">Pre-link the next upload for immediate traceability.</p>
          <RuleSelectorDropdown
            rules={rules.map((r) => ({ ruleId: r.ruleId, ruleName: r.ruleName }))}
            selectedIds={selectedRuleIds}
            onChange={setSelectedRuleIds}
            placeholder="Select rules for next upload"
          />
        </div>
      )}

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
              <Button onClick={handleUploadClick}>
                <Upload className="size-4" />
                Upload Policy PDF
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
                  extractionStatus={extractionStatus[doc.id] ?? "uploaded"}
                  onRunExtraction={() => runExtraction(doc.id)}
                  onReviewCandidates={() => reviewCandidates(doc.name)}
                  onCreateDraftRules={() => createDraftRules(doc.id, doc.name)}
                />
              ))}
            </div>
          )}
        </div>
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
  extractionStatus,
  onRunExtraction,
  onReviewCandidates,
  onCreateDraftRules,
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
  extractionStatus: ExtractionStatus;
  onRunExtraction: () => void;
  onReviewCandidates: () => void;
  onCreateDraftRules: () => void;
}) {
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
            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${statusUi.classes}`}>
              {extractionStatus === "processing" ? <Clock3 className="mr-1 size-3" /> : null}
              {extractionStatus === "ready" ? <Bot className="mr-1 size-3" /> : null}
              {extractionStatus === "imported" ? <CheckCircle2 className="mr-1 size-3" /> : null}
              {extractionStatus === "failed" ? <AlertTriangle className="mr-1 size-3" /> : null}
              {statusUi.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Uploaded {format(new Date(document.uploadedDate), "MMM d, yyyy")} by {document.uploadedBy}
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
              <Button size="sm" variant="outline" onClick={onCancelEdit} disabled={isSaving}>Cancel</Button>
              <Button size="sm" onClick={onSaveEdit} disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</Button>
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
              <Button variant="ghost" size="sm" onClick={onStartEdit} className="text-muted-foreground hover:text-foreground" aria-label="Edit rule links">
                <Pencil className="size-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onRunExtraction} disabled={extractionStatus === "processing"}>
                <Bot className="size-4" />
                {extractionStatus === "processing" ? "Extracting..." : "Extract Rules"}
              </Button>
              <Button variant="outline" size="sm" onClick={onReviewCandidates}>Review</Button>
              <Button size="sm" onClick={onCreateDraftRules} disabled={extractionStatus !== "ready" && extractionStatus !== "imported"}>
                Create Drafts
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
