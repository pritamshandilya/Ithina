/**
 * Reference Documents Tab
 *
 * Upload and manage policy/reference documents (PDF only).
 * Associate documents with one or multiple rules.
 * Storage only – no AI parsing in Phase 1.
 */

import { useRef, useState } from "react";
import { Upload, FileText, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  useComplianceRules,
  useReferenceDocuments,
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

  const { data: documents, isLoading, error } = useReferenceDocuments();
  const { data: rules } = useComplianceRules();
  const uploadDoc = useUploadReferenceDocument();

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
          toast({ title: "Document uploaded", description: `${file.name} has been uploaded.` });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Reference Documents</h2>
          <p className="text-sm text-muted-foreground">
            Upload policy documents to ground compliance rules (PDF only)
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {rules && rules.length > 0 && (
            <select
              multiple
              value={selectedRuleIds}
              onChange={(e) => {
                const opts = Array.from(e.target.selectedOptions, (o) => o.value);
                setSelectedRuleIds(opts);
              }}
              className="hidden h-9 min-w-[200px] rounded-md border border-input bg-transparent px-3 py-1 text-sm sm:block"
              title="Link to rules (optional)"
            />
          )}
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
      </div>

      {/* Rule selector for linking - simplified */}
      {rules && rules.length > 0 && (
        <div className="rounded-lg border border-border bg-card/50 p-4">
          <h3 className="mb-2 text-sm font-medium text-foreground">
            Link new uploads to rules (optional)
          </h3>
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
                <span>{r.ruleId}</span>
              </label>
            ))}
          </div>
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
        ) : (
          <div className="divide-y divide-border">
            {documents.map((doc) => (
              <DocumentRow key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentRow({ document }: { document: ReferenceDocument }) {
  return (
    <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
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
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {document.linkedRuleIds.length > 0 ? (
          <>
            <Link2 className="size-4 shrink-0" />
            <span>Linked to {document.linkedRuleIds.join(", ")}</span>
          </>
        ) : (
          <span className="italic">Not linked to any rules</span>
        )}
      </div>
    </div>
  );
}
