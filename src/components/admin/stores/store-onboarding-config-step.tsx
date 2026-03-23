import { Edit3, Layers3, LayoutPanelLeft, Maximize, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

import { ShelfTemplateModal, type ShelfTemplateModalValues } from "@/components/common/shelf-template-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";

export type ConfigSection = "fixtures" | "shelfTemplates" | "rules" | "dimensions";

export type FixtureConfig = {
  name: string;
  detail: string;
};

export type ShelfTemplateConfig = {
  name: string;
  description: string;
  fixtureType: "gondola" | "wall_shelving" | "end_cap" | "freezer" | "cooler";
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
  newFixture: FixtureConfig;
  setNewFixture: Dispatch<SetStateAction<FixtureConfig>>;
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
  newFixture,
  setNewFixture,
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
  onBack,
  onCreateStore,
}: StoreOnboardingConfigStepProps) {
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
                    onClick={() => {
                      const name = newFixture.name.trim();
                      if (!name) return;
                      setFixtureTypes((prev) => [
                        ...prev,
                        {
                          name,
                          detail: newFixture.detail.trim() || "Custom fixture type",
                        },
                      ]);
                      setNewFixture({ name: "", detail: "" });
                    }}
                  >
                    <Plus className="size-3.5" />
                    Add fixture
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-[2fr_3fr]">
                  <Input
                    placeholder="Name (e.g. Island Display)"
                    value={newFixture.name}
                    onChange={(e) => setNewFixture((prev) => ({ ...prev, name: e.target.value }))}
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder="Short description"
                    value={newFixture.detail}
                    onChange={(e) => setNewFixture((prev) => ({ ...prev, detail: e.target.value }))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="max-h-[320px] overflow-y-auto pr-1">
                  <div className="space-y-1.5 text-sm text-foreground">
                    {fixtureTypes.map((item, idx) => (
                      <div
                        key={`${item.name}-${idx}`}
                        className="flex items-center justify-between rounded-lg border border-border bg-card/60 px-3 py-2"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.detail}</p>
                        </div>
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
              <section className="rounded-xl border border-border bg-background/40 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-accent" />
                  <h3 className="text-sm font-semibold text-foreground">Compliance Rules</h3>
                </div>
                <ul className="space-y-1.5 text-sm text-foreground">
                  <li>Min facing: 1</li>
                  <li>Max gap: 2&quot;</li>
                  <li>FIFO required for perishables</li>
                  <li>Label alignment: required</li>
                </ul>
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

