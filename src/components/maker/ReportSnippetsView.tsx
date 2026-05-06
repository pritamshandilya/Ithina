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
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  FileText,
  Info,
  Lightbulb,
  Send,
  Upload,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { SendForApprovalModal } from "@/components/maker/SendForApprovalModal";
import { ImageViewer } from "@/components/shared/imageViewer/ImageViewer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import type {
  ReportIssueCategory,
  ReportKeyFinding,
  ReportSnippet,
} from "@/lib/analysis";
import { cn } from "@/lib/utils";
import type { ComplianceRuleSetSummary } from "@/types/complianceRuleSet";

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
    return <XCircle className="text-destructive size-4 shrink-0" aria-hidden />;
  if (type === "warning")
    return (
      <AlertTriangle className="size-4 shrink-0 text-amber-500" aria-hidden />
    );
  return <Info className="text-accent size-4 shrink-0" aria-hidden />;
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
        description:
          "This analysis has been sent to the Store Manager for review.",
      });
      navigate({ to: "/maker/audits/planogram" });
    }, 800);
  };

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
            <h2 className="text-foreground text-lg font-bold">
              Combined Compliance & Analysis Report
            </h2>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {report.planogramName
                ? `Planogram "${report.planogramName}" • ${report.productsDetected} products detected • ${report.analysisIssues} analysis issues`
                : `${report.productsDetected} products detected • ${report.analysisIssues} analysis issues`}
            </p>
          </div>
        )}
        <Button
          size="sm"
          variant="accent"
          asChild
          className={isHistorical ? "ml-auto" : undefined}
        >
          <Link
            to={viewFullReportTo}
            preload="render"
            state={
              (viewFullReportState ?? {
                imageUrl: imagePreview ?? undefined,
                report,
              }) as Record<string, unknown>
            }
          >
            <FileText className="size-4" aria-hidden />
            View Full Report
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:h-[min(640px,calc(100vh-14rem))] lg:grid-cols-[1fr_1fr] lg:items-stretch xl:grid-cols-[1.2fr_1fr]">
        <section className="border-border bg-card/80 flex min-h-[320px] flex-col overflow-hidden rounded-xl border shadow-sm lg:min-h-0">
          <div className="border-border flex shrink-0 items-center justify-between border-b px-4 py-3">
            <h3 className="text-foreground text-sm font-semibold">
              Observed Display Unit
            </h3>
            <div className="flex items-center gap-2">
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
          <div className="bg-muted/30 min-h-0 flex-1 overflow-auto">
            {imagePreview ? (
              <ImageViewer imageUrl={imagePreview} className="p-4" />
            ) : (
              <div className="text-muted-foreground flex h-full min-h-[280px] items-center justify-center">
                <p className="text-sm">No image</p>
              </div>
            )}
          </div>
          <div className="border-border text-muted-foreground flex shrink-0 flex-wrap gap-4 border-t px-4 py-2 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="bg-chart-2 h-3 w-3 rounded-sm" aria-hidden />
              Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-destructive h-3 w-3 rounded-sm" aria-hidden />
              Issue
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="border-muted-foreground h-3 w-3 rounded-sm border border-dashed"
                aria-hidden
              />
              Empty space
            </span>
          </div>
        </section>

        <section className="border-border bg-card/80 flex min-h-[320px] flex-col overflow-hidden rounded-xl border shadow-sm lg:min-h-0">
          <div className="min-h-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto p-4">
            {/* Key metrics row */}
            <div className="scrollbar-thin -mx-1 flex gap-2 overflow-x-auto pb-2">
              <MetricCard
                label="Compliance"
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
            <div className="border-border bg-card/40 rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <Info className="text-accent size-4" aria-hidden />
                <h3 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                  Executive Summary
                </h3>
              </div>
              <p className="text-foreground text-sm">
                {report.executiveSummary}
              </p>
              <div className="mt-3 space-y-2">
                {report.keyFindings.map((f, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-2 rounded-md px-3 py-2 text-sm",
                      f.type === "error" &&
                        "bg-destructive/10 border-destructive/30 border",
                      f.type === "warning" &&
                        "border border-amber-500/30 bg-amber-500/10",
                      f.type === "info" &&
                        "bg-accent/10 border-accent/30 border",
                    )}
                  >
                    <KeyFindingIcon type={f.type} />
                    <span className="text-foreground">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI recommendations */}
            <div className="border-accent/40 bg-accent/10 rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <Lightbulb className="text-accent size-4" aria-hidden />
                <h3 className="text-accent text-xs font-bold tracking-wider uppercase">
                  AI Recommendations
                </h3>
              </div>
              <ul className="text-foreground space-y-1.5 text-sm">
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
                    IssueCategoryVariant({ variant: cat.variant }),
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
  const score =
    variant === "score" && typeof value === "string"
      ? parseInt(value, 10)
      : null;
  return (
    <div
      className={cn(
        "flex min-w-[72px] shrink-0 flex-col items-center justify-center rounded-lg border px-3 py-2 text-center",
        variant === "error" && "border-destructive/50 bg-destructive/5",
        !variant && "border-border bg-card/60",
      )}
    >
      {variant === "score" && score !== null ? (
        <div className="relative mb-1 size-10">
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
              stroke={
                score >= 80
                  ? "var(--chart-2)"
                  : score > 0
                    ? "var(--amber-500)"
                    : "var(--destructive)"
              }
              strokeWidth="3"
              strokeDasharray={`${(score / 100) * 100} 100`}
            />
          </svg>
          <span className="text-foreground absolute inset-0 flex items-center justify-center text-xs font-bold">
            {value}
          </span>
        </div>
      ) : (
        <p className="text-foreground text-lg font-bold">{value}</p>
      )}
      <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
        {label}
      </p>
    </div>
  );
}
