/**
 * SKU Data Enrichment Modal
 *
 * Shown during analysis pipeline when the Data Enrichment step is reached.
 * User reviews and adjusts estimated metrics (Contribution, Weight) for
 * detected product types before generating the strategy.
 *
 * Reusable for both adhoc and planogram-based analysis flows.
 */

import { useCallback, useEffect, useState } from "react";
import { DollarSign, FileText, Loader2, Scale, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import type { SkuEnrichmentItem } from "@/features/maker/analysis/types";

export interface SkuDataEnrichmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Initial items from AI detection (or mock data) */
  items: SkuEnrichmentItem[];
  /** Called when user clicks Generate Strategy with enriched data */
  onGenerateStrategy: (items: SkuEnrichmentItem[]) => void;
  /** Whether the strategy is being generated (loading state) */
  isGenerating?: boolean;
}

export function SkuDataEnrichmentModal({
  isOpen,
  onClose,
  items: initialItems,
  onGenerateStrategy,
  isGenerating = false,
}: SkuDataEnrichmentModalProps) {
  const [items, setItems] = useState<SkuEnrichmentItem[]>(() =>
    initialItems.map((i) => ({ ...i }))
  );

  const handleContributionChange = useCallback((id: string, value: string) => {
    const num = parseFloat(value);
    if (Number.isNaN(num) && value !== "" && value !== "-") return;
    setItems((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, contribution: value === "" ? 0 : num } : p
      )
    );
  }, []);

  const handleWeightChange = useCallback((id: string, value: string) => {
    const num = parseFloat(value);
    if (Number.isNaN(num) && value !== "" && value !== "-") return;
    setItems((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, weight: value === "" ? 0 : num } : p
      )
    );
  }, []);

  const handleGenerate = useCallback(() => {
    onGenerateStrategy(items);
  }, [items, onGenerateStrategy]);

  useEffect(() => {
    if (isOpen) {
      setItems(initialItems.map((i) => ({ ...i })));
    }
  }, [isOpen, initialItems]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton
      className="max-w-2xl max-h-[90vh] flex flex-col"
    >
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-lg flex flex-col max-h-[90vh]">
        <header className="flex items-center gap-3 px-6 py-4 border-b border-border shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
            <Sparkles className="h-5 w-5 text-accent" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              SKU Data Enrichment
            </h2>
            <p className="text-sm text-muted-foreground">
              The AI detected{" "}
              <strong className="text-foreground">{items.length} unique product types</strong>.
              Please review the estimated metrics before generating the strategy.
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-muted/20 px-4 py-3"
              >
                <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                  {item.productName}
                </span>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor={`contrib-${item.id}`}
                      className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                    >
                      Contrib ($)
                    </label>
                    <div className="relative">
                      <DollarSign
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
                        aria-hidden
                      />
                      <Input
                        id={`contrib-${item.id}`}
                        type="number"
                        step="0.1"
                        min="0"
                        value={item.contribution === 0 ? "" : item.contribution}
                        onChange={(e) =>
                          handleContributionChange(item.id, e.target.value)
                        }
                        className="h-8 w-24 pl-7 text-sm"
                        aria-label={`Contribution for ${item.productName}`}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor={`weight-${item.id}`}
                      className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                    >
                      Weight (kg)
                    </label>
                    <div className="relative">
                      <Scale
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
                        aria-hidden
                      />
                      <Input
                        id={`weight-${item.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.weight === 0 ? "" : item.weight}
                        onChange={(e) =>
                          handleWeightChange(item.id, e.target.value)
                        }
                        className="h-8 w-24 pl-7 text-sm"
                        aria-label={`Weight for ${item.productName}`}
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <footer className="border-t border-border px-6 py-4 shrink-0">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-chart-2 text-white hover:opacity-90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" aria-hidden />
                Generating…
              </>
            ) : (
              <>
                <FileText className="size-4 mr-2" aria-hidden />
                Generate Strategy
              </>
            )}
          </Button>
        </footer>
      </div>
    </Modal>
  );
}
