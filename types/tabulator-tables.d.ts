/**
 * Ambient declaration for tabulator-tables (no official @types package).
 */
declare module "tabulator-tables" {
  export class TabulatorFull {
    constructor(element: HTMLElement, options: Record<string, unknown>, modules?: unknown);
    setData(data: unknown[]): void;
    destroy(): void;
  }
}
