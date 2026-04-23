export interface PlanogramEditHandlers {
  onEditName: (shelfId: string, productId: string, newName: string) => void;
  onEditCategory: (
    shelfId: string,
    productId: string,
    newCategory: string,
  ) => void;
  onEditFacingsDepth: (
    shelfId: string,
    productId: string,
    updates: { facings?: number; depthCount?: number },
  ) => void;
  onRemoveProduct: (shelfId: string, productId: string) => void;
  onMoveProduct: (
    from: string | "removed",
    to: string,
    productId: string,
    targetProductId?: string,
  ) => void;
  onReorderProducts?: (shelfId: string, productIds: string[]) => void;
}
