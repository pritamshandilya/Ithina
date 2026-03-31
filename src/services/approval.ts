import {
  MOCK_PAYLOAD_ROWS,
  MOCK_VALIDATION_CHECKS,
} from "@/mocks/approval";
import { apiDelay } from "@/lib/api-delay";
import { PromoAuthService } from "@/lib/auth/promo-auth";
import { approveCampaign, getAllWorkflowCampaigns, rejectCampaign } from "@/services/campaigns";
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
    metaVariant: "success",
    urgent: false,
    status: "pending",
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

export async function approveInboxItem(id: string): Promise<void> {
  await approveCampaign(id);
}

export async function rejectInboxItem(id: string): Promise<void> {
  await rejectCampaign(id);
}
