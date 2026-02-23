/**
 * ProductDetailsTable – flattened product list with SKU, Product, Category, Shelf, etc.
 */

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { getCategoryColor } from "@/lib/constants/planogram";
import type { PlanogramShelfDef } from "@/types/planogram";

export interface ProductDetailsRow {
  id: string;
  sku: string;
  product: string;
  category: string;
  shelfNumber: number;
  shelfName: string;
  facings: number;
  productWidth: number;
  productHeight: number;
  productDepth: number;
  depthCount: number;
  stockedDepth: number;
  totalUnits: number;
  currentStock: number;
  optimalStock: number;
  isHighDemand: boolean;
}

function flattenProducts(
  shelves: PlanogramShelfDef[],
  highDemandSkus: string[]
): ProductDetailsRow[] {
  const rows: ProductDetailsRow[] = [];
  for (const shelf of shelves) {
    for (const p of shelf.products) {
      const totalUnits = p.facings * (p.depthCount || 1);
      rows.push({
        id: `${shelf.shelfNumber}-${p.sku}`,
        sku: p.sku,
        product: p.name,
        category: p.category,
        shelfNumber: shelf.shelfNumber,
        shelfName: shelf.name,
        facings: p.facings,
        productWidth: p.width,
        productHeight: p.height,
        productDepth: p.depth,
        depthCount: p.depthCount,
        stockedDepth: p.depth * (p.depthCount || 1),
        totalUnits,
        currentStock: p.currentStock,
        optimalStock: p.optimalStock,
        isHighDemand: highDemandSkus.includes(p.sku),
      });
    }
  }
  return rows;
}

export interface ProductDetailsTableProps {
  shelves: PlanogramShelfDef[];
  highDemandSkus: string[];
  units?: string;
  className?: string;
}

export function ProductDetailsTable({
  shelves,
  highDemandSkus,
  units = "mm",
  className,
}: ProductDetailsTableProps) {
  const data = flattenProducts(shelves, highDemandSkus);

  const columns: DataTableColumn<ProductDetailsRow>[] = [
    {
      title: "SKU",
      field: "sku",
      width: 120,
      sorter: "string",
      headerSort: true,
    },
    {
      title: "Product",
      field: "product",
      minWidth: 180,
      sorter: "string",
      headerSort: true,
    },
    {
      title: "Category",
      field: "category",
      width: 140,
      sorter: "string",
      headerSort: true,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => ProductDetailsRow }).getData();
        const colorClass = getCategoryColor(row.category);
        return `
          <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass} border text-stone-300 dark:text-foreground">
            ${row.category}
          </span>
        `;
      },
    },
    {
      title: "Shelf",
      field: "shelfName",
      width: 160,
      sorter: "string",
      headerSort: true,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => ProductDetailsRow }).getData();
        return `<span class="text-muted-foreground">${row.shelfNumber}</span> · ${row.shelfName}`;
      },
    },
    {
      title: "Facings",
      field: "facings",
      width: 90,
      sorter: "number",
      headerSort: true,
    },
    {
      title: "W",
      field: "productWidth",
      width: 80,
      sorter: "number",
      headerSort: true,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => ProductDetailsRow }).getData();
        return `<span class="tabular-nums">${row.productWidth} ${units}</span>`;
      },
    },
    {
      title: "H",
      field: "productHeight",
      width: 80,
      sorter: "number",
      headerSort: true,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => ProductDetailsRow }).getData();
        return `<span class="tabular-nums">${row.productHeight} ${units}</span>`;
      },
    },
    {
      title: "D",
      field: "productDepth",
      width: 80,
      sorter: "number",
      headerSort: true,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => ProductDetailsRow }).getData();
        return `<span class="tabular-nums">${row.productDepth} ${units}</span>`;
      },
    },
    {
      title: "Depth Count",
      field: "depthCount",
      width: 110,
      sorter: "number",
      headerSort: true,
    },
    {
      title: "Stocked Depth",
      field: "stockedDepth",
      width: 130,
      sorter: "number",
      headerSort: true,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => ProductDetailsRow }).getData();
        return `<span class="tabular-nums">${row.stockedDepth} ${units}</span>`;
      },
    },
    {
      title: "Total Units",
      field: "totalUnits",
      width: 110,
      sorter: "number",
      headerSort: true,
    },
    {
      title: "Stock",
      field: "currentStock",
      width: 100,
      sorter: "number",
      headerSort: true,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => ProductDetailsRow }).getData();
        return `${row.currentStock}/${row.optimalStock}`;
      },
    },
    {
      title: "Demand",
      field: "isHighDemand",
      width: 100,
      sorter: "boolean",
      headerSort: true,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => ProductDetailsRow }).getData();
        if (!row.isHighDemand) return "—";
        return `
          <span class="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400" title="High demand">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            HIGH
          </span>
        `;
      },
    },
  ];

  return (
    <div className={className}>
      <h3 className="mb-3 text-sm font-semibold text-foreground">Product Details</h3>
      <DataTable
        columns={columns}
        data={data}
        rowIdField="id"
        emptyMessage="No products"
        initialSort={{ field: "shelfNumber", dir: "asc" }}
        pageSize={10}
        layout="fitData"
      />
    </div>
  );
}
