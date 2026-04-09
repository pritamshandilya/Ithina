import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import type { StoreFixtureModalValues } from "@/components/common/store-fixture-modal";
import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  DataTable,
  type DataTableCell,
  type DataTableColumn,
} from "@/components/ui/data-table";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";
import { useStore as useGlobalStore } from "@/providers/store";
import {
  createStoreFixture,
  deleteStoreFixture,
  fetchStoreFixtures,
  updateStoreFixture,
  type StoreFixtureApiModel,
} from "@/queries/checker/api/fixtures";
import { storeDefaultsKeys } from "@/queries/checker/hooks/useStoreFixtureTypes";
import { StoreConfigurationModals } from "./store-configuration-modals";

interface StoreFixturesPageProps {
  canEdit?: boolean;
}

export function StoreFixturesPage({ canEdit = false }: StoreFixturesPageProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { selectedStore } = useGlobalStore();
  const [fixtureModalOpen, setFixtureModalOpen] = useState(false);
  const [isCreatingFixture, setIsCreatingFixture] = useState(false);
  const [editingFixture, setEditingFixture] = useState<StoreFixtureApiModel | null>(null);
  const [fixtureToDelete, setFixtureToDelete] = useState<StoreFixtureApiModel | null>(null);
  const [isDeletingFixture, setIsDeletingFixture] = useState(false);
  const [defaultDimensionUnit, setDefaultDimensionUnit] = useState<StoreDimensionUnit>("mm");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: fixtures = [] } = useQuery({
    queryKey: ["maker", "fixtures", "list", selectedStore?.id ?? "no-store"],
    queryFn: fetchStoreFixtures,
    enabled: !!selectedStore?.id,
    staleTime: 60 * 1000,
  });

  const filteredFixtures = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return fixtures;
    return fixtures.filter((fixture) => {
      const code = fixture.code?.toLowerCase() ?? "";
      const type = fixture.type.toLowerCase();
      const section = fixture.physical_location.section.toLowerCase();
      const aisle = fixture.physical_location.aisle.toLowerCase();
      const zone = fixture.physical_location.zone.toLowerCase();
      return (
        type.includes(query) ||
        code.includes(query) ||
        section.includes(query) ||
        aisle.includes(query) ||
        zone.includes(query)
      );
    });
  }, [fixtures, searchQuery]);

  if (!selectedStore) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  const handleCreateFixture = async (values: StoreFixtureModalValues) => {
    if (!canEdit) return;
    const type = values.type.trim();
    if (!type) {
      toast({
        title: "Missing fixture type",
        description: "Fixture type is required.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingFixture(true);
    try {
      if (editingFixture) {
        const code = values.code?.trim() || undefined;
        await updateStoreFixture(selectedStore.id, editingFixture.id, {
          type,
          ...(code ? { code } : {}),
          dimensions: {
            width: Number(values.width) || editingFixture.dimensions.width,
            height: Number(values.height) || editingFixture.dimensions.height,
            depth: Number(values.depth) || editingFixture.dimensions.depth,
          },
          dimension_unit: values.dimensionUnit || defaultDimensionUnit,
          physical_location: {
            section: values.section.trim() || editingFixture.physical_location.section,
            aisle: values.aisle.trim() || editingFixture.physical_location.aisle,
            zone: values.zone.trim() || editingFixture.physical_location.zone,
          },
        });
      } else {
        await createStoreFixture(selectedStore.id, {
          type,
          dimensions: {
            width: Number(values.width) || 120,
            height: Number(values.height) || 200,
            depth: Number(values.depth) || 45,
          },
          dimension_unit: values.dimensionUnit || defaultDimensionUnit,
          physical_location: {
            section: values.section.trim() || "General",
            aisle: values.aisle.trim() || "A1",
            zone: values.zone.trim() || "General",
          },
        });
      }
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: storeDefaultsKeys.fixtureTypes(selectedStore.id),
        }),
        queryClient.invalidateQueries({
          queryKey: ["maker", "fixtures", "list", selectedStore.id],
        }),
      ]);
      setFixtureModalOpen(false);
      setEditingFixture(null);
      setDefaultDimensionUnit(selectedStore.default_dimensions as StoreDimensionUnit || "mm");
      toast({
        title: editingFixture ? "Fixture updated" : "Fixture added",
        description: editingFixture
          ? "Fixture has been updated for this store."
          : "Fixture has been added to this store.",
      });
    } catch (error) {
      toast({
        title: editingFixture ? "Failed to update fixture" : "Failed to add fixture",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingFixture(false);
    }
  };

  const handleDeleteFixture = async (fixture: StoreFixtureApiModel) => {
    if (!canEdit) return;
    setIsDeletingFixture(true);
    try {
      await deleteStoreFixture(selectedStore.id, fixture.id);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: storeDefaultsKeys.fixtureTypes(selectedStore.id),
        }),
        queryClient.invalidateQueries({
          queryKey: ["maker", "fixtures", "list", selectedStore.id],
        }),
      ]);
      toast({
        title: "Fixture deleted",
        description: "Fixture has been removed from this store.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete fixture",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingFixture(false);
      setFixtureToDelete(null);
    }
  };

  const columns: DataTableColumn<StoreFixtureApiModel>[] = [
    {
      title:"Code",
      field: "code",
      headerFilter: false,
      minWidth: 120,
      hozAlign: "left",
      headerHozAlign: "left",
      formatter: (cell: DataTableCell<StoreFixtureApiModel>) => {
        const fixture = cell.getData();
        return `
          <span class="text-xs text-muted-foreground">
            ${fixture.code ?? "No code"}
          </span>
        `;
      },
    },
    {
      title: "Fixture Type",
      field: "type",
      headerFilter: false,
      minWidth: 220,
      hozAlign: "left",
      headerHozAlign: "left",
      formatter: (cell: DataTableCell<StoreFixtureApiModel>) => {
        const fixture = cell.getData();
        return `
          <div class="text-left">
            <p class="text-sm font-semibold text-foreground">${fixture.type}</p>
          </div>
        `;
      },
    },
    // {
    //   title: "Code",
    //   field: "code",
    //   headerFilter: false,
    //   minWidth: 120,
    //   hozAlign: "left",
    //   headerHozAlign: "left",
    //   formatter: (cell: DataTableCell<StoreFixtureApiModel>) => {
    //     const fixture = cell.getData();
    //     console.log("fixture code", fixture.code);
    //     return `
    //       <span class="text-xs text-muted-foreground">
    //         ${fixture.code ?? "No code"}
    //       </span>
    //     `;
    //   },
    // },
    {
      title: "Dimensions (W×H×D)",
      field: "dimensions.width",
      minWidth: 160,
      headerFilter: false,
      hozAlign: "left",
      headerHozAlign: "left",
      formatter: (cell: DataTableCell<StoreFixtureApiModel>) => {
        const fixture = cell.getData();
        const { width, height, depth } = fixture.dimensions;
        return `
          <span class="text-xs text-muted-foreground">
            ${width}×${height}×${depth} ${fixture.dimension_unit}
          </span>
        `;
      },
    },
    {
      title: "Section",
      field: "physical_location.section",
      headerFilter: false,
      minWidth: 150,
      hozAlign: "left",
      headerHozAlign: "left",
      formatter: (cell: DataTableCell<StoreFixtureApiModel>) => {
        const fixture = cell.getData();
        return `
          <span class="text-xs text-muted-foreground">
            ${fixture.physical_location.section}
          </span>
        `;
      },
    },
    {
      title: "Aisle",
      field: "physical_location.aisle",
      minWidth: 120,
      headerFilter: false,
      hozAlign: "left",
      headerHozAlign: "left",
      formatter: (cell: DataTableCell<StoreFixtureApiModel>) => {
        const fixture = cell.getData();
        return `
          <span class="text-xs text-muted-foreground">
            ${fixture.physical_location.aisle}
          </span>
        `;
      },
    },
    {
      title: "Zone",
      field: "physical_location.zone",
      minWidth: 130,
      headerFilter: false,
      hozAlign: "left",
      headerHozAlign: "left",
      formatter: (cell: DataTableCell<StoreFixtureApiModel>) => {
        const fixture = cell.getData();
        return `
          <span class="text-xs text-muted-foreground">
            ${fixture.physical_location.zone}
          </span>
        `;
      },
    },
    ...(canEdit
      ? [
          {
            title: "Actions",
            field: "actions",
            width: 100,
            headerSort: false,
            headerFilter: false,
            hozAlign: "right" as const,
            formatter: () => {
              const editBtn = renderToStaticMarkup(
                <IconButton
                  type="button"
                  className="edit-fixture-btn"
                  variant="icon-ghost"
                  size="icon-sm"
                  aria-label="Edit fixture"
                  icon={<Edit3 size={16} aria-hidden />}
                />,
              );
              const deleteBtn = renderToStaticMarkup(
                <IconButton
                  type="button"
                  className="delete-fixture-btn"
                  variant="destructive-ghost"
                  size="icon-sm"
                  aria-label="Delete fixture"
                  icon={<Trash2 size={16} aria-hidden />}
                />,
              );
              return `<div class="flex items-center justify-end gap-1">${editBtn}${deleteBtn}</div>`;
            },
            cellClick: (e: unknown, cell: DataTableCell<StoreFixtureApiModel>) => {
              if (
                e &&
                typeof e === "object" &&
                "stopPropagation" in e &&
                typeof e.stopPropagation === "function"
              ) {
                e.stopPropagation();
              }
              const fixture = cell.getData();
              const target =
                e && typeof e === "object" && "target" in e && e.target instanceof Element
                  ? e.target.closest("button")
                  : null;
              if (target?.classList.contains("edit-fixture-btn")) {
                setEditingFixture(fixture);
                setDefaultDimensionUnit((fixture.dimension_unit as StoreDimensionUnit) || "mm");
                setFixtureModalOpen(true);
              } else if (target?.classList.contains("delete-fixture-btn")) {
                setFixtureToDelete(fixture);
              }
            },
          },
        ]
      : []),
  ];

  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Fixtures"
          description="View and manage store fixture configuration."
        
        />
      }
    >
      <div className="min-h-screen bg-primary px-2 pb-4 pt-2 sm:px-2 sm:pb-4 sm:pt-3 lg:px-2 lg:pb-5 lg:pt-4">
        <div className="mx-auto w-full max-w-screen-2xl space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative group w-full sm:max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
              <Input
                placeholder="Search fixture by type, code, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 border-border bg-card pl-11 text-foreground placeholder:text-muted-foreground transition-all hover:border-accent/50 focus:border-accent"
              />
            </div>
            {canEdit && (
              <Button
                type="button"
                variant="outline"
                className="h-10 items-center gap-1.5 px-4"
                onClick={() => {
                  setDefaultDimensionUnit(
                    (selectedStore.default_dimensions as StoreDimensionUnit) || "mm",
                  );
                  setEditingFixture(null);
                  setFixtureModalOpen(true);
                }}
                disabled={isCreatingFixture}
              >
                {isCreatingFixture ? "Adding..." : "Add fixture"}
              </Button>
            )}
          </div>

          <div className="flex-1 min-h-0">
            <DataTable<StoreFixtureApiModel>
              columns={columns}
              data={filteredFixtures}
              pageSize={10}
              emptyMessage="No fixtures found matching your search"
            />
          </div>
        </div>

        <StoreConfigurationModals
          fixtureModalOpen={fixtureModalOpen}
          onCloseFixtureModal={() => {
            setFixtureModalOpen(false);
            setEditingFixture(null);
          }}
          onSaveFixture={handleCreateFixture}
          isFixtureSaving={isCreatingFixture}
          editingFixture={editingFixture}
          defaultDimensionUnit={defaultDimensionUnit}
        />

        <ConfirmModal
          isOpen={!!fixtureToDelete}
          onClose={() => {
            if (isDeletingFixture) return;
            setFixtureToDelete(null);
          }}
          onConfirm={() => {
            if (!fixtureToDelete) return;
            void handleDeleteFixture(fixtureToDelete);
          }}
          title="Delete fixture?"
          description={`This will permanently delete "${fixtureToDelete?.type ?? "this fixture"}".`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="destructive"
          isLoading={isDeletingFixture}
        />
      </div>
    </MainLayout>
  );
}
