import { AlertCircle, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";
import type { ShelfTemplate } from "@/types/shelf-template";

type PlanogramListItem = {
  id: string;
  name: string;
  zone?: string;
  section?: string;
  shelfCount: number;
  productCount: number;
};

interface AddShelfDetailsCardProps {
  isAssociateMode: boolean;
  isManualEntryMode: boolean;
  listLoading: boolean;
  selectedPlanogramId: string;
  setSelectedPlanogramId: (id: string) => void;
  planogramList: PlanogramListItem[];
  shelfName: string;
  setShelfName: (name: string) => void;
  duplicateNameError: string | null;
  shelfTemplatesLoading: boolean;
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
  shelfTemplates: ShelfTemplate[];
  applyShelfTemplate: (tpl: ShelfTemplate) => void;
  aisleCode: string;
  setAisleCode: (value: string) => void;
  bayCode: string;
  setBayCode: (value: string) => void;
  zone: string;
  setZone: (value: string) => void;
  section: string;
  setSection: (value: string) => void;
  fixtureType: string;
  setFixtureType: (value: string) => void;
  fixtureTypeOptions: Array<{ value: string; label: string }>;
  resolveDepthForFixtureType: (fixtureTypeValue: string) => string | undefined;
  defaultDimensionUnit: StoreDimensionUnit;
  dimWidth: string;
  setDimWidth: (value: string) => void;
  dimHeight: string;
  setDimHeight: (value: string) => void;
  setDimDepth: (value: string) => void;
  verticalPosition: string;
  setVerticalPosition: (value: string) => void;
  saveError: string | null;
  canSave: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export function AddShelfDetailsCard({
  isAssociateMode,
  isManualEntryMode,
  listLoading,
  selectedPlanogramId,
  setSelectedPlanogramId,
  planogramList,
  shelfName,
  setShelfName,
  duplicateNameError,
  shelfTemplatesLoading,
  selectedTemplateId,
  setSelectedTemplateId,
  shelfTemplates,
  applyShelfTemplate,
  aisleCode,
  setAisleCode,
  bayCode,
  setBayCode,
  zone,
  setZone,
  section,
  setSection,
  fixtureType,
  setFixtureType,
  fixtureTypeOptions,
  resolveDepthForFixtureType,
  defaultDimensionUnit,
  dimWidth,
  setDimWidth,
  dimHeight,
  setDimHeight,
  setDimDepth,
  verticalPosition,
  setVerticalPosition,
  saveError,
  canSave,
  isSaving,
  onSave,
}: AddShelfDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {isAssociateMode ? "Planogram details" : "Shelf details"}
        </CardTitle>
        <CardDescription>
          {isAssociateMode
            ? "Select a planogram to associate with this shelf."
            : isManualEntryMode
              ? "Enter details to create a new shelf."
              : "Start from a saved template."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAssociateMode && (
          <div className="space-y-2">
            <Label htmlFor="planogram-select">Planogram</Label>
            {listLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select
                id="planogram-select"
                value={selectedPlanogramId}
                onChange={(e) => setSelectedPlanogramId(e.target.value)}
                aria-label="Select planogram"
              >
                <option value="">Select a planogram...</option>
                {planogramList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.zone ?? "—"} / {p.section ?? "—"} ({p.shelfCount} shelves ·{" "}
                    {p.productCount} SKUs)
                  </option>
                ))}
              </Select>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="shelf-name">Shelf name</Label>
          <Input
            id="shelf-name"
            placeholder="e.g., Food & Beverage Shelf"
            value={shelfName}
            onChange={(e) => setShelfName(e.target.value)}
            autoFocus={!isAssociateMode}
            readOnly={isAssociateMode}
            className={cn(
              duplicateNameError && "border-destructive",
              isAssociateMode && "bg-muted/50",
            )}
            aria-invalid={!!duplicateNameError}
            aria-describedby={duplicateNameError ? "shelf-name-error" : undefined}
          />
          {duplicateNameError && (
            <p
              id="shelf-name-error"
              className="flex items-center gap-1.5 text-sm text-destructive"
            >
              <AlertCircle className="size-4 shrink-0" />
              {duplicateNameError}
            </p>
          )}
        </div>

        {!isAssociateMode && (
          <>
            {!isManualEntryMode ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="shelf-template-select">Shelf template (optional)</Label>
                  {shelfTemplatesLoading ? (
                    <Skeleton className="h-9 w-full" />
                  ) : (
                    <Select
                      id="shelf-template-select"
                      value={selectedTemplateId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSelectedTemplateId(id);
                        const tpl = shelfTemplates.find((t) => t.id === id);
                        if (tpl) applyShelfTemplate(tpl);
                      }}
                      aria-label="Apply shelf template"
                    >
                      <option value="">None — enter manually</option>
                      {shelfTemplates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </Select>
                  )}
                </div>
              </>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bay-code">Bay code</Label>
                <Input
                  id="bay-code"
                  type="text"
                  placeholder="e.g., 01"
                  value={bayCode}
                  onChange={(e) => setBayCode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fixture-type">Fixture Type</Label>
                <Select
                  id="fixture-type"
                  value={fixtureType}
                  onChange={(e) => {
                    const nextFixtureType = e.target.value;
                    const depthFromFixture =
                      resolveDepthForFixtureType(nextFixtureType);
                    setFixtureType(nextFixtureType);
                    if (depthFromFixture) setDimDepth(depthFromFixture);
                  }}
                >
                  <option value="">Choose...</option>
                  {fixtureTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Input
                  id="section"
                  placeholder="e.g., Chilled"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aisle-code">Aisle</Label>
                <Input
                  id="aisle-code"
                  type="text"
                  placeholder="e.g., 90"
                  value={aisleCode}
                  onChange={(e) => setAisleCode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zone">Zone</Label>
                <Input
                  id="zone"
                  placeholder="e.g., Dairy"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vertical-position">Vertical Position</Label>
                <Input
                  id="vertical-position"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 0"
                  value={verticalPosition}
                  onChange={(e) => setVerticalPosition(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="dim-width">Width</Label>
                  <span className="inline-flex items-center rounded-full border border-border bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                    Unit: <span className="ml-1 font-medium">{defaultDimensionUnit}</span>
                  </span>
                </div>
                <Input
                  id="dim-width"
                  placeholder="Width"
                  value={dimWidth}
                  onChange={(e) => setDimWidth(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="dim-height">Height</Label>
                  <span className="inline-flex items-center rounded-full border border-border bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                    Unit: <span className="ml-1 font-medium">{defaultDimensionUnit}</span>
                  </span>
                </div>
                <Input
                  id="dim-height"
                  placeholder="Height"
                  value={dimHeight}
                  onChange={(e) => setDimHeight(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
          </>
        )}

        {saveError && (
          <p className="flex items-center gap-1.5 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {saveError}
          </p>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="success" disabled={!canSave} onClick={onSave}>
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Check className="size-4" aria-hidden />
                {isAssociateMode ? "Associate Planogram" : "Create Shelf"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
