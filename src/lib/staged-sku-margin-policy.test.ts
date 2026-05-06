import {
  defaultIncludedForStagedSku,
  stagedSkuViolatesMarginPolicy,
} from "./staged-sku-margin-policy";

describe("stagedSkuViolatesMarginPolicy / defaultIncludedForStagedSku", () => {
  it("returns false / default included when margin is undefined", () => {
    expect(stagedSkuViolatesMarginPolicy({ safe: true, marginPct: undefined })).toBe(false);
    expect(stagedSkuViolatesMarginPolicy({ safe: false, marginPct: undefined })).toBe(false);
    expect(defaultIncludedForStagedSku({ safe: true, marginPct: undefined })).toBe(true);
  });

  it("returns false / default included when margin is zero or positive", () => {
    expect(stagedSkuViolatesMarginPolicy({ safe: true, marginPct: 0 })).toBe(false);
    expect(stagedSkuViolatesMarginPolicy({ safe: true, marginPct: 6.6 })).toBe(false);
    expect(stagedSkuViolatesMarginPolicy({ safe: false, marginPct: 6.6 })).toBe(false);
    expect(defaultIncludedForStagedSku({ safe: true, marginPct: 6.6 })).toBe(true);
  });

  it("returns true / default excluded when margin is strictly below zero", () => {
    expect(stagedSkuViolatesMarginPolicy({ safe: true, marginPct: -8.6 })).toBe(true);
    expect(stagedSkuViolatesMarginPolicy({ safe: false, marginPct: -8.6 })).toBe(true);
    expect(defaultIncludedForStagedSku({ safe: true, marginPct: -8.6 })).toBe(false);
    expect(defaultIncludedForStagedSku({ safe: false, marginPct: -0.1 })).toBe(false);
  });

  it("returns false / default included when unsafe but margin is non-negative", () => {
    expect(stagedSkuViolatesMarginPolicy({ safe: false, marginPct: 10 })).toBe(false);
    expect(defaultIncludedForStagedSku({ safe: false, marginPct: 10 })).toBe(true);
  });
});
