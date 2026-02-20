/**
 * Compliance Report Header
 *
 * Header section with Back, title, subtitle, and Export PDF.
 * Reusable for full report pages (Maker and Checker).
 */

import { ArrowLeft, Download } from "lucide-react";
import { Link } from "@tanstack/react-router";
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
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
        className
      )}
    >
      <div className="flex items-center gap-4">
        {backTo && (
          <Button variant="accent" size="sm" asChild>
            <Link to={backTo}>
              <ArrowLeft className="size-4" aria-hidden />
              Back
            </Link>
          </Button>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onExportPdf}
        disabled={isExporting}
        className="gap-2 border-accent/50 text-foreground hover:bg-accent/10 shrink-0"
      >
        <Download className="size-4" aria-hidden />
        {isExporting ? "Generating…" : "Export PDF"}
      </Button>
    </header>
  );
}
