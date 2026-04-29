import { isPromoDiscoveryQuery } from "./promo-discovery-intent";

describe("isPromoDiscoveryQuery", () => {
  it.each([
    "what promos do we have?",
    "show me all available promotions",
    "do we have any promo",
    "tell me about the promotions",
  ])("should identify discovery query: %s", (text) => {
    expect(isPromoDiscoveryQuery(text)).toBe(true);
  });

  it.each(["discount apples by 10%", "create a weekend bakery sale", "hi"])(
    "should reject campaign intent query: %s",
    (text) => {
      expect(isPromoDiscoveryQuery(text)).toBe(false);
    },
  );
});
