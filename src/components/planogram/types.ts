/**
 * Shared types for planogram components
 */

export interface PlanogramEditHandlers {
  onEditName: (shelfNumber: number, sku: string, newName: string) => void;
  onEditCategory: (shelfNumber: number, sku: string, newCategory: string) => void;
  onEditFacingsDepth: (
    shelfNumber: number,
    sku: string,
    updates: { facings?: number; depthCount?: number }
  ) => void;
  onRemoveProduct: (shelfNumber: number, sku: string) => void;
}
