import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import type { ShelfTemplateFixtureType } from "@/types/shelf-template";

const FIXTURE_OPTIONS: Array<{ value: ShelfTemplateFixtureType; label: string }> = [
  { value: "gondola", label: "Gondola" },
  { value: "wall_shelving", label: "Wall Shelving" },
  { value: "end_cap", label: "End Cap" },
  { value: "freezer", label: "Freezer" },
  { value: "cooler", label: "Cooler" },
];

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
}

export function ShelfTemplateModal({
  isOpen,
  onClose,
  onSave,
  isSaving = false,
  mode = "create",
  initialValues,
}: ShelfTemplateModalProps) {
  const [form, setForm] = useState<ShelfTemplateModalValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      ...EMPTY_VALUES,
      ...initialValues,
    });
  }, [isOpen, initialValues]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl" showCloseButton>
      <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden text-foreground glassmorphism">
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">
              {mode === "create" ? "New Shelf Template" : "Edit Shelf Template"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Templates are mocked and saved per-store (frontend-only).
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
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    fixtureType: e.target.value as ShelfTemplateFixtureType,
                  }))
                }
              >
                {FIXTURE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
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
              <Label>Dimensions (W × H × D)</Label>
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
              className="bg-chart-2 text-white hover:opacity-90"
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

