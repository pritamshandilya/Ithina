import { promoQueryClient } from "@/lib/query-client";
import store from "@/store";
import { deactivateCampaign } from "@/store/slices/campaign-slice";
import { resetStudio } from "@/store/slices/studio-slice";
import { resetWizard } from "@/store/slices/wizard-slice";

/**
 * Clears in-memory UI state and TanStack Query caches that must not leak across
 * users or sessions (SPA navigation keeps the JS runtime alive without a full reload).
 */
export function resetClientSessionState(): void {
  store.dispatch(resetWizard());
  store.dispatch(deactivateCampaign());
  store.dispatch(resetStudio());
  promoQueryClient.clear();
}
