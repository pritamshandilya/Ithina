import {
  MOCK_PAYLOAD_ROWS,
  MOCK_VALIDATION_CHECKS,
} from "@/mocks/approval";
import { apiDelay } from "@/lib/api-delay";
import { PromoAuthService } from "@/lib/auth/promo-auth";
import {
  approveCampaign,
  getAllWorkflowCampaigns,
  getCampaignTimeline,
  rejectCampaign,
} from "@/services/campaigns";
import type { InboxItem, PayloadRow, ValidationCheck } from "@/types/approval";

// TODO (backend): replace with axios.get("/api/approval/inbox")
export async function getInboxItems(): Promise<InboxItem[]> {
  await apiDelay(400);
  const role = PromoAuthService.getCurrentUser()?.role ?? "maker";
  if (role === "maker") return [];

  const campaigns = await getAllWorkflowCampaigns();
  const pending = campaigns.filter((c) => c.submittedForApproval && c.approvalStatus === "pending");

  return pending.map((c) => ({
    id: c.id,
    title: c.name,
    subtitle: c.pipeline?.join(" > "),
    initiator: c.ownerName ?? c.initiator,
    skus: c.skus,
    meta: c.hardware.length ? `${c.hardware.length} hardware` : "All Pass",
    metaVariant: "success" as const,
    urgent: false,
    status: "pending" as const,
    apiStatus: c.apiStatus,
    scheduleType: c.scheduledAt ? "scheduled" as const : "immediate" as const,
    hardwareTargets: c.hardware,
    guardRailsLabel: "All Pass",
    submittedAt: c.date,
  }));
}

// TODO (backend): replace with axios.get("/api/approval/validations")
export async function getValidationChecks(): Promise<ValidationCheck[]> {
  await apiDelay(300);
  return MOCK_VALIDATION_CHECKS;
}

// TODO (backend): replace with axios.get("/api/approval/payload")
export async function getPayloadManifest(): Promise<PayloadRow[]> {
  await apiDelay(300);
  return MOCK_PAYLOAD_ROWS;
}

// TODO (backend): replace with axios.post("/api/approval/publish")
export async function publishToFleet(): Promise<void> {
  await apiDelay(3000);
}

/**
 * Approve a campaign and trigger batch-render on the backend.
 *
 * @param id               Campaign UUID — must be a non-empty truthy string.
 * @param scheduleType     "immediate" (default) or "scheduled".
 * @param selectedVariantId  When the caller already has the variant (e.g. from the
 *   React-Query timeline cache) pass it here to skip the extra `GET /api/v1/campaigns/{id}/events`
 *   round-trip. If omitted the function fetches the timeline itself.
 */
export async function approveInboxItem(
  id: string,
  scheduleType: "immediate" | "scheduled" = "immediate",
  selectedVariantId?: string,
): Promise<void> {
  if (!id) {
    throw new Error("Cannot approve: campaign ID is missing or undefined.");
  }

  let variantId = selectedVariantId ?? null;

  if (!variantId) {
    const events = await getCampaignTimeline(id);
    const submitEvent = [...events]
      .reverse()
      .find((e) => e.event_type === "submitted_for_approval");
    variantId =
      (submitEvent?.payload_snapshot?.selected_variant_id as string | undefined) ?? null;
  }

  if (!variantId) {
    throw new Error(
      `Cannot approve campaign ${id}: no submitted_for_approval event with a selected_variant_id was found in the timeline.`,
    );
  }

  await approveCampaign(id, {
    selected_variant_id: variantId,
    schedule_type: scheduleType,
  });
}

export async function rejectInboxItem(id: string): Promise<void> {
  await rejectCampaign(id);
}
