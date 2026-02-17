/**
 * Select Compliance Rule Set Modal
 *
 * Shown when the maker runs adhoc analysis. Rule sets are created in the
 * Checker's Knowledge Center.
 */

import { useEffect } from "react";
import { FileCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useComplianceRuleSets } from "@/features/maker/hooks";
import type { ComplianceRuleSetSummary } from "@/features/checker/api/knowledge-center";
import { cn } from "@/lib/utils";

export interface SelectRuleSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedId: string | null;
  onSelect: (ruleSet: ComplianceRuleSetSummary) => void;
  onConfirm: () => void;
  isRunning?: boolean;
  /** Auto-select default rule set when modal opens */
  autoSelectDefault?: boolean;
}

export function SelectRuleSetModal({
  isOpen,
  onClose,
  selectedId,
  onSelect,
  onConfirm,
  isRunning = false,
  autoSelectDefault = true,
}: SelectRuleSetModalProps) {
  const { data: ruleSets, isLoading } = useComplianceRuleSets();

  useEffect(() => {
    if (isOpen && ruleSets?.length && autoSelectDefault && !selectedId) {
      const defaultSet = ruleSets.find((s) => s.isDefault) ?? ruleSets[0];
      if (defaultSet) onSelect(defaultSet);
    }
  }, [isOpen, ruleSets, autoSelectDefault, selectedId, onSelect]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton className="max-w-lg">
      <div className="rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
            <FileCheck className="h-5 w-5 text-accent" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Select Compliance Rule Set</h2>
            <p className="text-sm text-muted-foreground">
              Choose which compliance rules to apply during analysis
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-2 max-h-[320px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
            </div>
          ) : (
            (ruleSets ?? []).map((set) => {
              const isSelected = selectedId === set.id;
              return (
                <button
                  key={set.id}
                  type="button"
                  onClick={() => onSelect(set)}
                  disabled={isRunning}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors",
                    "hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-ring",
                    isSelected
                      ? "border-accent bg-accent/10"
                      : "border-border bg-card hover:bg-accent/5"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      isSelected ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <FileCheck className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{set.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {set.rulesCount} rule{set.rulesCount !== 1 ? "s" : ""}
                      {set.description ? ` — ${set.description}` : ""}
                    </p>
                  </div>
                  {set.isDefault && (
                    <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      DEFAULT
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isRunning}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!selectedId || isRunning}
            className="bg-chart-2 text-white hover:opacity-90"
          >
            {isRunning ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Running...
              </>
            ) : (
              "Run Analysis"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
