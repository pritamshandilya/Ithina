import { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import type { ShelfTemplate } from "@/types/shelf-template";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";

export interface AddShelfFormValues {
  name: string;
  code?: string;
  width: number;
  height: number;
  vertical_position: number;
}

interface AddShelfFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: AddShelfFormValues) => void | Promise<void>;
  isSaving?: boolean;
  defaultDimensionUnit?: StoreDimensionUnit;
  shelfTemplates?: ShelfTemplate[];
  shelfTemplatesLoading?: boolean;
  initialTemplateId?: string;
  title?: string;
  description?: string;
  fixtureOptions?: Array<{ id: string; label: string }>;
  selectedFixtureId?: string;
  onFixtureChange?: (fixtureId: string) => void;
  disableFixtureSelect?: boolean;
}

export function AddShelfFormModal({
  isOpen,
  onClose,
  onSubmit,
  isSaving = false,
  defaultDimensionUnit = "mm",
  shelfTemplates = [],
  shelfTemplatesLoading = false,
  initialTemplateId,
  title = "Add Shelf",
  description = "Create a shelf for the selected fixture.",
  fixtureOptions = [],
  selectedFixtureId = "",
  onFixtureChange,
  disableFixtureSelect = false,
}: AddShelfFormModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [verticalPosition, setVerticalPosition] = useState("0");
  const [templateId, setTemplateId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedTemplate = useMemo(
    () => shelfTemplates.find((template) => template.id === templateId) ?? null,
    [shelfTemplates, templateId],
  );

  useEffect(() => {
    if (!isOpen) return;
    setName("");
    setCode("");
    setWidth("");
    setHeight("");
    setVerticalPosition("0");
    setError(null);
    setTemplateId(initialTemplateId ?? "");
  }, [isOpen, initialTemplateId]);

  useEffect(() => {
    if (!selectedTemplate) return;
    setName((prev) => prev || selectedTemplate.name);
    setWidth(String(selectedTemplate.width));
    setHeight(String(selectedTemplate.height));
  }, [selectedTemplate]);

  const canSubmit = name.trim() !== "" && !isSaving;

  const handleSubmit = async () => {
    const parsedWidth = Number(width);
    const parsedHeight = Number(height);
    const parsedVerticalPosition = Number(verticalPosition);

    if (!Number.isFinite(parsedWidth) || parsedWidth <= 0) {
      setError("Width must be a valid number greater than 0.");
      return;
    }
    if (!Number.isFinite(parsedHeight) || parsedHeight <= 0) {
      setError("Height must be a valid number greater than 0.");
      return;
    }
    if (!Number.isFinite(parsedVerticalPosition) || parsedVerticalPosition < 0) {
      setError("Vertical position must be a valid number greater than or equal to 0.");
      return;
    }

    setError(null);
    await onSubmit({
      name: name.trim(),
      code: code.trim() || undefined,
      width: parsedWidth,
      height: parsedHeight,
      vertical_position: parsedVerticalPosition,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl" showCloseButton>
      <div className="rounded-xl border border-border bg-card p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>

        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-shelf-fixture">Fixture</Label>
            <Select
              id="add-shelf-fixture"
              value={selectedFixtureId}
              onChange={(event) => onFixtureChange?.(event.target.value)}
              disabled={disableFixtureSelect}
            >
              <option value="">Select fixture...</option>
              {fixtureOptions.map((fixture) => (
                <option key={fixture.id} value={fixture.id}>
                  {fixture.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-shelf-template">Shelf template (optional)</Label>
            <Select
              id="add-shelf-template"
              value={templateId}
              onChange={(event) => setTemplateId(event.target.value)}
              disabled={shelfTemplatesLoading}
            >
              <option value="">None - enter manually</option>
              {shelfTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-shelf-name">Shelf name</Label>
            <Input
              id="add-shelf-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g., Shelf A"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-shelf-code">Shelf code</Label>
            <Input
              id="add-shelf-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Optional (e.g., SH-01)"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="add-shelf-width">Width ({defaultDimensionUnit})</Label>
              <Input
                id="add-shelf-width"
                type="number"
                value={width}
                onChange={(event) => setWidth(event.target.value)}
                placeholder="e.g., 120"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-shelf-height">Height ({defaultDimensionUnit})</Label>
              <Input
                id="add-shelf-height"
                type="number"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
                placeholder="e.g., 30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-shelf-vertical-position">Vertical position</Label>
            <Input
              id="add-shelf-vertical-position"
              type="number"
              value={verticalPosition}
              onChange={(event) => setVerticalPosition(event.target.value)}
              placeholder="e.g., 0"
            />
          </div>

          {error ? (
            <p className="flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="success" onClick={() => void handleSubmit()} disabled={!canSubmit}>
            {isSaving ? "Creating..." : "Create Shelf"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
