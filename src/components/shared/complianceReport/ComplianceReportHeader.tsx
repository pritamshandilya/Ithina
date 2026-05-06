/**
 * Compliance Report Header
 *
 * Header section with Back, title, subtitle, and Export PDF.
 * Reusable for full report pages (Maker and Checker).
 */
import { Download } from "lucide-react";

import { DetailBackButton } from "@/components/shared/DetailBackButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ComplianceReportHeaderProps {
  /** Main report title */
  title?: string;
  /** Subtitle (e.g. planogram name, products detected, issues) */
  subtitle?: string;
  /** Back navigation target */
  backTo?: string;
  /** Callback when Export PDF is clicked */
  onExportPdf?: () => void;
  /** Whether PDF export is in progress */
  isExporting?: boolean;
  /** Additional class names */
  className?: string;
}

export function ComplianceReportHeader({
  title = "Combined Compliance & Analysis Report",
  subtitle = 'Planogram "Food & Beverage Shelf" • 88 products detected • 3 analysis issues',
  backTo,
  onExportPdf,
  isExporting = false,
  className,
}: ComplianceReportHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        {backTo ? <DetailBackButton to={backTo} /> : null}
        <div>
          <h1 className="text-foreground text-lg font-bold tracking-tight sm:text-xl">
            {title}
          </h1>
          <p className="text-muted-foreground mt-0.5 text-xs">{subtitle}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onExportPdf}
        disabled={isExporting}
        className="text-foreground hover:bg-accent/10 border-accent/50 shrink-0 gap-2"
      >
        <Download className="size-4" aria-hidden />
        {isExporting ? "Generating…" : "Export PDF"}
      </Button>
    </header>
  );
}
