import { Edit3, Layers3, LayoutPanelLeft, Maximize, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";

import { ShelfTemplateModal, type ShelfTemplateModalValues } from "@/components/common/shelf-template-modal";
import {
  StoreFixtureModal,
  type StoreFixtureModalValues,
} from "@/components/common/store-fixture-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";

export type ConfigSection = "fixtures" | "shelfTemplates" | "rules" | "dimensions";

export type FixtureConfig = {
  id?: string;
  store_id?: string;
  type: string;
  width: string;
  height: string;
  depth: string;
  dimension_unit: StoreDimensionUnit;
  section: string;
  aisle: string;
  zone: string;
};

export type ShelfTemplateConfig = {
  name: string;
  description: string;
  fixtureType: string;
  zone: string;
  section: string;
  width: string;
  height: string;
  depth: string;
};

interface StoreOnboardingConfigStepProps {
  activeConfigSection: ConfigSection;
  setActiveConfigSection: Dispatch<SetStateAction<ConfigSection>>;
  configVisited: Record<ConfigSection, boolean>;
  setConfigVisited: Dispatch<SetStateAction<Record<ConfigSection, boolean>>>;
  fixtureTypes: FixtureConfig[];
  setFixtureTypes: Dispatch<SetStateAction<FixtureConfig[]>>;
  shelfTemplatesConfig: ShelfTemplateConfig[];
  setShelfTemplatesConfig: Dispatch<SetStateAction<ShelfTemplateConfig[]>>;
  newTemplate: ShelfTemplateConfig;
  setNewTemplate: Dispatch<SetStateAction<ShelfTemplateConfig>>;
  editingTemplateIndex: number | null;
  setEditingTemplateIndex: Dispatch<SetStateAction<number | null>>;
  showAddTemplateForm: boolean;
  setShowAddTemplateForm: Dispatch<SetStateAction<boolean>>;
  saveShelfTemplateFromModal: (values: ShelfTemplateModalValues) => void;
  dimensionUnits: string[];
  configForm: { default_dimensions: StoreDimensionUnit };
  setConfigForm: Dispatch<SetStateAction<{ default_dimensions: StoreDimensionUnit }>>;
  canContinueConfig: boolean;
  isCreating: boolean;
  seedComplianceRuleSet: boolean;
  setSeedComplianceRuleSet: Dispatch<SetStateAction<boolean>>;
  shelfFixtureLabels: string[];
  onBack: () => void;
  onCreateStore: () => void;
}

export function StoreOnboardingConfigStep({
  activeConfigSection,
  setActiveConfigSection,
  configVisited,
  setConfigVisited,
  fixtureTypes,
  setFixtureTypes,
  shelfTemplatesConfig,
  setShelfTemplatesConfig,
  newTemplate,
  setNewTemplate,
  editingTemplateIndex,
  setEditingTemplateIndex,
  showAddTemplateForm,
  setShowAddTemplateForm,
  saveShelfTemplateFromModal,
  dimensionUnits,
  configForm,
  setConfigForm,
  canContinueConfig,
  isCreating,
  seedComplianceRuleSet,
  setSeedComplianceRuleSet,
  shelfFixtureLabels,
  onBack,
  onCreateStore,
}: StoreOnboardingConfigStepProps) {
  const [fixtureModalOpen, setFixtureModalOpen] = useState(false);
  const [editingFixtureIndex, setEditingFixtureIndex] = useState<number | null>(null);
  const [fixtureModalInitialValues, setFixtureModalInitialValues] = useState<
    Partial<StoreFixtureModalValues>
  >({});

  const openCreateFixture = () => {
    setEditingFixtureIndex(null);
    setFixtureModalInitialValues({
      dimensionUnit: configForm.default_dimensions,
    });
    setFixtureModalOpen(true);
  };

  const openEditFixture = (fixture: FixtureConfig, idx: number) => {
    setEditingFixtureIndex(idx);
    setFixtureModalInitialValues({
      type: fixture.type,
      width: fixture.width,
      height: fixture.height,
      depth: fixture.depth,
      dimensionUnit: fixture.dimension_unit,
      section: fixture.section,
      aisle: fixture.aisle,
      zone: fixture.zone,
    });
    setFixtureModalOpen(true);
  };

  const saveFixtureFromModal = (values: StoreFixtureModalValues) => {
    const type = values.type.trim();
    if (!type) return;

    const entry: FixtureConfig = {
      type,
      width: values.width.trim() || "120",
      height: values.height.trim() || "200",
      depth: values.depth.trim() || "45",
      dimension_unit: values.dimensionUnit,
      section: values.section.trim() || "General",
      aisle: values.aisle.trim() || "A1",
      zone: values.zone.trim() || "General",
    };

    if (editingFixtureIndex !== null) {
      setFixtureTypes((prev) =>
        prev.map((item, idx) => {
          if (idx !== editingFixtureIndex) return item;
          return {
            ...item,
            ...entry,
          };
        }),
      );
    } else {
      setFixtureTypes((prev) => [...prev, entry]);
    }

    setEditingFixtureIndex(null);
    setFixtureModalOpen(false);
  };

  return (
    <Card className="border-border/60 bg-card/70 shadow-xl glassmorphism">
      <CardHeader>
        <CardTitle>Store configuration</CardTitle>
        <CardDescription>
          Review the default setup this store will use for fixtures, shelves, compliance rules, and
          measurement units.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="w-full lg:w-64 rounded-xl border border-border bg-background/40 p-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Review configuration
            </p>
            <ConfigNavItem
              icon={LayoutPanelLeft}
              label="Fixture Types"
              description="Core store fixtures"
              isActive={activeConfigSection === "fixtures"}
              isCompleted={configVisited.fixtures}
              onClick={() => {
                setActiveConfigSection("fixtures");
                setConfigVisited((prev) => ({ ...prev, fixtures: true }));
              }}
            />
            <ConfigNavItem
              icon={Layers3}
              label="Shelf Templates"
              description="Standard shelf layouts"
              isActive={activeConfigSection === "shelfTemplates"}
              isCompleted={configVisited.shelfTemplates}
              onClick={() => {
                setActiveConfigSection("shelfTemplates");
                setConfigVisited((prev) => ({ ...prev, shelfTemplates: true }));
              }}
            />
            <ConfigNavItem
              icon={ShieldCheck}
              label="Compliance Rules"
              description="Baseline checks"
              isActive={activeConfigSection === "rules"}
              isCompleted={configVisited.rules}
              onClick={() => {
                setActiveConfigSection("rules");
                setConfigVisited((prev) => ({ ...prev, rules: true }));
              }}
            />
            <ConfigNavItem
              icon={Maximize}
              label="Dimension Units"
              description="Measurement defaults"
              isActive={activeConfigSection === "dimensions"}
              isCompleted={configVisited.dimensions}
              onClick={() => {
                setActiveConfigSection("dimensions");
                setConfigVisited((prev) => ({ ...prev, dimensions: true }));
              }}
            />
          </div>

          <div className="flex-1 space-y-4">
            {activeConfigSection === "fixtures" && (
              <section className="rounded-xl border border-border bg-background/40 p-4 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <LayoutPanelLeft className="size-4 text-accent" />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Fixture Types</h3>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 gap-1.5 bg-chart-2 text-white hover:opacity-90"
                    onClick={openCreateFixture}
                  >
                    <Plus className="size-3.5" />
                    Add fixture
                  </Button>
                </div>
                <div className="max-h-[320px] overflow-y-auto pr-1">
                  <div className="space-y-1.5 text-sm text-foreground">
                    {fixtureTypes.map((item, idx) => (
                      <div
                        key={`${item.type}-${idx}`}
                        className="flex items-center justify-between rounded-lg border border-border bg-card/60 px-3 py-2"
                      >
                        <div>
                          <p className="font-medium">{item.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.width}x{item.height}x{item.depth} {item.dimension_unit}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Section: {item.section} · Aisle: {item.aisle} · Zone: {item.zone}
                          </p>
                          {item.id && item.store_id && (
                            <p className="text-[10px] text-muted-foreground">
                              id: {item.id} · store_id: {item.store_id}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditFixture(item, idx)}
                            aria-label={`Edit ${item.type}`}
                          >
                            <Edit3 className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() =>
                              setFixtureTypes((prev) => prev.filter((_, i) => i !== idx))
                            }
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {activeConfigSection === "shelfTemplates" && (
              <section className="rounded-xl border border-border bg-background/40 p-4 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Layers3 className="size-4 text-accent" />
                    <h3 className="text-sm font-semibold text-foreground">Shelf Templates</h3>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 gap-1.5 bg-chart-2 text-white hover:opacity-90"
                    onClick={() => {
                      setEditingTemplateIndex(null);
                      setShowAddTemplateForm(true);
                    }}
                  >
                    <Plus className="size-3.5" />
                    Add template
                  </Button>
                </div>
                <div className="max-h-[320px] overflow-y-auto pr-1">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {shelfTemplatesConfig.map((tpl, idx) => (
                      <div
                        key={`${tpl.name}-${idx}`}
                        className="rounded-xl border border-border bg-background/40 p-4 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{tpl.name}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                              {tpl.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingTemplateIndex(idx);
                                setNewTemplate(tpl);
                                setShowAddTemplateForm(true);
                              }}
                              aria-label={`Edit ${tpl.name}`}
                            >
                              <Edit3 className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() =>
                                setShelfTemplatesConfig((prev) => prev.filter((_, i) => i !== idx))
                              }
                              aria-label={`Delete ${tpl.name}`}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid gap-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fixture</span>
                            <span className="text-foreground font-medium">
                              {tpl.fixtureType.replace(/_/g, " ")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Dimensions</span>
                            <span className="text-foreground font-medium">
                              {tpl.width}×{tpl.height}×{tpl.depth}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {activeConfigSection === "rules" && (
              <section className="rounded-xl border border-border bg-background/40 p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-accent" />
                  <h3 className="text-sm font-semibold text-foreground">Compliance rule set</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  You can add more rule sets later from store settings or the knowledge center.
                </p>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card/60 p-3">
                  <input
                    type="checkbox"
                    className="mt-1 size-4 rounded border-border text-accent focus-visible:ring-2 focus-visible:ring-accent"
                    checked={seedComplianceRuleSet}
                    onChange={(e) => setSeedComplianceRuleSet(e.target.checked)}
                  />
                  <span className="space-y-1 text-sm">
                    <span className="font-medium text-foreground">
                      Create default compliance rule set
                    </span>
                    <span className="block text-muted-foreground">
                      Seeds one active VISUAL rule (baseline threshold) and assigns it as this
                      store&apos;s default rule set.
                    </span>
                  </span>
                </label>
              </section>
            )}

            {activeConfigSection === "dimensions" && (
              <section className="rounded-xl border border-border bg-background/40 p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Maximize className="size-4 text-accent" />
                  <h3 className="text-sm font-semibold text-foreground">Dimension Units</h3>
                </div>
                <div className="space-y-2">
                  <Label>Default dimension unit</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {dimensionUnits.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setConfigForm({
                            default_dimensions: opt as StoreDimensionUnit,
                          })
                        }
                        className={`flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                          configForm.default_dimensions === opt
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border bg-background/40 text-muted-foreground hover:border-accent/60"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            type="button"
            className="min-w-[160px]"
            disabled={!canContinueConfig || isCreating}
            onClick={onCreateStore}
          >
            {isCreating ? "Creating..." : "Create store"}
          </Button>
        </div>
      </CardContent>
      <ShelfTemplateModal
        isOpen={showAddTemplateForm}
        onClose={() => {
          setShowAddTemplateForm(false);
          setEditingTemplateIndex(null);
        }}
        onSave={saveShelfTemplateFromModal}
        mode={editingTemplateIndex !== null ? "edit" : "create"}
        initialValues={newTemplate}
        extraFixtureTypeOptions={shelfFixtureLabels}
        fixtureDepthByType={Object.fromEntries(
          fixtureTypes.map((fixture) => [fixture.type, fixture.depth]),
        )}
        fixtureUnitByType={Object.fromEntries(
          fixtureTypes.map((fixture) => [fixture.type, fixture.dimension_unit]),
        )}
      />
      <StoreFixtureModal
        isOpen={fixtureModalOpen}
        onClose={() => {
          setFixtureModalOpen(false);
          setEditingFixtureIndex(null);
        }}
        onSave={saveFixtureFromModal}
        mode={editingFixtureIndex !== null ? "edit" : "create"}
        initialValues={fixtureModalInitialValues}
      />
    </Card>
  );
}

interface ConfigNavItemProps {
  icon: typeof LayoutPanelLeft;
  label: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

function ConfigNavItem({
  icon: Icon,
  label,
  description,
  isActive,
  isCompleted,
  onClick,
}: ConfigNavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition-colors",
        isActive
          ? "border-accent bg-accent/10 text-accent"
          : "border-border bg-background/40 text-muted-foreground hover:border-accent/60",
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="size-4" />
        <div className="flex flex-col">
          <span className="text-xs font-semibold">{label}</span>
          <span className="text-[11px] text-muted-foreground">{description}</span>
        </div>
      </div>
      <div
        className={cn(
          "ml-2 flex h-5 w-5 items-center justify-center rounded-full border bg-background/80 text-[10px] font-medium",
          isCompleted ? "border-emerald-500 text-emerald-500" : "border-border text-muted-foreground",
        )}
      >
        {isCompleted ? "✓" : ""}
      </div>
    </button>
  );
}

