import { ChevronLeft, ChevronRight } from "lucide-react";

interface StoreOnboardingConfigStepPromoProps {
  onBack: () => void;
  onNext: () => void;
  isCreating: boolean;
}

/**
 * Promo does not ship POG fixture/shelf/compliance APIs. This step mirrors the
 * wizard layout and explains that advanced configuration is out of scope here.
 */
export function StoreOnboardingConfigStepPromo({
  onBack,
  onNext,
  isCreating,
}: StoreOnboardingConfigStepPromoProps) {
  return (
    <div className="rounded-xl border border-ithina-border bg-ithina-panel/90 shadow-xl">
      <div className="border-b border-ithina-border px-6 py-5">
        <h2 className="text-lg font-bold text-white">Store configuration</h2>
        <p className="mt-1 text-sm text-slate-500">
          Defaults and physical dimensions (POG-style) are not available in Promo. Continue to
          create the store and assign team members.
        </p>
      </div>
      <div className="space-y-4 px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isCreating}
            className="btn btn-secondary gap-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Back
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={isCreating}
            className="btn btn-primary min-w-[160px] gap-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? "Creating…" : "Next"}
            {!isCreating ? <ChevronRight className="size-4" aria-hidden /> : null}
          </button>
        </div>

        <div className="rounded-lg border border-ithina-border/60 bg-ithina-bg/40 px-4 py-3 text-sm text-slate-400">
          After creation, you can manage campaigns and store settings from the admin and maker
          flows. Shelf dimensions in the list view remain available when the API exposes them.
        </div>
      </div>
    </div>
  );
}
