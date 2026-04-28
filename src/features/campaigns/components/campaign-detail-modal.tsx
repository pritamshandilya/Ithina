import { AlertTriangle, CheckCircle2, ChevronLeft, Minus, XCircle } from "lucide-react";
import { memo, useMemo } from "react";

import LoadingSpinner from "@/components/shared/loading-spinner";
import { useCampaign } from "@/hooks/use-campaigns";
import { useGuardrails } from "@/hooks/use-guardrails";
import type { GuardRailRule } from "@/mocks/guard-rails";
import { derivePipelineForRow } from "@/services/campaigns";
import { formatSkuMarginPercent } from "@/services/wizard";
import type { ApiCampaignSKU } from "@/types/api/campaigns";
import type { CampaignListItem } from "@/types/campaigns";

function formatIso(iso: string | undefined): string {
  if (!iso?.trim()) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function skuName(s: ApiCampaignSKU): string {
  return (s.name ?? s.product_name ?? s.sku ?? "—").trim() || "—";
}

function skuMarginViolationLabel(s: ApiCampaignSKU): string {
  const reason = s.violation_reason?.trim() ?? "";
  const pct = s.margin_pct;
  if (typeof pct === "number" && !Number.isNaN(pct) && (!reason || /margin/i.test(reason))) {
    return formatSkuMarginPercent(pct);
  }
  return reason || "Below margin policy";
}

function offerLine(s: ApiCampaignSKU): string {
  const type = s.offerType ?? s.offer_type;
  const label = s.offerLabel ?? s.offer_label;
  if (type && label) return `${type}: ${label}`;
  if (label) return label;
  if (type) return type;
  if (s.isFree || s.is_free) return "Free item";
  return "—";
}

/** Margin-style rules: validated per SKU with `is_safe` on the campaign payload. */
function isMarginFloorStyleRule(rule: GuardRailRule): boolean {
  const n = rule.name.toLowerCase();
  if (n === "margin floor") return true;
  if (rule.category === "Pricing" && (n.includes("margin") || n.includes("floor"))) return true;
  if (typeof rule.thresholdValue === "number" && rule.category === "Pricing" && n.includes("margin")) {
    return true;
  }
  return n.includes("margin") && (n.includes("floor") || n.includes("minimum"));
}

function statusTone(
  g: "pass" | "warn" | "fail" | undefined,
): { label: string; className: string; Icon: typeof CheckCircle2 } {
  if (g === "pass") {
    return {
      label: "Passed",
      className: "text-emerald-300 border-emerald-400/35 bg-emerald-400/10",
      Icon: CheckCircle2,
    };
  }
  if (g === "warn") {
    return {
      label: "Warning",
      className: "text-amber-300 border-amber-400/35 bg-amber-400/10",
      Icon: AlertTriangle,
    };
  }
  if (g === "fail") {
    return {
      label: "Failed",
      className: "text-rose-300 border-rose-400/35 bg-rose-400/10",
      Icon: XCircle,
    };
  }
  return {
    label: "—",
    className: "text-slate-400 border-ithina-border/60 bg-white/[0.03]",
    Icon: Minus,
  };
}

export interface CampaignDetailModalProps {
  campaignId: string;
  onClose: () => void;
}

function CampaignDetailModal({ campaignId, onClose }: CampaignDetailModalProps) {
  const { data, isLoading, isError, error, refetch } = useCampaign(campaignId);

  const pipeline = useMemo(() => (data ? derivePipelineForRow(data) : []), [data]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Campaign details"
    >
      <div
        className="flex max-h-[min(90vh,880px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-2xl"
      >
        <header className="flex shrink-0 items-center gap-2 border-b border-ithina-border bg-white/[0.02] px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Back to Campaigns
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {isLoading && (
            <div className="flex min-h-[200px] items-center justify-center">
              <LoadingSpinner label="Loading campaign…" />
            </div>
          )}

          {isError && !isLoading && (
            <div className="flex flex-col items-center gap-3 py-8 text-center" role="alert">
              <p className="text-sm text-rose-300">{(error as Error)?.message ?? "Failed to load campaign."}</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="rounded-lg border border-ithina-border px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
              >
                Retry
              </button>
            </div>
          )}

          {data && !isLoading && (
            <CampaignDetailBody campaign={data} pipeline={pipeline} />
          )}
        </div>
      </div>
    </div>
  );
}

function GuardRailsValidationSection({ campaign }: { campaign: CampaignListItem }) {
  const { data: rules = [], isLoading } = useGuardrails();
  const active = useMemo(() => rules.filter((r) => r.active), [rules]);
  const summary = statusTone(campaign.guardrailsStatus);
  const SummaryIcon = summary.Icon;

  return (
    <section className="rounded-xl border border-ithina-border/80 bg-ithina-bg/40 p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Guard rail validation
        </h3>
        <span
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold ${summary.className}`}
        >
          <SummaryIcon className="size-3.5 shrink-0" aria-hidden />
          Campaign: {String(campaign.guardrailsStatus ?? "—")}
        </span>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-slate-500">
        Active rules from your organization. Margin checks use per-SKU data stored on the campaign. Other policies
        (brand, content, etc.) are enforced during AI layout and compliance; their row reflects the same overall
        campaign result once validation completes.
      </p>
      {isLoading && <p className="text-sm text-slate-500">Loading org guard rails…</p>}
      {!isLoading && active.length === 0 && (
        <p className="text-sm text-slate-500">No active guard rail rules in this org.</p>
      )}
      {!isLoading && active.length > 0 && (
        <ul className="space-y-3">
          {active.map((rule) => (
            <GuardRailValidationRow
              key={rule.id}
              rule={rule}
              campaign={campaign}
              skus={campaign.rawSkus ?? []}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function GuardRailValidationRow({
  rule,
  campaign,
  skus,
}: {
  rule: GuardRailRule;
  campaign: CampaignListItem;
  skus: ApiCampaignSKU[];
}) {
  const g = campaign.guardrailsStatus;

  if (isMarginFloorStyleRule(rule)) {
    const failed = skus.filter((s) => !s.is_safe);
    const passed = skus.length === 0 || failed.length === 0;
    return (
      <li className="rounded-lg border border-ithina-border/50 bg-ithina-bg/30 p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-100">{rule.name}</p>
            <p className="mt-0.5 text-xs text-slate-500">{rule.description}</p>
            {typeof rule.thresholdValue === "number" && (
              <p className="mt-1 font-mono text-[11px] text-slate-400">Floor: {rule.thresholdValue}%</p>
            )}
          </div>
          {skus.length === 0 ? (
            <span className="shrink-0 text-xs text-slate-500">No SKU data</span>
          ) : passed ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-300">
              <CheckCircle2 className="size-3.5" aria-hidden />
              All SKUs validated
            </span>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-rose-300">
              <XCircle className="size-3.5" aria-hidden />
              {failed.length} line item(s) failed
            </span>
          )}
        </div>
        {skus.length > 0 && !passed && (
          <ul className="mt-2 space-y-1 border-t border-ithina-border/40 pt-2" role="list">
            {failed.map((s) => (
              <li key={s.sku} className="font-mono text-[11px] text-rose-200/90">
                {s.sku}: {skuMarginViolationLabel(s)}
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }

  const rowTone = statusTone(
    g === "pass" ? "pass" : g === "warn" ? "warn" : g === "fail" ? "fail" : undefined,
  );
  const RowIcon = rowTone.Icon;

  return (
    <li className="rounded-lg border border-ithina-border/50 bg-ithina-bg/30 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-100">
            {rule.name}
            <span className="ml-1.5 font-normal text-slate-500">({rule.severity})</span>
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{rule.description}</p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${rowTone.className}`}
        >
          <RowIcon className="size-3" aria-hidden />
          {g === "pass" ? "Cleared" : g === "warn" ? "Warning" : g === "fail" ? "Failed" : "—"}
        </span>
      </div>
      {g && (
        <p className="mt-2 text-[10px] leading-relaxed text-slate-600">
          Aligned with the campaign&apos;s compliance pipeline result (layout / OCR pass). Status:{" "}
          <span className="font-mono text-slate-500">{g}</span>
        </p>
      )}
    </li>
  );
}

function CampaignDetailBody({
  campaign,
  pipeline,
}: {
  campaign: CampaignListItem;
  pipeline: string[];
}) {
  const skus = campaign.rawSkus ?? [];
  const guardSummary = statusTone(campaign.guardrailsStatus);
  const GuardSummaryIcon = guardSummary.Icon;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white sm:text-xl">{campaign.name}</h2>
      </div>

      <section className="rounded-xl border border-ithina-border/80 bg-ithina-bg/40 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Overview</h3>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailRow label="Status" value={campaign.status} />
          <DetailRow label="API status" value={campaign.apiStatus ?? "—"} />
          <DetailRow label="Source" value={campaign.sourceType ?? "—"} />
          <div>
            <dt className="text-[11px] font-medium text-slate-500">Guard rails (summary)</dt>
            <dd className="mt-0.5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${guardSummary.className}`}
              >
                <GuardSummaryIcon className="size-3.5 shrink-0" aria-hidden />
                {String(campaign.guardrailsStatus ?? "—")}{" "}
                <span className="text-[10px] font-normal opacity-80">({guardSummary.label})</span>
              </span>
            </dd>
          </div>
          <DetailRow label="Initiator" value={campaign.initiator} />
        </dl>
      </section>

      <GuardRailsValidationSection campaign={campaign} />

      <section className="rounded-xl border border-ithina-border/80 bg-ithina-bg/40 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Schedule</h3>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailRow label="Scheduled start" value={formatIso(campaign.scheduledAt)} />
          <DetailRow label="Scheduled end" value={formatIso(campaign.scheduledEndAt)} />
          <DetailRow label="Time of day" value={campaign.scheduledTime?.trim() || "—"} />
          <DetailRow label="Created" value={formatIso(campaign.createdAt)} />
        </dl>
      </section>

      <section className="rounded-xl border border-ithina-border/80 bg-ithina-bg/40 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Hardware</h3>
        {campaign.hardware.length === 0 ? (
          <p className="text-sm text-slate-500">No hardware targets</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {campaign.hardware.map((h) => (
              <span
                key={h}
                className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-xs text-slate-200"
              >
                {h}
              </span>
            ))}
          </div>
        )}
      </section>

      {campaign.aiPrompt ? (
        <section className="rounded-xl border border-ithina-border/80 bg-ithina-bg/40 p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Campaign prompt</h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{campaign.aiPrompt}</p>
        </section>
      ) : null}

      <section className="rounded-xl border border-ithina-border/80 bg-ithina-bg/40 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Pipeline</h3>
        <p className="text-sm text-slate-300">
          {pipeline.length ? pipeline.join(" → ") : "—"}
        </p>
      </section>

      <section className="rounded-xl border border-ithina-border/80 bg-ithina-bg/40 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Products ({skus.length})
        </h3>
        {skus.length === 0 ? (
          <p className="text-sm text-slate-500">No product rows on this campaign.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-ithina-border/60 text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3 font-medium">SKU</th>
                  <th className="py-2 pr-3 font-medium">Product</th>
                  <th className="py-2 pr-3 font-medium">Promotion / offer</th>
                  <th className="py-2 pr-3 font-medium tabular-nums">Current</th>
                  <th className="py-2 font-medium tabular-nums">Proposed</th>
                </tr>
              </thead>
              <tbody>
                {skus.map((s) => (
                  <tr
                    key={s.id + s.sku}
                    className="border-b border-ithina-border/30 text-slate-200 last:border-0"
                  >
                    <td className="py-2.5 pr-3 font-mono text-xs text-slate-400">{s.sku}</td>
                    <td className="max-w-[200px] py-2.5 pr-3 text-slate-200">{skuName(s)}</td>
                    <td className="py-2.5 pr-3 text-xs text-ithina-purple/90">{offerLine(s)}</td>
                    <td className="py-2.5 pr-3 font-mono tabular-nums text-slate-400">
                      {s.current_price != null ? s.current_price.toFixed(2) : "—"}
                    </td>
                    <td className="py-2.5 font-mono tabular-nums text-slate-200">
                      {s.proposed_price != null ? s.proposed_price.toFixed(2) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-200">{value}</dd>
    </div>
  );
}

export default memo(CampaignDetailModal);
