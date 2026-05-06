import { useMemo } from "react";

import { createMakerPlanogramTableColumns } from "./planogramMakerTableColumns";
import { PLANOGRAM_INITIAL_SORT } from "./PlanogramTableColumns";
import { DataTable } from "@/components/ui/DataTable";
import type { PlanogramShelfRow } from "@/types/maker";

const MAKER_PLANOGRAM_PAGE_SIZE_OPTIONS = [10, 20, 50, 75, 100] as const;

interface PlanogramMakerTableProps {
  data: PlanogramShelfRow[];
  onOpenMenu: (row: PlanogramShelfRow, triggerEl: HTMLElement) => void;
  onPaginationChange: (pagination: { page: number; pageSize: number }) => void;
  tableWrapperRef: React.RefObject<HTMLDivElement | null>;
}

export function PlanogramMakerTable({
  data,
  onOpenMenu,
  onPaginationChange,
  tableWrapperRef,
}: PlanogramMakerTableProps) {
  const tableColumns = useMemo(
    () =>
      createMakerPlanogramTableColumns({
        onOpenMenu,
      }),
    [onOpenMenu],
  );

  const pageSizeSelectorOptions = useMemo(
    () => [...MAKER_PLANOGRAM_PAGE_SIZE_OPTIONS],
    []
  );

  return (
    <div ref={tableWrapperRef} className="h-full">
      <DataTable<PlanogramShelfRow>
        columns={tableColumns}
        data={data}
        className="h-full"
        rowIdField="id"
        initialSort={PLANOGRAM_INITIAL_SORT}
        emptyMessage="No Display Units match your search"
        pageSize={50}
        pageSizeSelector={pageSizeSelectorOptions}
        headerFilters={false}
        layout="fitData"
        onPaginationChange={onPaginationChange}
      />
    </div>
  );
}
