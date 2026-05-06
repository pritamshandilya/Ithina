import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { getCategoryColor } from "@/lib/constants/planogram";
import {
  getPlanogramProductId,
  getShelfDisplayLabel,
  sortPlanogramProducts,
  sortPlanogramShelves,
} from "@/lib/planogram/planogramSchema";
import type { PlanogramShelfDef } from "@/types/planogram";

export interface ProductDetailsRow {
  id: string;
  sku: string;
  barcode: string;
  product: string;
  brand: string;
  category: string;
  shelfId: string;
  shelfLabel: string;
  xPosition: number;
  facings: number;
  productWidth: number;
  productHeight: number;
  productDepth: number;
  depthCount: number;
  totalUnits: number;
  price: string;
  velocity: string;
  expirySensitive: string;
}

function flattenProducts(shelves: PlanogramShelfDef[]): ProductDetailsRow[] {
  const sortedShelves = sortPlanogramShelves(shelves);
  const rows: ProductDetailsRow[] = [];

  for (const shelf of sortedShelves) {
    for (const [index, product] of sortPlanogramProducts(
      shelf.products,
    ).entries()) {
      rows.push({
        id: `${shelf.id}-${getPlanogramProductId(product, String(index))}`,
        sku: product.sku ?? "—",
        barcode: product.barcode ?? "—",
        product: product.name,
        brand: product.brand,
        category: product.category ?? "Uncategorized",
        shelfId: shelf.id,
        shelfLabel: getShelfDisplayLabel(sortedShelves, shelf.id),
        xPosition: product.x_position,
        facings: product.facings,
        productWidth: product.size.width,
        productHeight: product.size.height,
        productDepth: product.size.depth,
        depthCount: product.depth_count,
        totalUnits: product.facings * (product.depth_count || 1),
        price: product.price != null ? String(product.price) : "—",
        velocity: product.velocity != null ? String(product.velocity) : "—",
        expirySensitive: product.expiry_sensitive ? "Yes" : "No",
      });
    }
  }

  return rows;
}

export interface ProductDetailsTableProps {
  shelves: PlanogramShelfDef[];
  className?: string;
}

export function ProductDetailsTable({
  shelves,
  className,
}: ProductDetailsTableProps) {
  const data = flattenProducts(shelves);

  const columns: DataTableColumn<ProductDetailsRow>[] = [
    {
      title: "SKU",
      field: "sku",
      width: 120,
      sorter: "string",
      headerSort: true,
    },
    {
      title: "Barcode",
      field: "barcode",
      width: 140,
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
      title: "Brand",
      field: "brand",
      width: 140,
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
      field: "shelfLabel",
      width: 180,
      sorter: "string",
      headerSort: true,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => ProductDetailsRow }).getData();
        return `<span class="text-muted-foreground">${row.shelfLabel}</span> · ${row.shelfId}`;
      },
    },
    {
      title: "X Position",
      field: "xPosition",
      width: 110,
      sorter: "number",
      headerSort: true,
    },
    {
      title: "Facings",
      field: "facings",
      width: 90,
      sorter: "number",
      headerSort: true,
    },
    {
      title: "Width",
      field: "productWidth",
      width: 90,
      sorter: "number",
      headerSort: true,
    },
    {
      title: "Height",
      field: "productHeight",
      width: 90,
      sorter: "number",
      headerSort: true,
    },
    {
      title: "Depth",
      field: "productDepth",
      width: 90,
      sorter: "number",
      headerSort: true,
    },
    {
      title: "Depth Count",
      field: "depthCount",
      width: 110,
      sorter: "number",
      headerSort: true,
    },
    {
      title: "Total Units",
      field: "totalUnits",
      width: 110,
      sorter: "number",
      headerSort: true,
    },
    {
      title: "Price",
      field: "price",
      width: 90,
      sorter: "string",
      headerSort: true,
    },
    {
      title: "Velocity",
      field: "velocity",
      width: 90,
      sorter: "string",
      headerSort: true,
    },
    {
      title: "Expiry Sensitive",
      field: "expirySensitive",
      width: 130,
      sorter: "string",
      headerSort: true,
    },
  ];

  return (
    <div className={className}>
      <h3 className="text-foreground mb-3 text-sm font-semibold">
        Product Details
      </h3>
      <DataTable
        columns={columns}
        data={data}
        rowIdField="id"
        emptyMessage="No products"
        initialSort={{ field: "shelfLabel", dir: "asc" }}
        pageSize={10}
        layout="fitData"
      />
    </div>
  );
}
