import type { CampaignListItem } from "@/types/campaigns";

import { derivePipelineForRow, normalizeCampaignEventsPayload } from "./campaigns";

jest.mock("@/lib/promo-api-client", () => ({
  promoApiClient: {
    delete: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

describe("campaign service helpers", () => {
  it("should normalize array and wrapped timeline payloads", () => {
    const events = [{ id: "e1" }];

    expect(normalizeCampaignEventsPayload(events)).toBe(events);
    expect(normalizeCampaignEventsPayload({ events })).toBe(events);
    expect(normalizeCampaignEventsPayload({ data: events })).toBe(events);
    expect(normalizeCampaignEventsPayload({ items: events })).toBe(events);
    expect(normalizeCampaignEventsPayload({ results: events })).toBe(events);
    expect(normalizeCampaignEventsPayload({ unknown: events })).toEqual([]);
  });

  it("should prefer an explicit row pipeline", () => {
    const row = {
      pipeline: ["Custom"],
      status: "Draft",
    } as CampaignListItem;

    expect(derivePipelineForRow(row)).toEqual(["Custom"]);
  });

  it("should derive pipeline from API status signals", () => {
    const row = {
      apiStatus: "pending_approval",
      guardrailsStatus: "pass",
      hardware: ["ESL"],
      skus: 5,
      status: "Pending",
    } as CampaignListItem;

    expect(derivePipelineForRow(row)).toEqual(["Data", "Design", "Guard Rails", "Approval"]);
  });
});
