jest.mock("@/lib/sanitize", () => ({
  sanitizeHtml: (html: string) => html,
}));

import { getAssistantMessageChunks } from "./chat-message-format";

function summaryCardFromChunks(chunks: ReturnType<typeof getAssistantMessageChunks>) {
  const c = chunks.find((x) => x.kind === "summary-card");
  return c?.kind === "summary-card" ? c.card : null;
}

describe("summary card: backend-aligned dates and offers", () => {
  it("parses launching tomorrow at time as Start", () => {
    const raw =
      "The **Tomorrow Sale** runs a discount launching tomorrow at 09:00 AM for perishables. It clears stock fast. Want me to go ahead and apply this?";
    const card = summaryCardFromChunks(getAssistantMessageChunks(raw));
    expect(card).not.toBeNull();
    const start = card?.rows.find((r) => r.label === "Start");
    expect(start?.value.toLowerCase()).toContain("tomorrow");
    expect(start?.value).toMatch(/09:00\s*AM/i);
  });

  it("parses from Wednesday with clock time on Start", () => {
    const raw =
      "The **Midweek Saver** is a discount from Wednesday at 08:00 AM through Friday. It builds traffic. Want me to go ahead and apply this?";
    const card = summaryCardFromChunks(getAssistantMessageChunks(raw));
    expect(card).not.toBeNull();
    const start = card?.rows.find((r) => r.label === "Start");
    expect(start?.value.toLowerCase()).toMatch(/wednesday/);
    expect(start?.value).toMatch(/08:00\s*AM/i);
  });

  it("parses through the next N days as End", () => {
    const raw =
      "The **Week Push** runs a bundle through the next 7 days. It fits your goals. Want me to go ahead and apply this?";
    const card = summaryCardFromChunks(getAssistantMessageChunks(raw));
    expect(card).not.toBeNull();
    const end = card?.rows.find((r) => r.label === "End");
    expect(end?.value.toLowerCase()).toMatch(/next\s+7\s+days/);
  });

  it("prefers specific percent in Offer over bare discount word", () => {
    const raw =
      "The **Stack Sale** applies our discount stack with 35% off juice and bundle add-ons. Runs Monday at 10:00 AM. Good margin story. Want me to go ahead and apply this?";
    const card = summaryCardFromChunks(getAssistantMessageChunks(raw));
    expect(card).not.toBeNull();
    const offer = card?.rows.find((r) => r.label === "Offer");
    expect(offer?.value).toMatch(/35%\s*off/i);
  });
});

describe("getAssistantMessageChunks: one bubble for intro + closing question", () => {
  it("merges two \\n\\n paragraphs when the second is a short question", () => {
    const raw =
      "You have a wide range of categories available, including Alcohol, Apparel, and Toys.\n\nWhich of these would you like to focus on for your next promotion?";
    const chunks = getAssistantMessageChunks(raw);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.kind).toBe("markdown");
    if (chunks[0]?.kind === "markdown") {
      expect(chunks[0].source).toContain("Which of these");
      expect(chunks[0].source).toContain("Alcohol");
    }
  });
});

describe("getAssistantMessageChunks: prose comma category list → chip-list", () => {
  it("parses including A, B, … and Z into chip-list with closing paragraph", () => {
    const raw =
      "We have a wide range of categories available, including Alcohol, Apparel, Back to School, Bakery, Beauty, Beverages, Collectibles, Electronics, Frozen, Health, Home, Office, Perishables, Pet, Pharmacy, Produce, Promotional, Seasonal Holiday, Sports, Tobacco, and Toys. \n\nWhich of these would you like to focus on for a promotion today?";
    const chunks = getAssistantMessageChunks(raw);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.kind).toBe("chip-list");
    if (chunks[0]?.kind === "chip-list") {
      expect(chunks[0].intro).toContain("categories");
      expect(chunks[0].items).toContain("Beverages");
      expect(chunks[0].items).toContain("Seasonal Holiday");
      expect(chunks[0].items).toHaveLength(21);
      expect(chunks[0].closing).toMatch(/promotion today/i);
    }
  });

  it("handles comma list + 'like X or Y' continuation in same paragraph", () => {
    const raw =
      "We have a wide range of categories ready for promotion, including Electronics, Apparel, Perishables, Beverages, and Bakery. You can also run campaigns for seasonal sections like Back to School or Seasonal Holiday.\n\nWhich category would you like to focus on today?";
    const chunks = getAssistantMessageChunks(raw);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.kind).toBe("chip-list");
    if (chunks[0]?.kind === "chip-list") {
      expect(chunks[0].items).toContain("Bakery");
      expect(chunks[0].items).toContain("Back to School");
      expect(chunks[0].items).toContain("Seasonal Holiday");
      expect(chunks[0].items).toHaveLength(7);
      expect(chunks[0].closing).toMatch(/focus on today/i);
    }
  });

  it("extracts bold category names scattered across sentences as chips", () => {
    const raw =
      'I have several categories ready for promotion, including **Electronics**, **Apparel**, **Beverages**, and **Perishables**. You can also run campaigns for **Seasonal Holiday** items or **Back to School** essentials.\n\nWhich of these would you like to focus on for your next campaign?';
    const chunks = getAssistantMessageChunks(raw);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.kind).toBe("chip-list");
    if (chunks[0]?.kind === "chip-list") {
      expect(chunks[0].items).toContain("Electronics");
      expect(chunks[0].items).toContain("Seasonal Holiday");
      expect(chunks[0].items).toContain("Back to School");
      expect(chunks[0].items).toHaveLength(6);
      expect(chunks[0].closing).toMatch(/next campaign/i);
    }
  });

  it("still produces chip-list when closing mentions 'campaign' and 'today'", () => {
    const raw =
      "You have a wide range of categories available, including Alcohol, Apparel, Back to School, Bakery, Beauty, Beverages, Collectibles, Electronics, Frozen, Health, Home, Office, Perishables, Pet, Pharmacy, Produce, Promotional, Seasonal Holiday, Sports, Tobacco, and Toys.\n\nWhich of these would you like to promote today, or would you like me to suggest a campaign based on your current inventory urgency?";
    const chunks = getAssistantMessageChunks(raw);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.kind).toBe("chip-list");
    if (chunks[0]?.kind === "chip-list") {
      expect(chunks[0].items).toContain("Electronics");
      expect(chunks[0].items).toContain("Tobacco");
      expect(chunks[0].closing).toMatch(/campaign/i);
    }
  });
});

describe("getAssistantMessageChunks: NL draft with Other suggestions (null campaign_meta prose)", () => {
  const fixture =
    "We recommend running a 30% **Fresh Saver Sale** on expiring perishables this weekend — this discount level starting Friday at 08:00 AM will clear the shelves before the stock hits its limit. Want me to go ahead and launch this, or do you have something else in mind?\n\n**Other suggestions:**\n*   **Clearance Drive**: A BOGO offer on overstock non-perishables to free up warehouse space.\n*   **Weekend Bundle**: Pair slow-moving snacks with top-selling beverages for a 15% bundle discount.\n*   **Payday Special**: A 10% discount on high-demand electronics to capture weekend spending.";

  it("produces summary-card (not promo-type option-grid) with name, 30% offer, start, end", () => {
    const chunks = getAssistantMessageChunks(fixture);
    expect(chunks.some((c) => c.kind === "option-grid")).toBe(false);
    const card = summaryCardFromChunks(chunks);
    expect(card).not.toBeNull();
    expect(card?.rows.find((r) => r.label === "Name")?.value).toBe("Fresh Saver Sale");
    expect(card?.rows.find((r) => r.label === "Offer")?.value).toBe("30%");
    const start = card?.rows.find((r) => r.label === "Start");
    expect(start?.value.toLowerCase()).toContain("friday");
    expect(start?.value).toMatch(/08:00\s*AM/i);
    const end = card?.rows.find((r) => r.label === "End");
    expect(end?.value).toMatch(/this weekend/i);
  });
});
