import { Edit3, Save, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";

export interface FixtureDraftState {
  type: string;
  code: string;
  width: string;
  height: string;
  depth: string;
  dimensionUnit: string;
  aisle: string;
  section: string;
  zone: string;
}

export type FixtureFormDraft = FixtureDraftState & {
  planogramId: string;
  complianceRuleSetId: string;
};

export interface StoreFixtureDetailFixtureTabCardProps {
  fixtureDraft: FixtureFormDraft;
  setFixtureDraft: Dispatch<SetStateAction<FixtureFormDraft>>;
  isFixtureEditing: boolean;
  setIsFixtureEditing: (value: boolean) => void;
  isFixtureSaving: boolean;
  onSaveFixture: () => void | Promise<void>;
}

export function StoreFixtureDetailFixtureTabCard({
  fixtureDraft,
  setFixtureDraft,
  isFixtureEditing,
  setIsFixtureEditing,
  isFixtureSaving,
  onSaveFixture,
}: StoreFixtureDetailFixtureTabCardProps) {
  return (
    <Card className="border-border bg-card/80 w-full">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
        <CardTitle className="text-sm">Display Unit Details</CardTitle>
        {!isFixtureEditing ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="inline-flex shrink-0 items-center gap-2"
            onClick={() => setIsFixtureEditing(true)}
          >
            <Edit3 className="size-4" aria-hidden />
            Edit
          </Button>
        ) : (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="inline-flex items-center gap-2"
              onClick={() => setIsFixtureEditing(false)}
            >
              <X className="size-4" aria-hidden />
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              variant="success"
              className="inline-flex items-center gap-2"
              onClick={() => void onSaveFixture()}
              disabled={isFixtureSaving}
            >
              <Save className="size-4" aria-hidden />
              Save
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="fixture-detail-code"
            className="text-muted-foreground text-xs font-medium"
          >
            Display Unit code
          </Label>
          <Input
            id="fixture-detail-code"
            value={fixtureDraft.code}
            onChange={(e) =>
              setFixtureDraft((prev) => ({ ...prev, code: e.target.value }))
            }
            disabled={!isFixtureEditing}
            placeholder="e.g. F-GON-A1-Z1-01"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="fixture-detail-type"
            className="text-muted-foreground text-xs font-medium"
          >
            Display Unit type
          </Label>
          <Input
            id="fixture-detail-type"
            value={fixtureDraft.type}
            onChange={(e) =>
              setFixtureDraft((prev) => ({ ...prev, type: e.target.value }))
            }
            disabled={!isFixtureEditing}
            placeholder="e.g. Gondola"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label
              htmlFor="fixture-detail-width"
              className="text-muted-foreground text-xs font-medium"
            >
              Width
            </Label>
            <Input
              id="fixture-detail-width"
              inputMode="decimal"
              value={fixtureDraft.width}
              onChange={(e) =>
                setFixtureDraft((prev) => ({ ...prev, width: e.target.value }))
              }
              disabled={!isFixtureEditing}
              placeholder="Width"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="fixture-detail-height"
              className="text-muted-foreground text-xs font-medium"
            >
              Height
            </Label>
            <Input
              id="fixture-detail-height"
              inputMode="decimal"
              value={fixtureDraft.height}
              onChange={(e) =>
                setFixtureDraft((prev) => ({ ...prev, height: e.target.value }))
              }
              disabled={!isFixtureEditing}
              placeholder="Height"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="fixture-detail-depth"
              className="text-muted-foreground text-xs font-medium"
            >
              Depth
            </Label>
            <Input
              id="fixture-detail-depth"
              inputMode="decimal"
              value={fixtureDraft.depth}
              onChange={(e) =>
                setFixtureDraft((prev) => ({ ...prev, depth: e.target.value }))
              }
              disabled={!isFixtureEditing}
              placeholder="Depth"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="fixture-detail-dimension-unit"
              className="text-muted-foreground text-xs font-medium"
            >
              Unit
            </Label>
            <Select
              id="fixture-detail-dimension-unit"
              value={fixtureDraft.dimensionUnit}
              onChange={(e) =>
                setFixtureDraft((prev) => ({
                  ...prev,
                  dimensionUnit: e.target.value as StoreDimensionUnit,
                }))
              }
              disabled={!isFixtureEditing}
              aria-label="Dimension unit"
            >
              <option value="mm">mm</option>
              <option value="cm">cm</option>
              <option value="inch">inch</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-2">
            <Label
              htmlFor="fixture-detail-aisle"
              className="text-muted-foreground text-xs font-medium"
            >
              Aisle
            </Label>
            <Input
              id="fixture-detail-aisle"
              value={fixtureDraft.aisle}
              onChange={(e) =>
                setFixtureDraft((prev) => ({ ...prev, aisle: e.target.value }))
              }
              disabled={!isFixtureEditing}
              placeholder="Aisle"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="fixture-detail-section"
              className="text-muted-foreground text-xs font-medium"
            >
              Section
            </Label>
            <Input
              id="fixture-detail-section"
              value={fixtureDraft.section}
              onChange={(e) =>
                setFixtureDraft((prev) => ({
                  ...prev,
                  section: e.target.value,
                }))
              }
              disabled={!isFixtureEditing}
              placeholder="Section"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="fixture-detail-zone"
              className="text-muted-foreground text-xs font-medium"
            >
              Zone
            </Label>
            <Input
              id="fixture-detail-zone"
              value={fixtureDraft.zone}
              onChange={(e) =>
                setFixtureDraft((prev) => ({ ...prev, zone: e.target.value }))
              }
              disabled={!isFixtureEditing}
              placeholder="Zone"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
