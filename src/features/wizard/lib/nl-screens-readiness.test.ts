import { isNlScreensStepComplete } from "./nl-screens-readiness";

describe("isNlScreensStepComplete", () => {
  const emptySizes = { chroma29: [], chroma42: [], lcd: [] };

  it("should be incomplete until design is configured", () => {
    expect(isNlScreensStepComplete(["chroma42"], { ...emptySizes, chroma42: ['4.2"'] }, false)).toBe(false);
  });

  it("should be incomplete when selected devices have no selected size", () => {
    expect(isNlScreensStepComplete(["chroma42"], emptySizes, true)).toBe(false);
  });

  it("should be complete for ESL when design and size are selected", () => {
    expect(isNlScreensStepComplete(["chroma42"], { ...emptySizes, chroma42: ['4.2"'] }, true)).toBe(true);
  });

  it("should be complete for LCD when design and size are selected", () => {
    expect(isNlScreensStepComplete(["lcd"], { ...emptySizes, lcd: ['10"'] }, true)).toBe(true);
  });

  it("should ignore sizes for devices that are not selected", () => {
    expect(isNlScreensStepComplete(["lcd"], { ...emptySizes, chroma42: ['4.2"'] }, true)).toBe(false);
  });
});
