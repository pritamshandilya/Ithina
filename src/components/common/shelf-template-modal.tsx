import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import type { ShelfTemplateFixtureType } from "@/types/shelf-template";

const PRESET_FIXTURE_OPTIONS: Array<{ value: ShelfTemplateFixtureType; label: string }> = [
  { value: "gondola", label: "Gondola" },
  { value: "wall_shelving", label: "Wall Shelving" },
  { value: "end_cap", label: "End Cap" },
  { value: "freezer", label: "Freezer" },
  { value: "cooler", label: "Cooler" },
];

function fixtureLabelDedupeKey(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "");
}

const PRESET_DEDUPE_KEYS = new Set(
  PRESET_FIXTURE_OPTIONS.flatMap((p) => [
    fixtureLabelDedupeKey(p.label),
    fixtureLabelDedupeKey(p.value.replace(/_/g, " ")),
  ]),
);

const EXTRA_LABELS_EQUIVALENT_TO_PRESET = new Set(
  [
    "Gondola (standard)",
    "Cooler/Chiller",
    "Wall Unit",
  ].map((s) => fixtureLabelDedupeKey(s)),
);

export function buildShelfTemplateFixtureSelectOptions(
  extraFixtureLabels: string[] | undefined,
): Array<{ value: string; label: string }> {
  const out: Array<{ value: string; label: string }> = [...PRESET_FIXTURE_OPTIONS];
  const seenValue = new Set(out.map((o) => o.value.toLowerCase()));
  const seenLabel = new Set(out.map((o) => o.label.toLowerCase()));
  const seenDedupeKeys = new Set(
    out.flatMap((o) => [fixtureLabelDedupeKey(o.label), fixtureLabelDedupeKey(o.value)]),
  );

  for (const raw of extraFixtureLabels ?? []) {
    const label = raw.trim();
    if (!label) continue;
    const lower = label.toLowerCase();
    const dedupeKey = fixtureLabelDedupeKey(label);

    if (seenLabel.has(lower)) continue;
    if (seenValue.has(lower)) continue;
    if (seenDedupeKeys.has(dedupeKey)) continue;

    if (PRESET_FIXTURE_OPTIONS.some((p) => p.value.toLowerCase() === lower)) continue;
    if (PRESET_DEDUPE_KEYS.has(dedupeKey)) continue;
    if (EXTRA_LABELS_EQUIVALENT_TO_PRESET.has(dedupeKey)) continue;

    seenLabel.add(lower);
    seenValue.add(lower);
    seenDedupeKeys.add(dedupeKey);
    out.push({ value: label, label });
  }
  return out;
}

export type ShelfTemplateModalValues = {
  name: string;
  description: string;
  fixtureType: ShelfTemplateFixtureType;
  zone: string;
  section: string;
  width: string;
  height: string;
  depth: string;
};

const EMPTY_VALUES: ShelfTemplateModalValues = {
  name: "",
  description: "",
  fixtureType: "gondola",
  zone: "",
  section: "",
  width: "48",
  height: "72",
  depth: "18",
};

interface ShelfTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: ShelfTemplateModalValues) => void | Promise<void>;
  isSaving?: boolean;
  mode?: "create" | "edit";
  initialValues?: Partial<ShelfTemplateModalValues>;
  /** Store default fixture names (e.g. from onboarding or Store Defaults). */
  extraFixtureTypeOptions?: string[];
  fixtureDepthByType?: Record<string, string | number>;
  fixtureUnitByType?: Record<string, string>;
}

export function ShelfTemplateModal({
  isOpen,
  onClose,
  onSave,
  isSaving = false,
  mode = "create",
  initialValues,
  extraFixtureTypeOptions,
  fixtureDepthByType,
  fixtureUnitByType,
}: ShelfTemplateModalProps) {
  const [form, setForm] = useState<ShelfTemplateModalValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });

  const fixtureOptions = useMemo(
    () => buildShelfTemplateFixtureSelectOptions(extraFixtureTypeOptions),
    [extraFixtureTypeOptions],
  );

  const depthByType = useMemo(() => {
    const map = new Map<string, string>();
    for (const [rawKey, rawDepth] of Object.entries(fixtureDepthByType ?? {})) {
      const key = rawKey.trim();
      if (!key) continue;
      const depth = String(rawDepth).trim();
      if (!depth) continue;
      map.set(key.toLowerCase(), depth);
      map.set(fixtureLabelDedupeKey(key), depth);
    }
    return map;
  }, [fixtureDepthByType]);

  const unitByType = useMemo(() => {
    const map = new Map<string, string>();
    for (const [rawKey, rawUnit] of Object.entries(fixtureUnitByType ?? {})) {
      const key = rawKey.trim();
      const unit = rawUnit.trim();
      if (!key || !unit) continue;
      map.set(key.toLowerCase(), unit);
      map.set(fixtureLabelDedupeKey(key), unit);
    }
    return map;
  }, [fixtureUnitByType]);

  const resolveDepthForFixtureType = (fixtureTypeValue: string): string | undefined => {
    const normalizedValue = fixtureTypeValue.trim().toLowerCase();
    const dedupeValue = fixtureLabelDedupeKey(fixtureTypeValue);
    const optionLabel =
      fixtureOptions.find((option) => option.value === fixtureTypeValue)?.label ?? "";
    const normalizedLabel = optionLabel.toLowerCase();
    const dedupeLabel = fixtureLabelDedupeKey(optionLabel);

    return (
      depthByType.get(normalizedValue) ??
      depthByType.get(dedupeValue) ??
      depthByType.get(normalizedLabel) ??
      depthByType.get(dedupeLabel)
    );
  };

  const resolveUnitForFixtureType = (fixtureTypeValue: string): string | undefined => {
    const normalizedValue = fixtureTypeValue.trim().toLowerCase();
    const dedupeValue = fixtureLabelDedupeKey(fixtureTypeValue);
    const optionLabel =
      fixtureOptions.find((option) => option.value === fixtureTypeValue)?.label ?? "";
    const normalizedLabel = optionLabel.toLowerCase();
    const dedupeLabel = fixtureLabelDedupeKey(optionLabel);

    return (
      unitByType.get(normalizedValue) ??
      unitByType.get(dedupeValue) ??
      unitByType.get(normalizedLabel) ??
      unitByType.get(dedupeLabel)
    );
  };

  const selectedFixtureUnit = resolveUnitForFixtureType(form.fixtureType);

  useEffect(() => {
    if (!isOpen) return;
    const merged: ShelfTemplateModalValues = {
      ...EMPTY_VALUES,
      ...initialValues,
    };
    const allowed = new Set(fixtureOptions.map((o) => o.value));
    if (!allowed.has(merged.fixtureType)) {
      merged.fixtureType = fixtureOptions[0]?.value ?? "gondola";
    }
    setForm(merged);
  }, [isOpen, initialValues, fixtureOptions]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl" showCloseButton>
      <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden text-foreground glassmorphism">
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">
              {mode === "create" ? "New Shelf Template" : "Edit Shelf Template"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Five standard fixture types are always listed. Your store’s custom fixture names
              (from onboarding or Store Defaults) are added below—names that duplicate a standard
              type are hidden so the list stays short.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="tpl-name">Name</Label>
            <Input
              id="tpl-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Gondola (Standard)"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tpl-desc">Description (optional)</Label>
            <Input
              id="tpl-desc"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Short description"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="tpl-fixture">Fixture Type</Label>
              <Select
                id="tpl-fixture"
                value={form.fixtureType}
                onChange={(e) => {
                  const selectedFixtureType = e.target.value;
                  const depthFromFixture = resolveDepthForFixtureType(selectedFixtureType);
                  setForm((f) => ({
                    ...f,
                    fixtureType: selectedFixtureType,
                    depth: depthFromFixture ?? f.depth,
                  }));
                }}
              >
                {fixtureOptions.map((o) => (
                  <option key={`${o.value}-${o.label}`} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tpl-zone">Zone (optional)</Label>
              <Input
                id="tpl-zone"
                value={form.zone}
                onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value }))}
                placeholder="e.g. Grocery"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="tpl-section">Section (optional)</Label>
              <Input
                id="tpl-section"
                value={form.section}
                onChange={(e) =>
                  setForm((f) => ({ ...f, section: e.target.value }))
                }
                placeholder="e.g. Snacks"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Dimensions (W × H × D)</Label>
                {selectedFixtureUnit ? (
                  <span className="text-xs text-muted-foreground">Unit: {selectedFixtureUnit}</span>
                ) : null}
              </div>
              <div className="flex items-center gap-1.5">
                <Input
                  value={form.width}
                  onChange={(e) => setForm((f) => ({ ...f, width: e.target.value }))}
                  placeholder="Width"
                  className="h-9"
                />
                <span className="text-muted-foreground">×</span>
                <Input
                  value={form.height}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, height: e.target.value }))
                  }
                  placeholder="Height"
                  className="h-9"
                />
                <span className="text-muted-foreground">×</span>
                <Input
                  value={form.depth}
                  onChange={(e) => setForm((f) => ({ ...f, depth: e.target.value }))}
                  placeholder="Depth"
                  className="h-9"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={() => void onSave(form)}
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : "Save template"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
