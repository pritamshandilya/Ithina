import { CheckCircle2, Loader2 } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCampaignName } from "@/store/slices/campaign-slice";

export interface SubmitDisplayTag {
  label: string;
  variant: "esl" | "lcd";
}

interface SubmitReviewStepProps {
  onSubmit: () => void;
  isSubmitting?: boolean;
  dataSourceLabel: string;
  skuCount: number;
  scheduleDateLabel?: string;
  scheduleTimeLabel?: string;
  /** Shown when an optional end date was set on the schedule step. */
  scheduleEndLabel?: string;
  /** Note when "auto-approve on schedule" was enabled in the wizard. */
  autoApproveNote?: string;
  displayTags: SubmitDisplayTag[];
}

export default function SubmitReviewStep({
  onSubmit,
  isSubmitting = false,
  dataSourceLabel,
  skuCount,
  scheduleDateLabel = "Immediate",
  scheduleTimeLabel = "08:00",
  scheduleEndLabel,
  autoApproveNote,
  displayTags,
}: SubmitReviewStepProps) {
  const dispatch = useAppDispatch();
  const campaignName = useAppSelector((s) => s.campaign.name);

  return (
    <div className="flex flex-1 animate-[fadeIn_0.3s_ease-out] overflow-y-auto">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10">
            <CheckCircle2 className="size-4 text-emerald-400" strokeWidth={1.5} aria-hidden />
          </div>
          <div>
            <h3 className="text-lg font-bold leading-tight text-white">Ready to Submit</h3>
            <p className="text-sm text-slate-400">Review summary before sending for approval.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-ithina-border bg-ithina-panel p-5">
          <label
            className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500"
            htmlFor="wizard-submit-campaign-name"
          >
            Campaign Name
          </label>
          <input
            id="wizard-submit-campaign-name"
            type="text"
            value={campaignName}
            onChange={(e) => dispatch(setCampaignName(e.target.value))}
            placeholder="Enter campaign name…"
            className="w-full rounded-xl border border-ithina-border bg-ithina-bg px-4 py-2.5 text-sm font-semibold text-white transition-colors focus:border-ithina-purple focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-ithina-border bg-ithina-panel p-4">
            <p className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-slate-500">Data Source</p>
            <p className="text-sm font-semibold text-white">{dataSourceLabel}</p>
            <p className="mt-0.5 text-xs text-slate-500">{skuCount} SKUs</p>
          </div>
          <div className="rounded-xl border border-ithina-border bg-ithina-panel p-4">
            <p className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-slate-500">Schedule</p>
            <p className="text-sm font-semibold text-white">{scheduleDateLabel}</p>
            <p className="mt-0.5 text-xs text-slate-500">{scheduleTimeLabel}</p>
            {scheduleEndLabel ? (
              <p className="mt-1 text-xs text-slate-500">Ends {scheduleEndLabel}</p>
            ) : null}
            {autoApproveNote ? (
              <p className="mt-2 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-2 py-1.5 text-[10px] text-emerald-400/90">
                {autoApproveNote}
              </p>
            ) : null}
          </div>
          <div className="col-span-2 rounded-xl border border-ithina-border bg-ithina-panel p-4">
            <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-slate-500">Target Displays</p>
            {displayTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {displayTags.map((tag, index) => (
                  <span
                    key={`${tag.variant}-${tag.label}-${index}`}
                    className={
                      tag.variant === "lcd"
                        ? "rounded-lg border border-amber-400/25 bg-amber-400/8 px-2.5 py-1 font-mono text-[10px] text-amber-400"
                        : "rounded-lg border border-ithina-purple/25 bg-ithina-purple/8 px-2.5 py-1 font-mono text-[10px] text-ithina-purple"
                    }
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-slate-500">No screens selected</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-ithina-purple py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all hover:bg-ithina-purple-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
            ) : (
              <CheckCircle2 className="size-4 shrink-0" strokeWidth={2} aria-hidden />
            )}
            {isSubmitting ? "Submitting…" : "Send for Approval"}
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-600">
          Draft cleared on submit · campaign moves to Approval Queue
        </p>
      </div>
    </div>
  );
}
