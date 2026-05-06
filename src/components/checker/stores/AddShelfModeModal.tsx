import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";

type AddMode = "manual" | "template";

interface AddShelfModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shelfTemplates: { id: string; name: string }[];
  shelfTemplatesLoading: boolean;
  onContinue: (payload: { addMode: AddMode; templateId?: string }) => void;
}

export function AddShelfModeModal({
  isOpen,
  onClose,
  shelfTemplates,
  shelfTemplatesLoading,
  onContinue,
}: AddShelfModeModalProps) {
  const [addMode, setAddMode] = useState<AddMode>("manual");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setAddMode("manual");
    setSelectedTemplateId("");
  }, [isOpen]);

  const canContinue = useMemo(
    () =>
      addMode === "manual" || (addMode === "template" && !!selectedTemplateId),
    [addMode, selectedTemplateId],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg"
      showCloseButton
    >
      <div className="border-border bg-card rounded-xl border p-6 shadow-2xl">
        <h3 className="text-foreground text-lg font-semibold">
          How would you like to add a shelf?
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Choose manual entry or start from an existing shelf template.
        </p>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={() => setAddMode("manual")}
            className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
              addMode === "manual"
                ? "border-accent bg-accent/10"
                : "border-border bg-background/40 hover:border-accent/60"
            }`}
          >
            <p className="text-foreground font-medium">Manual</p>
            <p className="text-muted-foreground text-xs">
              Enter shelf details manually for this fixture.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setAddMode("template")}
            className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
              addMode === "template"
                ? "border-accent bg-accent/10"
                : "border-border bg-background/40 hover:border-accent/60"
            }`}
          >
            <p className="text-foreground font-medium">Use Template</p>
            <p className="text-muted-foreground text-xs">
              Apply shelf template values and add shelves faster.
            </p>
          </button>
        </div>

        {addMode === "template" ? (
          <div className="mt-4 space-y-2">
            <Label htmlFor="fixture-add-shelf-template">Shelf template</Label>
            {shelfTemplatesLoading ? (
              <div className="bg-muted/50 h-9 w-full animate-pulse rounded-md" />
            ) : (
              <Select
                id="fixture-add-shelf-template"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
              >
                <option value="">Select a template...</option>
                {shelfTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </Select>
            )}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={() =>
              onContinue({
                addMode,
                templateId:
                  addMode === "template" ? selectedTemplateId : undefined,
              })
            }
            disabled={!canContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
}
