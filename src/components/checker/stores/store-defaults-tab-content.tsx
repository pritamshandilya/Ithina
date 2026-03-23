import type { Dispatch, SetStateAction } from "react";
import { ClipboardList, Edit3, Layers3, LayoutPanelLeft, Maximize, Plus, Trash2 } from "lucide-react";

import { ShelfTemplateModal, type ShelfTemplateModalValues } from "@/components/common/shelf-template-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ShelfTemplate } from "@/types/shelf-template";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";
import { cn } from "@/lib/utils";
import type { ComplianceRuleSetSummary } from "@/types/compliance-rule-set";

type DefaultsTab = "fixtures" | "templates" | "rules" | "units";

type StoreTemplateForm = {
  name: string;
  description: string;
  fixtureType: string;
  zone: string;
  section: string;
  width: string;
  height: string;
  depth: string;
};

interface StoreDefaultsTabContentProps {
  canEdit: boolean;
  /** Admin and maker: create rule sets and choose default; checker stays read-only. */
  canManageComplianceRuleSets: boolean;
  onOpenCreateRuleSetModal: () => void;
  onSaveComplianceDefault: () => void | Promise<void>;
  isSavingComplianceDefault: boolean;
  activeDefaultsTab: DefaultsTab;
  setActiveDefaultsTab: Dispatch<SetStateAction<DefaultsTab>>;
  fixtureTypes: string[];
  setFixtureTypes: Dispatch<SetStateAction<string[]>>;
  newFixture: string;
  setNewFixture: Dispatch<SetStateAction<string>>;
  complianceRuleSets: ComplianceRuleSetSummary[];
  defaultComplianceRuleSetId: string;
  setDefaultComplianceRuleSetId: Dispatch<SetStateAction<string>>;
  shelfTemplates: ShelfTemplate[];
  shelfTemplatesLoading: boolean;
  deleteTemplate: (id: string) => void;
  openNewTemplate: () => void;
  openEditTemplate: (tpl: ShelfTemplate) => void;
  templateModalOpen: boolean;
  closeTemplateModal: () => void;
  saveTemplate: (values: ShelfTemplateModalValues) => Promise<void> | void;
  isTemplateSaving: boolean;
  editingTemplateId: string | null;
  templateInitialValues: StoreTemplateForm;
  formData: { default_dimensions: StoreDimensionUnit };
  setFormData: Dispatch<
    SetStateAction<{
      name: string;
      address: string;
      region: string;
      status: "Active" | "Inactive";
      currency: string;
      default_dimensions: StoreDimensionUnit;
    }>
  >;
  isSavingDefaults: boolean;
  onSaveDefaults: () => void;
}

export function StoreDefaultsTabContent({
  canEdit,
  canManageComplianceRuleSets,
  onOpenCreateRuleSetModal,
  onSaveComplianceDefault,
  isSavingComplianceDefault,
  activeDefaultsTab,
  setActiveDefaultsTab,
  fixtureTypes,
  setFixtureTypes,
  newFixture,
  setNewFixture,
  complianceRuleSets,
  defaultComplianceRuleSetId,
  setDefaultComplianceRuleSetId,
  shelfTemplates,
  shelfTemplatesLoading,
  deleteTemplate,
  openNewTemplate,
  openEditTemplate,
  templateModalOpen,
  closeTemplateModal,
  saveTemplate,
  isTemplateSaving,
  editingTemplateId,
  templateInitialValues,
  formData,
  setFormData,
  isSavingDefaults,
  onSaveDefaults,
}: StoreDefaultsTabContentProps) {
  return (
    <div className="space-y-4">
      <Card noBorder className="bg-card shadow-xl glassmorphism">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers3 className="size-5 text-accent" />
            <CardTitle>Store Defaults</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="xl:col-span-2">
              <div className="flex flex-wrap items-center gap-1 p-1 bg-muted/20 border border-border rounded-xl w-fit">
                {[
                  { id: "fixtures", label: "Fixture Types" },
                  { id: "templates", label: "Shelf Templates" },
                  { id: "rules", label: "Compliance Rules" },
                  { id: "units", label: "Dimension Unit" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveDefaultsTab(tab.id as DefaultsTab)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                      activeDefaultsTab === tab.id
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {activeDefaultsTab === "fixtures" && (
              <section className="xl:col-span-2 rounded-xl border border-border bg-background/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LayoutPanelLeft className="size-4 text-accent" />
                    <p className="text-sm font-semibold text-foreground">Fixture Types</p>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newFixture}
                        onChange={(e) => setNewFixture(e.target.value)}
                        placeholder="Add fixture"
                        className="h-8 w-48 text-xs"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          const name = newFixture.trim();
                          if (!name) return;
                          setFixtureTypes((prev) => [...prev, name]);
                          setNewFixture("");
                        }}
                        className="h-8 px-2"
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="max-h-[360px] overflow-y-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Fixture Type</th>
                        {canEdit && <th className="px-3 py-2 w-12" />}
                      </tr>
                    </thead>
                    <tbody>
                      {fixtureTypes.map((item, idx) => (
                        <tr key={`${item}-${idx}`} className="border-t border-border/60">
                          <td className="px-3 py-2">
                            {canEdit ? (
                              <Input
                                value={item}
                                onChange={(e) =>
                                  setFixtureTypes((prev) =>
                                    prev.map((v, i) => (i === idx ? e.target.value : v)),
                                  )
                                }
                                className="h-8 text-xs"
                              />
                            ) : (
                              item
                            )}
                          </td>
                          {canEdit && (
                            <td className="px-2 py-2">
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                onClick={() =>
                                  setFixtureTypes((prev) => prev.filter((_, i) => i !== idx))
                                }
                              >
                                <Trash2 className="size-3.5 text-destructive" />
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeDefaultsTab === "templates" && (
              <section className="xl:col-span-2 rounded-xl border border-border bg-background/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers3 className="size-4 text-accent" />
                    <p className="text-sm font-semibold text-foreground">Shelf Templates</p>
                  </div>
                  {canEdit && (
                    <Button type="button" size="sm" className="h-8 px-2" onClick={openNewTemplate}>
                      <Plus className="size-3.5" />
                      New template
                    </Button>
                  )}
                </div>
                <div className="max-h-[360px] overflow-y-auto pr-1">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {shelfTemplatesLoading ? (
                      <></>
                    ) : (
                      shelfTemplates.map((tpl) => (
                        <div
                          key={tpl.id}
                          className="rounded-xl border border-border bg-background/40 p-4 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground">{tpl.name}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                                {tpl.description ?? "—"}
                              </p>
                            </div>
                            {canEdit && (
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openEditTemplate(tpl)}>
                                  <Edit3 className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => deleteTemplate(tpl.id)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="grid gap-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Fixture</span>
                              <span className="text-foreground font-medium">{tpl.fixtureType.replace(/_/g, " ")}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Dimensions</span>
                              <span className="text-foreground font-medium">{tpl.width}×{tpl.height}×{tpl.depth}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>
            )}

            {activeDefaultsTab === "rules" && (
              <section className="xl:col-span-2 rounded-xl border border-border bg-background/40 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="size-4 text-accent" />
                    <p className="text-sm font-semibold text-foreground">Compliance Rule Sets</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {canManageComplianceRuleSets && (
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={onOpenCreateRuleSetModal}
                      >
                        <Plus className="size-3.5" />
                        New rule set
                      </Button>
                    )}
                    {canManageComplianceRuleSets && !canEdit && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-8"
                        onClick={() => void onSaveComplianceDefault()}
                        disabled={isSavingComplianceDefault}
                      >
                        {isSavingComplianceDefault ? "Saving…" : "Save default"}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Default rule set for this store</p>
                  <select
                    value={defaultComplianceRuleSetId}
                    onChange={(e) => setDefaultComplianceRuleSetId(e.target.value)}
                    className="h-10 w-full rounded-md border border-border bg-background/50 px-3 text-sm font-medium text-foreground shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={!canEdit && !canManageComplianceRuleSets}
                  >
                    <option value="">No default rule set</option>
                    {complianceRuleSets.map((set) => (
                      <option key={set.id} value={set.id}>
                        {set.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="max-h-[360px] overflow-y-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Rule set</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Rules</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Enabled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complianceRuleSets.map((set) => (
                        <tr key={set.id} className="border-t border-border/60">
                          <td className="px-3 py-2">{set.name}</td>
                          <td className="px-3 py-2 tabular-nums">{set.rulesCount}</td>
                          <td className="px-3 py-2 tabular-nums">{set.enabledCount}</td>
                        </tr>
                      ))}
                      {complianceRuleSets.length === 0 && (
                        <tr className="border-t border-border/60">
                          <td className="px-3 py-2 text-muted-foreground" colSpan={3}>
                            No compliance rule sets found for this store.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeDefaultsTab === "units" && (
              <section className="xl:col-span-2 rounded-xl border border-border bg-background/40 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Maximize className="size-4 text-accent" />
                  <p className="text-sm font-semibold text-foreground">Dimension Unit</p>
                </div>
                <select
                  value={formData.default_dimensions}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      default_dimensions: e.target.value as StoreDimensionUnit,
                    }))
                  }
                  className="h-10 rounded-md border border-border bg-background/50 px-3 text-sm font-medium text-foreground shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={!canEdit}
                >
                  <option value="mm">mm</option>
                  <option value="cm">cm</option>
                  <option value="inch">inch</option>
                </select>
              </section>
            )}
          </div>

          {canEdit && (
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={onSaveDefaults}
                disabled={isSavingDefaults}
                className="min-w-[150px] gap-2"
              >
                {isSavingDefaults ? "Saving..." : "Save Defaults"}
              </Button>
            </div>
          )}
          <ShelfTemplateModal
            isOpen={templateModalOpen}
            onClose={closeTemplateModal}
            onSave={saveTemplate}
            isSaving={isTemplateSaving}
            mode={editingTemplateId ? "edit" : "create"}
            initialValues={templateInitialValues}
            extraFixtureTypeOptions={fixtureTypes}
          />
        </CardContent>
      </Card>
    </div>
  );
}

