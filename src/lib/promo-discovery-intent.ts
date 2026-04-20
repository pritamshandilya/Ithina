/**
 * True when the user is asking to browse / list available promotions (catalog-style),
 * as opposed to naming a specific campaign mechanic or SKU intent.
 */
export function isPromoDiscoveryQuery(text: string): boolean {
  const t = text.toLowerCase().replace(/\s+/g, " ").trim();
  if (t.length < 3) return false;

  return (
    /\bwhat\s+promo(s|tions?|tional)?(\s+do)?(\s+we)?(\s+have|\s+are|\s+offer|\s+run)?\b/.test(t) ||
    /\bwhat\s+promotions?\s+(do\s+)?(we\s+)?(have|offer|run|exist)\b/.test(t) ||
    /\b(show|list|give)\s+(me\s+)?(the\s+)?(all\s+)?(available\s+)?promo(s|tions?)?\b/.test(t) ||
    /\b(which|any)\s+promo(s|tions?)\s+(do\s+you\s+)?(have|offer)\b/.test(t) ||
    /\bdo\s+we\s+have\s+(any\s+)?promo(s|tions?)?\b/.test(t) ||
    /\bpromo(s|tions?)\s+(available|offered|running|do\s+we\s+have)\b/.test(t) ||
    /\btell\s+me\s+(about\s+)?(the\s+)?promo(s|tions?)\b/.test(t)
  );
}
