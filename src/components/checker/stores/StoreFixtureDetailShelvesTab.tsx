import { Plus } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";

export interface StoreFixtureDetailShelvesTabProps {
  onOpenAddShelf: () => void;
  onInlineShelfUpdate: (
    shelfId: string,
    updates: Partial<{
      name: string;
      code: string;
      width: number;
      height: number;
      vertical_position: number;
    }>,
  ) => Promise<void>;
  shelfRows: {
    id: string;
    shelfName: string;
    shelfCode?: string;
    width?: number;
    height?: number;
    verticalPosition?: number;
  }[];
  fixtureId?: string;
}

export function StoreFixtureDetailShelvesTab({
  onOpenAddShelf,
  onInlineShelfUpdate,
  shelfRows,
  fixtureId,
}: StoreFixtureDetailShelvesTabProps) {
  const shelfColumns: DataTableColumn<(typeof shelfRows)[number]>[] = useMemo(
    () => [
      {
        title: "Shelf Name",
        field: "shelfName",
        minWidth: 180,
        editor: "input",
        cellEdited: async (cell: unknown) => {
          const cellApi = cell as {
            getRow: () => { getData: () => (typeof shelfRows)[number] };
            getValue: () => unknown;
          };
          const row = cellApi.getRow().getData();
          await onInlineShelfUpdate(row.id, {
            name: String(cellApi.getValue() ?? "").trim(),
          });
        },
      },
      {
        title: "Shelf Code",
        field: "shelfCode",
        minWidth: 130,
        editor: "input",
        cellEdited: async (cell: unknown) => {
          const cellApi = cell as {
            getRow: () => { getData: () => (typeof shelfRows)[number] };
            getValue: () => unknown;
          };
          const row = cellApi.getRow().getData();
          await onInlineShelfUpdate(row.id, {
            code: String(cellApi.getValue() ?? "").trim(),
          });
        },
      },
      {
        title: "Width",
        field: "width",
        width: 100,
        sorter: "number",
        editor: "number",
        cellEdited: async (cell: unknown) => {
          const cellApi = cell as {
            getRow: () => { getData: () => (typeof shelfRows)[number] };
            getValue: () => unknown;
          };
          const row = cellApi.getRow().getData();
          const value = Number(cellApi.getValue() ?? 0);
          await onInlineShelfUpdate(row.id, { width: value });
        },
      },
      {
        title: "Height",
        field: "height",
        width: 100,
        sorter: "number",
        editor: "number",
        cellEdited: async (cell: unknown) => {
          const cellApi = cell as {
            getRow: () => { getData: () => (typeof shelfRows)[number] };
            getValue: () => unknown;
          };
          const row = cellApi.getRow().getData();
          const value = Number(cellApi.getValue() ?? 0);
          await onInlineShelfUpdate(row.id, { height: value });
        },
      },
      {
        title: "Vertical Pos",
        field: "verticalPosition",
        width: 120,
        sorter: "number",
        editor: "number",
        cellEdited: async (cell: unknown) => {
          const cellApi = cell as {
            getRow: () => { getData: () => (typeof shelfRows)[number] };
            getValue: () => unknown;
          };
          const row = cellApi.getRow().getData();
          const value = Number(cellApi.getValue() ?? 0);
          await onInlineShelfUpdate(row.id, { vertical_position: value });
        },
      },
    ],
    [onInlineShelfUpdate],
  );

  if (shelfRows.length === 0) {
    return (
      <Card className="border-border bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Shelves Details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-3">
          <p className="text-muted-foreground text-sm">
            No shelf found for this fixture.
          </p>
          <Button
            type="button"
            variant="success"
            className="items-center gap-1.5"
            disabled={!fixtureId}
            onClick={onOpenAddShelf}
          >
            <Plus className="size-4" aria-hidden />
            Add Shelf
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      <Card className="border-border bg-card/80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">All Shelves in Fixture</CardTitle>
            <Button
              type="button"
              variant="success"
              size="sm"
              className="items-center gap-1.5"
              disabled={!fixtureId}
              onClick={onOpenAddShelf}
            >
              <Plus className="size-4" aria-hidden />
              Add Shelf
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 p-0">
          <DataTable
            columns={shelfColumns}
            data={shelfRows}
            rowIdField="id"
            pageSize={10}
            pageSizeSelector={[10, 20, 50]}
            headerFilters={false}
            layout="fitColumns"
            showRowNumber={false}
            className="w-full"
          />
        </CardContent>
      </Card>
    </div>
  );
}
