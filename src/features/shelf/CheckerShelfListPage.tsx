import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Upload, X } from "lucide-react";

import { ComplianceRuleViewSheet } from "@/components/planogram/compliance-rule-view-sheet";
import {
  createPlanogramColumns,
  PLANOGRAM_INITIAL_SORT,
  PLANOGRAM_PAGE_SIZE_OPTIONS,
  PlanogramActionsMenu,
} from "@/components/planogram/planogram-table-columns";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  useShelves,
  useComplianceRuleSets,
  useDeleteShelf,
  usePlanogramList,
  useCreateFixture,
  useCreateShelf,
} from "@/queries/maker";
import type { ComplianceRuleSetSummary } from "@/types/compliance-rule-set";
import { mockUser } from "@/lib/api/mock-data";
import { useStore } from "@/providers/store";
import type { PlanogramArrangement } from "@/types/planogram";
import type { PlanogramShelfRow, Shelf } from "@/types/maker";
import { CheckerShelfEmptyState } from "./checker-shelf-empty-state";
import { CheckerShelfListToolbar } from "./checker-shelf-list-toolbar";

const BULK_SHELVES_SAMPLE_JSON = JSON.stringify(
  {
    fixtures: [
      {
        code: "FRONT-01",
        type: "Gondola",
        dimensions: { width: 120, height: 200, depth: 45 },
        dimension_unit: "cm",
        physical_location: { section: "Produce", aisle: "A1", zone: "North" },
        shelves: [
          {
            code: "S-A1-01",
            name: "Top Shelf",
            width: 100,
            height: 35,
            vertical_position: 10,
          },
          {
            code: "S-A1-02",
            name: "Middle Shelf",
            width: 98,
            height: 35,
            vertical_position: 55,
          },
          {
            code: "S-A1-03",
            name: "Bottom Shelf",
            width: 96,
            height: 35,
            vertical_position: 100,
          },
        ],
      },
      {
        code: "FRONT-02",
        type: "Wall Bay",
        dimensions: { width: 110, height: 210, depth: 40 },
        dimension_unit: "cm",
        physical_location: { section: "Beverages", aisle: "B3", zone: "East" },
        shelves: [
          {
            code: "S-B3-01",
            name: "Energy Drinks",
            width: 95,
            height: 30,
            vertical_position: 12,
          },
          {
            code: "S-B3-02",
            name: "Sodas",
            width: 95,
            height: 30,
            vertical_position: 52,
          },
        ],
      },
      {
        code: "FRONT-03",
        type: "End Cap",
        dimensions: { width: 90, height: 185, depth: 38 },
        dimension_unit: "cm",
        physical_location: { section: "Snacks", aisle: "C2", zone: "West" },
        shelves: [
          {
            code: "S-C2-01",
            name: "Chips Top",
            width: 82,
            height: 28,
            vertical_position: 8,
          },
          {
            code: "S-C2-02",
            name: "Chips Mid",
            width: 82,
            height: 28,
            vertical_position: 42,
          },
          {
            code: "S-C2-03",
            name: "Chips Low",
            width: 82,
            height: 28,
            vertical_position: 76,
          },
          {
            code: "S-C2-04",
            name: "Promo Shelf",
            width: 80,
            height: 24,
            vertical_position: 110,
          },
        ],
      },
    ],
  },
  null,
  2,
);

type BulkShelfInput = {
  code: string;
  name: string;
  width: number;
  height: number;
  vertical_position: number;
};

type BulkFixtureInput = {
  code: string;
  type: string;
  dimensions: { width: number; height: number; depth: number };
  dimension_unit: string;
  physical_location: { section: string; aisle: string; zone: string };
  shelves: BulkShelfInput[];
};

type ParsedBulkPayload = {
  fixtures: BulkFixtureInput[];
  totalShelves: number;
};

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function parseBulkShelvesPayload(raw: string): ParsedBulkPayload {
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== "object") {
    throw new Error("JSON root must be an object.");
  }
  const fixtures = (parsed as { fixtures?: unknown }).fixtures;
  if (!Array.isArray(fixtures) || fixtures.length === 0) {
    throw new Error("`fixtures` must be a non-empty array.");
  }

  const normalizedFixtures: BulkFixtureInput[] = fixtures.map((fixture, fixtureIdx) => {
    if (!fixture || typeof fixture !== "object") {
      throw new Error(`Fixture ${fixtureIdx + 1} is invalid.`);
    }
    const f = fixture as Record<string, unknown>;
    const code = String(f.code ?? "").trim();
    const type = String(f.type ?? "").trim();
    const dimensionUnit = String(f.dimension_unit ?? "").trim();
    const dimensions = f.dimensions as Record<string, unknown> | undefined;
    const location = f.physical_location as Record<string, unknown> | undefined;
    const shelves = f.shelves as unknown;

    if (!code) throw new Error(`Fixture ${fixtureIdx + 1}: \`code\` is required.`);
    if (!type) throw new Error(`Fixture ${fixtureIdx + 1}: \`type\` is required.`);
    if (!dimensionUnit)
      throw new Error(`Fixture ${fixtureIdx + 1}: \`dimension_unit\` is required.`);
    if (!dimensions || typeof dimensions !== "object") {
      throw new Error(`Fixture ${fixtureIdx + 1}: \`dimensions\` is required.`);
    }
    if (!location || typeof location !== "object") {
      throw new Error(`Fixture ${fixtureIdx + 1}: \`physical_location\` is required.`);
    }
    if (!Array.isArray(shelves) || shelves.length === 0) {
      throw new Error(`Fixture ${fixtureIdx + 1}: \`shelves\` must be a non-empty array.`);
    }

    const width = dimensions.width;
    const height = dimensions.height;
    const depth = dimensions.depth;
    if (!isPositiveNumber(width) || !isPositiveNumber(height) || !isPositiveNumber(depth)) {
      throw new Error(`Fixture ${fixtureIdx + 1}: dimensions must be positive numbers.`);
    }

    const section = String(location.section ?? "").trim();
    const aisle = String(location.aisle ?? "").trim();
    const zone = String(location.zone ?? "").trim();
    if (!section || !aisle || !zone) {
      throw new Error(
        `Fixture ${fixtureIdx + 1}: section, aisle, and zone are required in physical_location.`,
      );
    }

    const normalizedShelves = shelves.map((shelf, shelfIdx) => {
      if (!shelf || typeof shelf !== "object") {
        throw new Error(`Fixture ${fixtureIdx + 1}, shelf ${shelfIdx + 1} is invalid.`);
      }
      const s = shelf as Record<string, unknown>;
      const shelfCode = String(s.code ?? "").trim();
      const shelfName = String(s.name ?? "").trim();
      const shelfWidth = s.width;
      const shelfHeight = s.height;
      const verticalPosition = s.vertical_position;

      if (!shelfCode) {
        throw new Error(`Fixture ${fixtureIdx + 1}, shelf ${shelfIdx + 1}: \`code\` is required.`);
      }
      if (!shelfName) {
        throw new Error(`Fixture ${fixtureIdx + 1}, shelf ${shelfIdx + 1}: \`name\` is required.`);
      }
      if (!isPositiveNumber(shelfWidth) || !isPositiveNumber(shelfHeight)) {
        throw new Error(
          `Fixture ${fixtureIdx + 1}, shelf ${shelfIdx + 1}: width/height must be positive numbers.`,
        );
      }
      if (
        typeof verticalPosition !== "number" ||
        !Number.isFinite(verticalPosition) ||
        verticalPosition < 0
      ) {
        throw new Error(
          `Fixture ${fixtureIdx + 1}, shelf ${shelfIdx + 1}: vertical_position must be 0 or greater.`,
        );
      }

      return {
        code: shelfCode,
        name: shelfName,
        width: shelfWidth,
        height: shelfHeight,
        vertical_position: verticalPosition,
      };
    });

    return {
      code,
      type,
      dimensions: { width, height, depth },
      dimension_unit: dimensionUnit,
      physical_location: { section, aisle, zone },
      shelves: normalizedShelves,
    };
  });

  return {
    fixtures: normalizedFixtures,
    totalShelves: normalizedFixtures.reduce((sum, f) => sum + f.shelves.length, 0),
  };
}

function toPlanogramRow(
  shelf: Shelf,
  planogramMap?: Map<
    string,
    {
      aisle?: string;
      zone?: string;
      section?: string;
      fixtureType?: string;
      dimensions?: string;
    }
  >,
): PlanogramShelfRow {
  const arrangement = shelf.arrangement as PlanogramArrangement | undefined;
  const skuCount =
    arrangement?.shelfOrder?.reduce((n, s) => n + s.productIds.length, 0) ??
    8 + (shelf.id.charCodeAt(shelf.id.length - 1) % 12);
  const issues =
    shelf.status === "returned" ? 2 : shelf.status === "draft" ? 1 : 0;
  const planogramInfo = shelf.planogramId
    ? planogramMap?.get(shelf.planogramId)
    : undefined;
  const info =
    planogramInfo && typeof planogramInfo === "object" ? planogramInfo : undefined;

  const aisleCode =
    info?.aisle ??
    shelf.aisleCode ??
    (shelf.aisleNumber != null ? `A${shelf.aisleNumber}` : undefined);
  const zone = info?.zone ?? shelf.zone;
  const section = info?.section ?? shelf.section;
  const fixtureType = info?.fixtureType ?? shelf.fixtureType;
  const dimensions = info?.dimensions ?? shelf.dimensions;
  return {
    ...shelf,
    complianceRuleSet: "Default Rules",
    categorizeBy: "By Category",
    lastRun: shelf.lastAuditDate,
    productsCount: skuCount,
    issuesCount: issues,
    aisleCode,
    zone,
    section,
    fixtureType,
    dimensions,
    width: shelf.width,
    height: shelf.height,
    depth: shelf.depth,
  };
}

export interface CheckerShelfListPageProps {
  shelfDetailPath: string;
  adhocNewPath: string;
  pogNewPath: string;
}

function getOptionalStoreId(params: unknown): string | undefined {
  if (!params || typeof params !== "object") return undefined;
  const { storeId } = params as { storeId?: unknown };
  return typeof storeId === "string" ? storeId : undefined;
}

function asRouterPath(path: string): never {
  return path as never;
}

function asRouterParams(params: Record<string, string | undefined>): never {
  return params as never;
}

function asRouterSearch(search: Record<string, string | undefined>): never {
  return search as never;
}

export function CheckerShelfListPage({
  shelfDetailPath,
  adhocNewPath,
  pogNewPath,
}: CheckerShelfListPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams({ strict: false });
  const { toast } = useToast();
  const { selectedStore } = useStore();

  const isAdminPath = location.pathname.includes("/admin/");
  const storeId =
    getOptionalStoreId(params) ??
    (isAdminPath ? selectedStore?.id : undefined);

  const { data: shelves, isLoading } = useShelves();
  const deleteShelfMutation = useDeleteShelf();
  const createFixtureMutation = useCreateFixture();
  const createShelfMutation = useCreateShelf();
  const { data: planogramList } = usePlanogramList();
  const { data: ruleSets } = useComplianceRuleSets();
  const _selectedStoreId = selectedStore?.id || mockUser.storeId;
  void _selectedStoreId;

  const [searchQuery, setSearchQuery] = useState("");
  const [tablePagination, setTablePagination] = useState({
    page: 1,
    pageSize: 10,
  });
  const [complianceOverrides, setComplianceOverrides] = useState<
    Record<string, string>
  >({});
  const [categorizeOverrides, setCategorizeOverrides] = useState<
    Record<string, string>
  >({});
  const [actionsMenu, setActionsMenu] = useState<{
    row: PlanogramShelfRow;
    triggerEl: HTMLElement;
  } | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [shelfIdPendingDelete, setShelfIdPendingDelete] = useState<string | null>(
    null,
  );
  const [complianceSheetOpen, setComplianceSheetOpen] = useState(false);
  const [complianceSheetRuleSet, setComplianceSheetRuleSet] =
    useState<ComplianceRuleSetSummary | null>(null);
  const [complianceSheetRuleSetName, setComplianceSheetRuleSetName] = useState<
    string | null
  >(null);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [bulkAddMode, setBulkAddMode] = useState<"file" | "paste">("file");
  const [bulkAddStep, setBulkAddStep] = useState<"input" | "preview">("input");
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [pastedBulkJson, setPastedBulkJson] = useState("");
  const [isBulkDragging, setIsBulkDragging] = useState(false);
  const [parsedBulkPayload, setParsedBulkPayload] = useState<ParsedBulkPayload | null>(
    null,
  );
  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const skipNextOpenMenuFromTriggerRef = useRef(false);
  const [selectedRows, setSelectedRows] = useState<PlanogramShelfRow[]>([]);

  const planogramMap = useMemo(() => {
    const map = new Map<
      string,
      {
        aisle?: string;
        zone?: string;
        section?: string;
        fixtureType?: string;
        dimensions?: string;
      }
    >();
    (planogramList ?? []).forEach((p) => {
      map.set(p.id, {
        aisle: p.aisle,
        zone: p.zone,
        section: p.section,
        fixtureType: p.fixtureType,
        dimensions: p.dimensions,
      });
    });
    return map;
  }, [planogramList]);

  const planogramRows = useMemo(() => {
    return (shelves ?? []).map((s) => toPlanogramRow(s, planogramMap));
  }, [shelves, planogramMap]);

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return planogramRows;
    const q = searchQuery.toLowerCase();
    return planogramRows.filter(
      (r) =>
        r.shelfName.toLowerCase().includes(q) ||
        r.complianceRuleSet?.toLowerCase().includes(q) ||
        r.categorizeBy?.toLowerCase().includes(q) ||
        String(r.aisleCode ?? "").toLowerCase().includes(q) ||
        String(r.bayCode ?? r.bayNumber ?? "").toLowerCase().includes(q) ||
        r.shelfCode?.toLowerCase().includes(q) ||
        r.zone?.toLowerCase().includes(q) ||
        r.section?.toLowerCase().includes(q) ||
        r.fixtureType?.toLowerCase().includes(q),
    );
  }, [planogramRows, searchQuery]);

  const rowsWithOverrides = useMemo(() => {
    return filteredRows.map((r) => ({
      ...r,
      complianceRuleSet: complianceOverrides[r.id] ?? r.complianceRuleSet,
      categorizeBy: categorizeOverrides[r.id] ?? r.categorizeBy,
    }));
  }, [filteredRows, complianceOverrides, categorizeOverrides]);

  useEffect(() => {
    const el = tableWrapperRef.current;
    if (!el) return;
    const handleChange = (e: Event) => {
      const select = (e.target as HTMLElement).closest?.(
        "[data-planogram-dropdown]",
      );
      if (!select || !(select instanceof HTMLSelectElement)) return;
      const shelfId = select.getAttribute("data-shelf-id");
      const field = select.getAttribute("data-field");
      const value = select.value;
      if (!shelfId || !field) return;
      if (field === "compliance")
        setComplianceOverrides((prev) => ({ ...prev, [shelfId]: value }));
      if (field === "categorize")
        setCategorizeOverrides((prev) => ({ ...prev, [shelfId]: value }));
    };
    el.addEventListener("change", handleChange);
    return () => el.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!actionsMenu) return;
    const handlePointerDown = (e: Event) => {
      const target = e.target as Node;
      const menuEl =
        actionsMenuRef.current ??
        document.querySelector("[data-planogram-actions-menu]");
      if (menuEl?.contains(target)) return;

      const triggerBtn = (target as HTMLElement).closest?.(
        "[data-action=\"open-menu\"]",
      );
      if (triggerBtn && triggerBtn === actionsMenu.triggerEl) {
        skipNextOpenMenuFromTriggerRef.current = true;
      }
      setActionsMenu(null);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, {
      passive: true,
    });
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [actionsMenu]);

  const handleOpenMenu = useCallback(
    (row: PlanogramShelfRow, triggerEl: HTMLElement) => {
      if (skipNextOpenMenuFromTriggerRef.current) {
        skipNextOpenMenuFromTriggerRef.current = false;
        return;
      }
      setActionsMenu({ row, triggerEl });
    },
    [],
  );

  const handleRowClick = useCallback(
    (row: PlanogramShelfRow) => {
      navigate({
        to: asRouterPath(shelfDetailPath),
        params: asRouterParams({ shelfId: row.id, storeId }),
      });
    },
    [navigate, shelfDetailPath, storeId],
  );

  const handleViewComplianceRule = useCallback(
    (row: PlanogramShelfRow) => {
      const ruleSetName = row.complianceRuleSet ?? "Default Rules";
      const set = (ruleSets ?? []).find((s) => s.name === ruleSetName) ?? null;
      setComplianceSheetRuleSet(set);
      setComplianceSheetRuleSetName(ruleSetName);
      setComplianceSheetOpen(true);
      setActionsMenu(null);
    },
    [ruleSets],
  );

  const handleNewRun = useCallback(
    (shelfId: string) => {
      const shouldSendStoreParam = adhocNewPath.includes("$storeId");
      navigate({
        to: asRouterPath(adhocNewPath),
        params: asRouterParams(shouldSendStoreParam ? { storeId } : {}),
        search: asRouterSearch({ shelfId, from: location.pathname }),
      });
      setActionsMenu(null);
    },
    [navigate, adhocNewPath, storeId, location.pathname],
  );

  const handleAssociatePlanogram = useCallback(
    (shelfId: string) => {
      const shouldSendStoreParam = pogNewPath.includes("$storeId");
      navigate({
        to: asRouterPath(pogNewPath),
        params: asRouterParams(shouldSendStoreParam ? { storeId } : {}),
        search: asRouterSearch({ shelfId }),
      });
    },
    [navigate, pogNewPath, storeId],
  );

  const handleDeleteShelf = useCallback(
    (shelfId: string) => {
      setShelfIdPendingDelete(shelfId);
      setDeleteConfirmOpen(true);
      setActionsMenu(null);
    },
    [],
  );

  const confirmDeleteShelf = useCallback(async () => {
    if (!shelfIdPendingDelete) return;
    try {
      await deleteShelfMutation.mutateAsync(shelfIdPendingDelete);
      toast({
        title: "Shelf deleted",
        description: "The shelf has been removed successfully.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete shelf",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setShelfIdPendingDelete(null);
    }
  }, [deleteShelfMutation, shelfIdPendingDelete, toast]);

  const tableColumns = useMemo(
    () =>
      createPlanogramColumns({
        onOpenMenu: handleOpenMenu,
        ruleSets: ruleSets ?? [],
        useShelfIdField: "shelf_id",
      }),
    [handleOpenMenu, ruleSets],
  );

  const pageSizeSelectorOptions = useMemo(
    () => [...PLANOGRAM_PAGE_SIZE_OPTIONS],
    [],
  );
  const visibleRowsCount = Math.max(
    0,
    Math.min(
      tablePagination.pageSize,
      filteredRows.length - (tablePagination.page - 1) * tablePagination.pageSize,
    ),
  );

  const handleBulkDeleteSelected = useCallback(() => {
    const count = selectedRows.length;
    if (!count) return;
    toast({
      title: "Bulk delete (frontend only)",
      description: `You selected ${count} shelf${count === 1 ? "" : "s"}. Backend delete is not wired yet.`,
      variant: "warning",
    });
  }, [selectedRows.length, toast]);

  const handleBulkAddShelves = useCallback(() => {
    setBulkAddMode("file");
    setBulkAddStep("input");
    setBulkFile(null);
    setPastedBulkJson("");
    setParsedBulkPayload(null);
    setIsBulkAddModalOpen(true);
  }, []);

  const handleBulkFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      if (file && !file.name.toLowerCase().endsWith(".json")) {
        toast({
          title: "Invalid file type",
          description: "Only JSON files are supported.",
          variant: "warning",
        });
        return;
      }
      setBulkFile(file);
      event.target.value = "";
    },
    [toast],
  );

  const handleConfirmBulkAdd = useCallback(async () => {
    let raw = "";
    if (bulkAddMode === "file") {
      if (!bulkFile) {
        toast({
          title: "No file selected",
          description: "Select a JSON file to continue.",
          variant: "warning",
        });
        return;
      }
      try {
        raw = await bulkFile.text();
      } catch {
        toast({
          title: "Read failed",
          description: "Could not read the selected file.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!pastedBulkJson.trim()) {
        toast({
          title: "No JSON pasted",
          description: "Paste JSON content to continue.",
          variant: "warning",
        });
        return;
      }
      raw = pastedBulkJson;
    }

    try {
      const normalized = parseBulkShelvesPayload(raw);
      setParsedBulkPayload(normalized);
      setBulkAddStep("preview");
      toast({
        title: "JSON parsed",
        description: `Found ${normalized.fixtures.length} fixtures and ${normalized.totalShelves} shelves.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Invalid JSON structure",
        description:
          error instanceof Error
            ? error.message
            : "Could not parse fixtures and shelves from JSON.",
        variant: "destructive",
      });
    }
  }, [bulkAddMode, bulkFile, pastedBulkJson, toast]);

  const handleCreateBulkShelves = useCallback(async () => {
    if (!parsedBulkPayload) return;
    try {
      let createdShelves = 0;
      for (const fixture of parsedBulkPayload.fixtures) {
        const createdFixture = await createFixtureMutation.mutateAsync({
          type: fixture.type,
          dimensions: fixture.dimensions,
          dimension_unit: fixture.dimension_unit,
          physical_location: fixture.physical_location,
        });

        for (const shelf of fixture.shelves) {
          await createShelfMutation.mutateAsync({
            code: shelf.code,
            name: shelf.name,
            fixture_id: createdFixture.id,
            width: shelf.width,
            height: shelf.height,
            vertical_position: shelf.vertical_position,
          });
          createdShelves += 1;
        }
      }

      toast({
        title: "Bulk create completed",
        description: `Created ${createdShelves} shelves successfully.`,
        variant: "success",
      });

      setIsBulkAddModalOpen(false);
      setBulkAddMode("file");
      setBulkAddStep("input");
      setBulkFile(null);
      setPastedBulkJson("");
      setParsedBulkPayload(null);
      setIsBulkDragging(false);
    } catch (error) {
      toast({
        title: "Bulk create failed",
        description:
          error instanceof Error
            ? error.message
            : "Could not create fixtures/shelves from parsed JSON.",
        variant: "destructive",
      });
    }
  }, [parsedBulkPayload, createFixtureMutation, createShelfMutation, toast]);

  const handleDownloadSampleJson = useCallback(() => {
    const blob = new Blob([BULK_SHELVES_SAMPLE_JSON], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bulk-shelves-sample.json";
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleLoadSampleJson = useCallback(() => {
    setBulkAddMode("paste");
    setPastedBulkJson(BULK_SHELVES_SAMPLE_JSON);
    setBulkFile(null);
    setParsedBulkPayload(null);
    setBulkAddStep("input");
  }, []);

  const handleBulkDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsBulkDragging(false);
    const file = event.dataTransfer.files?.[0] ?? null;
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".json")) {
      toast({
        title: "Invalid file type",
        description: "Only JSON files are supported.",
        variant: "warning",
      });
      return;
    }
    setBulkFile(file);
  }, [toast]);

  return (
    <>
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          if (deleteShelfMutation.isPending) return;
          setDeleteConfirmOpen(false);
          setShelfIdPendingDelete(null);
        }}
        onConfirm={confirmDeleteShelf}
        title="Delete shelf?"
        description="Are you sure you want to delete this shelf? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={deleteShelfMutation.isPending}
      />
      <Modal
        isOpen={isBulkAddModalOpen}
        onClose={() => {
          setIsBulkAddModalOpen(false);
          setBulkAddMode("file");
          setBulkAddStep("input");
          setBulkFile(null);
          setPastedBulkJson("");
          setParsedBulkPayload(null);
          setIsBulkDragging(false);
        }}
        className="max-w-3xl"
      >
        <div className="rounded-lg border border-border bg-card p-6 shadow-lg min-h-[520px] flex flex-col">
          <h3 className="text-base font-semibold text-foreground">Bulk Add Shelves</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload or paste JSON, then review the parsed shelves before creating.
          </p>

          <div className="mt-4 inline-flex rounded-md border border-border bg-muted/30 p-1">
            <Button
              type="button"
              size="sm"
              variant={bulkAddMode === "file" ? "default" : "ghost"}
              onClick={() => {
                setBulkAddMode("file");
                setBulkAddStep("input");
                setParsedBulkPayload(null);
              }}
            >
              Upload JSON
            </Button>
            <Button
              type="button"
              size="sm"
              variant={bulkAddMode === "paste" ? "default" : "ghost"}
              onClick={() => {
                setBulkAddMode("paste");
                setBulkAddStep("input");
                setParsedBulkPayload(null);
              }}
            >
              Paste JSON
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleLoadSampleJson}>
              Upload sample JSON
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadSampleJson}
            >
              Download sample JSON
            </Button>
          </div>

          <input
            ref={bulkFileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleBulkFileChange}
          />

          <div className="mt-4 flex-1 min-h-0">
            {bulkAddStep === "input" ? (
              bulkAddMode === "file" ? (
            <>
              <div
                className={`h-full min-h-[340px] rounded-lg border-2 border-dashed p-6 text-center transition-colors flex flex-col items-center justify-center ${
                  isBulkDragging
                    ? "border-accent bg-accent/10"
                    : "border-border bg-card"
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsBulkDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setIsBulkDragging(false);
                }}
                onDrop={handleBulkDrop}
              >
                <Upload className="mx-auto mb-2 size-6 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Upload bulk shelves JSON</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Drag and drop a JSON file, then upload.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => bulkFileInputRef.current?.click()}
                >
                  {bulkFile ? "Change File" : "Browse File"}
                </Button>
                <p className="mt-2 text-[11px] text-muted-foreground">.JSON</p>
              </div>

              {bulkFile ? (
                <div className="mt-3 flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
                  <p className="truncate text-sm text-foreground">{bulkFile.name}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setBulkFile(null)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : null}
            </>
          ) : (
                <div className="h-full rounded-lg border border-border bg-muted/20 p-3">
                  <textarea
                    id="bulk-json-paste"
                    value={pastedBulkJson}
                    onChange={(e) => setPastedBulkJson(e.target.value)}
                    placeholder="Paste JSON with fixtures and shelves"
                    className="h-[calc(100%-32px)] min-h-[300px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )
            ) : (
              <div className="h-full min-h-[340px] overflow-auto rounded-lg border border-border bg-muted/20 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Previewing{" "}
                    <span className="font-semibold text-foreground">
                      {parsedBulkPayload?.totalShelves ?? 0}
                    </span>{" "}
                    shelves from{" "}
                    <span className="font-semibold text-foreground">
                      {parsedBulkPayload?.fixtures.length ?? 0}
                    </span>{" "}
                    fixtures
                  </p>
                </div>
                <div className="overflow-auto rounded-md border border-border bg-card">
                  <table className="w-full min-w-[820px] text-sm">
                    <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">Fixture</th>
                        <th className="px-3 py-2">Location</th>
                        <th className="px-3 py-2">Shelf Code</th>
                        <th className="px-3 py-2">Shelf Name</th>
                        <th className="px-3 py-2">Width</th>
                        <th className="px-3 py-2">Height</th>
                        <th className="px-3 py-2">Vertical Pos.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(parsedBulkPayload?.fixtures ?? []).flatMap((fixture) =>
                        fixture.shelves.map((shelf) => (
                          <tr
                            key={`${fixture.code}-${shelf.code}`}
                            className="border-t border-border text-foreground"
                          >
                            <td className="px-3 py-2">{fixture.code}</td>
                            <td className="px-3 py-2">
                              {fixture.physical_location.section} /{" "}
                              {fixture.physical_location.aisle} / {fixture.physical_location.zone}
                            </td>
                            <td className="px-3 py-2">{shelf.code}</td>
                            <td className="px-3 py-2">{shelf.name}</td>
                            <td className="px-3 py-2">
                              {shelf.width} {fixture.dimension_unit}
                            </td>
                            <td className="px-3 py-2">
                              {shelf.height} {fixture.dimension_unit}
                            </td>
                            <td className="px-3 py-2">{shelf.vertical_position}</td>
                          </tr>
                        )),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto pt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsBulkAddModalOpen(false);
                setBulkAddMode("file");
                setBulkAddStep("input");
                setBulkFile(null);
                setPastedBulkJson("");
                setParsedBulkPayload(null);
                setIsBulkDragging(false);
              }}
            >
              Cancel
            </Button>
            {bulkAddStep === "preview" ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setBulkAddStep("input");
                }}
              >
                Back
              </Button>
            ) : null}
            <Button
              type="button"
              variant="success"
              onClick={() => {
                if (bulkAddStep === "input") {
                  void handleConfirmBulkAdd();
                } else {
                  void handleCreateBulkShelves();
                }
              }}
              disabled={createFixtureMutation.isPending || createShelfMutation.isPending}
            >
              {bulkAddStep === "input"
                ? "Continue"
                : createFixtureMutation.isPending || createShelfMutation.isPending
                  ? "Creating..."
                  : "Create Shelves"}
            </Button>
          </div>
        </div>
      </Modal>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col min-h-0">
          <CheckerShelfListToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCount={selectedRows.length}
            onDeleteSelected={handleBulkDeleteSelected}
            onBulkAdd={handleBulkAddShelves}
          />

          {filteredRows.length > 0 && (
            <p className="mt-2 shrink-0 text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">{visibleRowsCount}</span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {filteredRows.length}
              </span>{" "}
              shelf{filteredRows.length !== 1 ? "s" : ""}
            </p>
          )}

          <div className="mt-4 flex-1 min-h-0 overflow-auto">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            ) : filteredRows.length === 0 ? (
              <CheckerShelfEmptyState />
            ) : (
              <div ref={tableWrapperRef}>
                <DataTable<PlanogramShelfRow>
                  columns={tableColumns}
                  data={rowsWithOverrides}
                  rowIdField="id"
                  initialSort={PLANOGRAM_INITIAL_SORT}
                  emptyMessage="No shelves match your search"
                  pageSize={10}
                  pageSizeSelector={pageSizeSelectorOptions}
                  headerFilters={false}
                  layout="fitData"
                  onPaginationChange={setTablePagination}
                  onRowClick={handleRowClick}
                  isBulkEnabled
                  onSelectionChange={setSelectedRows}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {actionsMenu && (
        <PlanogramActionsMenu
          ref={actionsMenuRef}
          row={actionsMenu.row}
          triggerEl={actionsMenu.triggerEl}
          variant="checker"
          onClose={() => setActionsMenu(null)}
          onNewRun={handleNewRun}
          onViewComplianceRule={handleViewComplianceRule}
          onAssociatePlanogram={handleAssociatePlanogram}
          onDeleteShelf={handleDeleteShelf}
        />
      )}

      <ComplianceRuleViewSheet
        open={complianceSheetOpen}
        onOpenChange={setComplianceSheetOpen}
        ruleSet={complianceSheetRuleSet}
        ruleSetName={complianceSheetRuleSetName}
      />
    </>
  );
}
