import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";

export type StoreFixtureModalValues = {
  type: string;
  /** Optional unique fixture identifier (backend will generate if omitted). */
  code?: string;
  width: string;
  height: string;
  depth: string;
  dimensionUnit: StoreDimensionUnit;
  section: string;
  aisle: string;
  zone: string;
};

const DEFAULT_VALUES: StoreFixtureModalValues = {
  type: "",
  code: undefined,
  width: "",
  height: "",
  depth: "",
  dimensionUnit: "inch",
  section: "",
  aisle: "",
  zone: "",
};

interface StoreFixtureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: StoreFixtureModalValues) => void | Promise<void>;
  isSaving?: boolean;
  mode?: "create" | "edit";
  initialValues?: Partial<StoreFixtureModalValues>;
}

export function StoreFixtureModal({
  isOpen,
  onClose,
  onSave,
  isSaving = false,
  mode = "create",
  initialValues,
}: StoreFixtureModalProps) {
  const normalizeText = (value: string | undefined): string => {
    if (value === undefined) return "";
    const trimmed = String(value).trim();
    if (!trimmed) return "";
    const lower = trimmed.toLowerCase();
    if (lower === "undefined" || lower === "null") return "";
    return trimmed;
  };

  const normalizeOptionalText = (value: string | undefined): string | undefined => {
    const normalized = normalizeText(value);
    return normalized ? normalized : undefined;
  };

  const [form, setForm] = useState<StoreFixtureModalValues>({
    ...DEFAULT_VALUES,
    type: normalizeText(initialValues?.type),
    code: normalizeOptionalText(initialValues?.code),
    width: normalizeText(initialValues?.width),
    height: normalizeText(initialValues?.height),
    depth: normalizeText(initialValues?.depth),
    dimensionUnit: (initialValues?.dimensionUnit ?? DEFAULT_VALUES.dimensionUnit) as StoreDimensionUnit,
    section: normalizeText(initialValues?.section),
    aisle: normalizeText(initialValues?.aisle),
    zone: normalizeText(initialValues?.zone),
  });

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      ...DEFAULT_VALUES,
      type: normalizeText(initialValues?.type),
      code: normalizeOptionalText(initialValues?.code),
      width: normalizeText(initialValues?.width),
      height: normalizeText(initialValues?.height),
      depth: normalizeText(initialValues?.depth),
      dimensionUnit: (initialValues?.dimensionUnit ??
        DEFAULT_VALUES.dimensionUnit) as StoreDimensionUnit,
      section: normalizeText(initialValues?.section),
      aisle: normalizeText(initialValues?.aisle),
      zone: normalizeText(initialValues?.zone),
    });
  }, [isOpen, initialValues]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl" showCloseButton>
      <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden text-foreground glassmorphism">
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">
              {mode === "create" ? "Add Fixture" : "Edit Fixture"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Configure fixture shape and store location.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="fixture-type">Fixture Type</Label>
            <Input
              id="fixture-type"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              placeholder="e.g. Gondola"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fixture-code">Fixture Code (optional)</Label>
            <Input
              id="fixture-code"
              value={form.code ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="e.g. FG-001"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="fixture-unit">Dimension Unit</Label>
              <Select
                id="fixture-unit"
                value={form.dimensionUnit}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    dimensionUnit: e.target.value as StoreDimensionUnit,
                  }))
                }
              >
                <option value="mm">mm</option>
                <option value="cm">cm</option>
                <option value="inch">inch</option>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Dimensions (W × H × D)</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  value={form.width}
                  onChange={(e) => setForm((f) => ({ ...f, width: e.target.value }))}
                  placeholder="Width"
                  className="h-9"
                />
                <span className="text-muted-foreground">×</span>
                <Input
                  type="number"
                  value={form.height}
                  onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))}
                  placeholder="Height"
                  className="h-9"
                />
                <span className="text-muted-foreground">×</span>
                <Input
                  type="number"
                  value={form.depth}
                  onChange={(e) => setForm((f) => ({ ...f, depth: e.target.value }))}
                  placeholder="Depth"
                  className="h-9"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="fixture-section">Section</Label>
              <Input
                id="fixture-section"
                value={form.section}
                onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
                placeholder="General"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fixture-aisle">Aisle</Label>
              <Input
                id="fixture-aisle"
                value={form.aisle}
                onChange={(e) => setForm((f) => ({ ...f, aisle: e.target.value }))}
                placeholder="A1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fixture-zone">Zone</Label>
              <Input
                id="fixture-zone"
                value={form.zone}
                onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value }))}
                placeholder="General"
              />
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
              {isSaving ? "Saving..." : "Save fixture"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

