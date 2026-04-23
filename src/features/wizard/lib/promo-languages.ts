/**
 * Promo Assistant reply language — wire format for {@link buildPromptWithLanguage}
 * and the language dropdown in {@link ChatPanel}.
 */

const LANGUAGE_CODES = [
  "en",
  "es",
  "fr",
  "de",
  "hi",
  "zh",
  "ja",
  "pt",
  "it",
  "ko",
] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export interface LanguageOption {
  code: LanguageCode;
  /** Shown in the selector (native script when useful). */
  nativeName: string;
  /** English label for instructions / debugging. */
  englishName: string;
  /** Hint text for the intent textarea. */
  inputPlaceholder: string;
}

export const DEFAULT_LANGUAGE_CODE: LanguageCode = "en";

export const PROMO_LANGUAGES: readonly LanguageOption[] = [
  {
    code: "en",
    nativeName: "English",
    englishName: "English",
    inputPlaceholder: "Describe your promotion intent…",
  },
  {
    code: "es",
    nativeName: "Español",
    englishName: "Spanish",
    inputPlaceholder: "Describe la promoción…",
  },
  {
    code: "fr",
    nativeName: "Français",
    englishName: "French",
    inputPlaceholder: "Décrivez votre promotion…",
  },
  {
    code: "de",
    nativeName: "Deutsch",
    englishName: "German",
    inputPlaceholder: "Beschreiben Sie Ihre Aktion…",
  },
  {
    code: "hi",
    nativeName: "हिन्दी",
    englishName: "Hindi",
    inputPlaceholder: "अपने प्रोमो का विवरण…",
  },
  {
    code: "zh",
    nativeName: "中文",
    englishName: "Chinese",
    inputPlaceholder: "描述您的促销内容…",
  },
  {
    code: "ja",
    nativeName: "日本語",
    englishName: "Japanese",
    inputPlaceholder: "プロモーション内容を説明…",
  },
  {
    code: "pt",
    nativeName: "Português",
    englishName: "Portuguese",
    inputPlaceholder: "Descreva a promoção…",
  },
  {
    code: "it",
    nativeName: "Italiano",
    englishName: "Italian",
    inputPlaceholder: "Descrivi la promozione…",
  },
  {
    code: "ko",
    nativeName: "한국어",
    englishName: "Korean",
    inputPlaceholder: "프로모션을 설명하세요…",
  },
] as const;

export function getLanguageOption(code: LanguageCode): LanguageOption {
  const found = PROMO_LANGUAGES.find((l) => l.code === code);
  return found ?? PROMO_LANGUAGES[0];
}

export function isLanguageCode(value: string | null | undefined): value is LanguageCode {
  return value != null && (LANGUAGE_CODES as readonly string[]).includes(value);
}

/**
 * Prefixes the user’s NL intent so the draft / intent service replies in the chosen language.
 * The exact phrasing is opaque to users (only their `text` appears in the chat bubble).
 */
export function buildPromptWithLanguage(text: string, code: LanguageCode): string {
  const trimmed = text.trim();
  const { englishName } = getLanguageOption(code);
  if (code === DEFAULT_LANGUAGE_CODE) return trimmed;
  return `[Reply in ${englishName} only; keep product names and SKUs as given.]\n\n${trimmed}`;
}
