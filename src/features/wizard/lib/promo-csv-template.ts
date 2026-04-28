/**
 * Promo wizard SKU upload template. Headers are chosen to align with
 * `discover_csv_fields` column heuristics (sku, product_name, current_price,
 * proposed_price, stock_qty) in `dd_promo_api_v1` campaign_service.
 */
export const PROMO_SKU_CSV_TEMPLATE_FILENAME = "ithina_promo_skus_template.csv";

export function buildPromoSkuCsvTemplate(): string {
  const rows: string[] = [
    "SKU,Product Name,Current Price,Sale Price,Stock Qty",
    "ELC-IPH15-128,Apple iPhone 15 128GB Black,799.00,699.00,24",
    "ELC-SGS23-256,Samsung Galaxy S23 256GB,899.99,749.99,12",
    "GRO-MILK-1L,Organic Whole Milk 1L,4.49,3.99,80",
    "GRO-CHIPS-150,Mesquite BBQ Potato Chips 150g,3.29,2.50,120",
    "HBA-SHAM-400,Everyday Shampoo 400ml,8.99,6.99,45",
  ];
  return rows.join("\n");
}
