import {
  DEFAULT_LANGUAGE_CODE,
  PROMO_LANGUAGES,
  buildPromptWithLanguage,
  getLanguageOption,
  isLanguageCode,
} from "./promo-languages";

describe("promo language helpers", () => {
  it("should expose English as the default language", () => {
    expect(DEFAULT_LANGUAGE_CODE).toBe("en");
    expect(getLanguageOption(DEFAULT_LANGUAGE_CODE).englishName).toBe("English");
  });

  it("should include unique language codes", () => {
    const codes = PROMO_LANGUAGES.map((language) => language.code);

    expect(new Set(codes).size).toBe(codes.length);
  });

  it("should identify supported language codes", () => {
    expect(isLanguageCode("es")).toBe(true);
    expect(isLanguageCode("unknown")).toBe(false);
    expect(isLanguageCode(null)).toBe(false);
  });

  it("should prefix prompts with the requested reply language", () => {
    const prompt = buildPromptWithLanguage("  Promote bakery markdowns  ", "fr");

    expect(prompt).toContain("Reply in French only");
    expect(prompt).toContain("Promote bakery markdowns");
    expect(prompt).not.toContain("  Promote");
  });
});
