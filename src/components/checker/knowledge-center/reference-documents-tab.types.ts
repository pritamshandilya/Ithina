import type { ReferenceDocument } from "@/types/checker";

export interface RuleOption {
  ruleId: string;
  ruleName: string;
}

export type ExtractionStatus =
  | "uploaded"
  | "processing"
  | "ready"
  | "imported"
  | "failed";

export interface DocumentRowProps {
  document: ReferenceDocument;
  ruleNames: Map<string, string>;
  rules: RuleOption[];
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
}
