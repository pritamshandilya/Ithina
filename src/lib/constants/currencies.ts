export const PREDEFINED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "INR",
  "JPY",
  "CAD",
  "AUD",
  "CNY",
] as const;

export type PredefinedCurrency = (typeof PREDEFINED_CURRENCIES)[number];

