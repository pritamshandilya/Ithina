/**
 * Report Snippets View
 *
 * Displays key sections of the full compliance report after analysis:
 * - Key metrics row
 * - Executive summary & key findings
 * - AI recommendations
 * - Issue categories
 *
 * Compliance by shelf, planogram issue distribution, and issues to review
 * are available in the full report.
 */

import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  FileText,
  Info,
  Lightbulb,
  Minus,
  Plus,
  Send,
  Upload,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SendForApprovalModal } from "@/components/maker/send-for-approval-modal";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type {
  ReportSnippet,
  ReportKeyFinding,
  ReportIssueCategory,
} from "@/lib/analysis";
import type { ComplianceRuleSetSummary } from "@/types/compliance-rule-set";

export interface ReportSnippetsViewProps {
  /** Shelf image preview URL */
  imagePreview: string | null;
  /** Report snippet data */
  report: ReportSnippet;
  /** Callback when user wants to replace image */
  onReplaceImage?: () => void;
  /** Index of issue to highlight on image */
  highlightedIssueIndex?: number | null;
  /** Callback when user clicks an issue */
  onIssueClick?: (index: number) => void;
  /** When true, hides Replace and Send for Approval (e.g. for historical runs) */
  isHistorical?: boolean;
  /** Custom link for View Full Report (e.g. with state) */
  viewFullReportTo?: string;
  /** State to pass when navigating to View Full Report */
  viewFullReportState?: Record<string, unknown>;
  /** Selected rule set summary (preferred when available) */
  selectedRuleSet?: ComplianceRuleSetSummary | null;
  /** Fallback name when rule set is not found in API (e.g. custom selection) */
  selectedRuleSetName?: string | null;
}

function KeyFindingIcon({ type }: { type: ReportKeyFinding["type"] }) {
  if (type === "error")
    return <XCircle className="size-4 shrink-0 text-destructive" aria-hidden />;
  if (type === "warning")
    return <AlertTriangle className="size-4 shrink-0 text-amber-500" aria-hidden />;
  return <Info className="size-4 shrink-0 text-accent" aria-hidden />;
}

function IssueCategoryVariant({
  variant,
}: {
  variant?: ReportIssueCategory["variant"];
}) {
  const map: Record<string, string> = {
    matched: "bg-chart-2/20 text-chart-2 border-chart-2/40",
    misplaced: "bg-amber-500/20 text-amber-600 border-amber-500/40",
    missing: "bg-destructive/20 text-destructive border-destructive/40",
    extra: "bg-blue-500/20 text-blue-600 border-blue-500/40",
    depth: "bg-teal-500/20 text-teal-600 border-teal-500/40",
    analysis: "bg-accent/20 text-accent border-accent/40",
  };
  return map[variant ?? "analysis"] ?? map.analysis;
}

export function ReportSnippetsView({
  imagePreview,
  report,
  onReplaceImage,
  highlightedIssueIndex: _highlightedIssueIndex = null,
  onIssueClick: _onIssueClick,
  isHistorical = false,
  viewFullReportTo = "/maker/reports/view",
  viewFullReportState,
  selectedRuleSet,
  selectedRuleSetName,
}: ReportSnippetsViewProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [sendForApprovalOpen, setSendForApprovalOpen] = useState(false);
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);

  const handleSendForApproval = (_notes: string) => {
    setIsSubmittingApproval(true);
    // TODO: Call API to submit for approval
    setTimeout(() => {
      setIsSubmittingApproval(false);
      setSendForApprovalOpen(false);
      toast({
        title: "Sent for approval",
        description: "This analysis has been sent to the Store Manager for review.",
      });
      navigate({ to: "/maker/audits/planogram" });
    }, 800);
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 2));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.5));

  return (
    <div className="space-y-4">
      <SendForApprovalModal
        isOpen={sendForApprovalOpen}
        onClose={() => setSendForApprovalOpen(false)}
        onSubmit={handleSendForApproval}
        isLoading={isSubmittingApproval}
        selectedRuleSet={selectedRuleSet ?? null}
        selectedRuleSetName={selectedRuleSetName ?? "Default Rules"}
      />
      {/* Report header - hide title when isHistorical (parent page provides it) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {!isHistorical && (
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Combined Compliance & Analysis Report
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {report.planogramName
                ? `Planogram "${report.planogramName}" • ${report.productsDetected} products detected • ${report.analysisIssues} analysis issues`
                : `${report.productsDetected} products detected • ${report.analysisIssues} analysis issues`}
            </p>
          </div>
        )}
        <Button size="sm" variant="accent" asChild className={isHistorical ? "ml-auto" : undefined}>
          <Link
            to={viewFullReportTo}
            preload="render"
            state={
              (viewFullReportState ?? {
                imageUrl: imagePreview ?? undefined,
              }) as Record<string, unknown>
            }
          >
            <FileText className="size-4" aria-hidden />
            View Full Report
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.2fr_1fr] lg:h-[min(640px,calc(100vh-14rem))] lg:items-stretch">
        {/* Left: Observed Shelf */}
        <section className="rounded-xl border border-border bg-card/80 overflow-hidden shadow-sm flex flex-col min-h-[320px] lg:min-h-0">
          <div className="border-b border-border px-4 py-3 flex items-center justify-between shrink-0">
            <h3 className="text-sm font-semibold text-foreground">Observed Shelf</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoomLevel >= 2} aria-label="Zoom in">
                <Plus className="size-4" aria-hidden />
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoomLevel <= 0.5} aria-label="Zoom out">
                <Minus className="size-4" aria-hidden />
              </Button>
              {!isHistorical && (
                <>
                  <Button size="sm" variant="accent" onClick={onReplaceImage}>
                    <Upload className="size-4" aria-hidden />
                    Replace
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setSendForApprovalOpen(true)}
                    variant="success"
                  >
                    <Send className="size-4" aria-hidden />
                    Send for Approval
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-auto bg-muted/30">
            {imagePreview ? (
              <div className="p-4 flex items-center justify-center min-h-full">
                <img
                  src={imagePreview}
                  alt="Shelf analysis"
                  className="max-w-full object-contain transition-transform duration-200"
                  style={{ transform: `scale(${zoomLevel})` }}
                />
              </div>
            ) : (
              <div className="flex h-full min-h-[280px] items-center justify-center text-muted-foreground">
                <p className="text-sm">No image</p>
              </div>
            )}
          </div>
          <div className="border-t border-border px-4 py-2 flex flex-wrap gap-4 text-xs text-muted-foreground shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-chart-2" aria-hidden />
              Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-destructive" aria-hidden />
              Issue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm border border-dashed border-muted-foreground" aria-hidden />
              Empty space
            </span>
          </div>
        </section>

        {/* Right: Report snippets (scrollable) */}
        <section className="rounded-xl border border-border bg-card/80 overflow-hidden shadow-sm flex flex-col min-h-[320px] lg:min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 space-y-4">
            {/* Key metrics row */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 scrollbar-thin">
              <MetricCard
                label="Category"
                value={`${report.complianceScore}%`}
                variant="score"
              />
              <MetricCard label="Matched" value={report.matched} />
              <MetricCard label="Misplaced" value={report.misplaced} />
              <MetricCard label="Missing" value={report.missing} />
              <MetricCard label="Extra" value={report.extra} />
              <MetricCard label="Issues" value={report.issues} />
              <MetricCard label="Facings" value={report.facings} />
              <MetricCard label="Units" value={report.units} />
              <MetricCard label="Detected" value={report.detected} />
              <MetricCard label="Gap" value={report.gap} variant="error" />
            </div>

            {/* Executive summary */}
            <div className="rounded-lg border border-border bg-card/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="size-4 text-accent" aria-hidden />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Executive Summary
                </h3>
              </div>
              <p className="text-sm text-foreground">{report.executiveSummary}</p>
              <div className="mt-3 space-y-2">
                {report.keyFindings.map((f, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-2 rounded-md px-3 py-2 text-sm",
                      f.type === "error" && "bg-destructive/10 border border-destructive/30",
                      f.type === "warning" && "bg-amber-500/10 border border-amber-500/30",
                      f.type === "info" && "bg-accent/10 border border-accent/30"
                    )}
                  >
                    <KeyFindingIcon type={f.type} />
                    <span className="text-foreground">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI recommendations */}
            <div className="rounded-lg border border-accent/40 bg-accent/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="size-4 text-accent" aria-hidden />
                <h3 className="text-xs font-bold uppercase tracking-wider text-accent">
                  AI Recommendations
                </h3>
              </div>
              <ul className="space-y-1.5 text-sm text-foreground">
                {report.aiRecommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-accent shrink-0">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Issue categories */}
            <div className="flex flex-wrap gap-2">
              {report.issueCategories.map((cat) => (
                <div
                  key={cat.id}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium",
                    IssueCategoryVariant({ variant: cat.variant })
                  )}
                >
                  {cat.title} {cat.count}
                </div>
              ))}
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: number | string;
  variant?: "score" | "error";
}) {
  const score = variant === "score" && typeof value === "string" ? parseInt(value, 10) : null;
  return (
    <div
      className={cn(
        "shrink-0 rounded-lg border px-3 py-2 min-w-[72px] text-center flex flex-col items-center justify-center",
        variant === "error" && "border-destructive/50 bg-destructive/5",
        !variant && "border-border bg-card/60"
      )}
    >
      {variant === "score" && score !== null ? (
        <div className="relative size-10 mb-1">
          <svg viewBox="0 0 36 36" className="size-10 -rotate-90">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={score >= 80 ? "var(--chart-2)" : score > 0 ? "var(--amber-500)" : "var(--destructive)"}
              strokeWidth="3"
              strokeDasharray={`${(score / 100) * 100} 100`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
            {value}
          </span>
        </div>
      ) : (
        <p className="text-lg font-bold text-foreground">{value}</p>
      )}
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

