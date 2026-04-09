import type { ExtractionStatus } from "./reference-documents-tab.types";

const BYTE_BASE = 1024;

export const FLOW_STEPS = [
  { title: "Upload Policy", desc: "Add your store policy PDF." },
  { title: "AI Extracts", desc: "Generate candidate rules from policy text." },
  { title: "Review", desc: "Validate and refine extracted candidates." },
  { title: "Create Drafts", desc: "Promote accepted candidates to drafts." },
] as const;

export const DEFAULT_SUPPORTED_FILE_TYPES = ".pdf,.docx,.doc,.txt,.md,.csv";

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const idx = Math.floor(Math.log(bytes) / Math.log(BYTE_BASE));
  return `${(bytes / Math.pow(BYTE_BASE, idx)).toFixed(1)} ${units[idx]}`;
}

export function getFileExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext ? `.${ext}` : "";
}

export function getFileTypeTone(filename: string): string {
  const extension = getFileExtension(filename);
  if (extension === ".pdf") return "bg-accent/10 border-accent/30";
  if (extension === ".doc" || extension === ".docx") {
    return "bg-chart-4/10 border-chart-4/30";
  }
  return "bg-muted/40 border-border";
}

export function getStatusUi(
  status: ExtractionStatus,
): { classes: string; label: string } {
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
