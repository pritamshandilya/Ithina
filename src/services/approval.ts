import {
  MOCK_INBOX_ITEMS,
  MOCK_PAYLOAD_ROWS,
  MOCK_VALIDATION_CHECKS,
} from "@/mocks/approval";
import { apiDelay } from "@/lib/api-delay";
import type { InboxItem, PayloadRow, ValidationCheck } from "@/types/approval";

// TODO (backend): replace with axios.get("/api/approval/inbox")
export async function getInboxItems(): Promise<InboxItem[]> {
  await apiDelay(400);
  return MOCK_INBOX_ITEMS;
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
