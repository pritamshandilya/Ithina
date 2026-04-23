import type { Dispatch, SetStateAction } from "react";
import { Edit3, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
    <Card className="w-full border-border bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">Fixture Details</CardTitle>
        {!isFixtureEditing ? (
          <Button size="sm" variant="outline" onClick={() => setIsFixtureEditing(true)}>
            <Edit3 className="size-4" aria-hidden />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsFixtureEditing(false)}>
              <X className="size-4" aria-hidden />
            </Button>
            <Button
              size="sm"
              variant="success"
              onClick={() => void onSaveFixture()}
              disabled={isFixtureSaving}
            >
              <Save className="size-4" aria-hidden />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <Input
          value={fixtureDraft.type}
          onChange={(e) =>
            setFixtureDraft((prev) => ({ ...prev, type: e.target.value }))
          }
          disabled={!isFixtureEditing}
          placeholder="Fixture type"
        />
        <Input
          value={fixtureDraft.code}
          onChange={(e) =>
            setFixtureDraft((prev) => ({ ...prev, code: e.target.value }))
          }
          disabled={!isFixtureEditing}
          placeholder="Fixture code"
        />
        <div className="grid grid-cols-3 gap-2">
          <Input
            value={fixtureDraft.width}
            onChange={(e) =>
              setFixtureDraft((prev) => ({ ...prev, width: e.target.value }))
            }
            disabled={!isFixtureEditing}
            placeholder="Width"
          />
          <Input
            value={fixtureDraft.height}
            onChange={(e) =>
              setFixtureDraft((prev) => ({ ...prev, height: e.target.value }))
            }
            disabled={!isFixtureEditing}
            placeholder="Height"
          />
          <Input
            value={fixtureDraft.depth}
            onChange={(e) =>
              setFixtureDraft((prev) => ({ ...prev, depth: e.target.value }))
            }
            disabled={!isFixtureEditing}
            placeholder="Depth"
          />
        </div>
        <Select
          value={fixtureDraft.dimensionUnit}
          onChange={(e) =>
            setFixtureDraft((prev) => ({
              ...prev,
              dimensionUnit: e.target.value as StoreDimensionUnit,
            }))
          }
          disabled={!isFixtureEditing}
        >
          <option value="mm">mm</option>
          <option value="cm">cm</option>
          <option value="inch">inch</option>
        </Select>
        <div className="grid grid-cols-3 gap-2">
          <Input
            value={fixtureDraft.aisle}
            onChange={(e) =>
              setFixtureDraft((prev) => ({ ...prev, aisle: e.target.value }))
            }
            disabled={!isFixtureEditing}
            placeholder="Aisle"
          />
          <Input
            value={fixtureDraft.section}
            onChange={(e) =>
              setFixtureDraft((prev) => ({ ...prev, section: e.target.value }))
            }
            disabled={!isFixtureEditing}
            placeholder="Section"
          />
          <Input
            value={fixtureDraft.zone}
            onChange={(e) =>
              setFixtureDraft((prev) => ({ ...prev, zone: e.target.value }))
            }
            disabled={!isFixtureEditing}
            placeholder="Zone"
          />
        </div>
      </CardContent>
    </Card>
  );
}
