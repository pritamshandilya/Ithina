import {
  MOCK_INBOX_ITEMS,
  MOCK_PAYLOAD_ROWS,
  MOCK_VALIDATION_CHECKS,
} from "@/mocks/approval";
import type { InboxItem, PayloadRow, ValidationCheck } from "@/types/approval";

export async function getInboxItems(): Promise<InboxItem[]> {
  return MOCK_INBOX_ITEMS;
}

export async function getValidationChecks(): Promise<ValidationCheck[]> {
  return MOCK_VALIDATION_CHECKS;
}

export async function getPayloadManifest(): Promise<PayloadRow[]> {
  return MOCK_PAYLOAD_ROWS;
}

export async function publishToFleet(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 3000));
}
