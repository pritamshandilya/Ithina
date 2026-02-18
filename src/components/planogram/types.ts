/**
 * Shared types for planogram components
 */

export interface PlanogramEditHandlers {
  onEditName: (shelfNumber: number, sku: string, newName: string) => void;
  onEditCategory: (
    shelfNumber: number,
    sku: string,
    newCategory: string,
  ) => void;
  onEditFacingsDepth: (
    shelfNumber: number,
    sku: string,
    updates: { facings?: number; depthCount?: number },
  ) => void;
  onRemoveProduct: (shelfNumber: number, sku: string) => void;
  onMoveProduct: (
    from: number | "removed",
    to: number,
    sku: string,
    targetSku?: string,
  ) => void;
  /** Reorder products within a shelf – productIds in new order */
  onReorderProducts?: (shelfNumber: number, productIds: string[]) => void;
}
