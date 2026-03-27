import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdateShelf } from "@/queries/maker/hooks/useUpdateShelf";
import { useToast } from "@/hooks/use-toast";
import type { Shelf } from "@/types/maker";
import { Loader2 } from "lucide-react";

interface EditShelfModalProps {
  shelf: Shelf;
  isOpen: boolean;
  onClose: () => void;
}

interface EditShelfFormValues {
  shelfName: string;
  shelfCode: string;
  aisle: string;
  zone: string;
  section: string;
  fixtureType: string;
  width: string;
  height: string;
  depth: string;
}

function getInitialEditShelfFormValues(shelf: Shelf): EditShelfFormValues {
  const [width = "", height = "", depth = ""] = (shelf.dimensions || "").split("x");

  return {
    shelfName: shelf.shelfName,
    shelfCode: shelf.shelfCode ?? "",
    aisle:
      shelf.aisleCode ??
      (shelf.aisleNumber != null ? `A${shelf.aisleNumber}` : ""),
    zone: shelf.zone ?? "",
    section: shelf.section ?? "",
    fixtureType: shelf.fixtureType ?? "",
    width,
    height,
    depth,
  };
}

export function EditShelfModal({ shelf, isOpen, onClose }: EditShelfModalProps) {
  const draftSeed = `${shelf.id}:${shelf.updatedAt?.toISOString() ?? ""}`;
  const [draftState, setDraftState] = useState<{
    seed: string;
    values: Partial<EditShelfFormValues>;
  }>({
    seed: draftSeed,
    values: {},
  });

  const { mutate: updateShelf, isPending } = useUpdateShelf();
  const { toast } = useToast();
  const formValues = {
    ...getInitialEditShelfFormValues(shelf),
    ...(draftState.seed === draftSeed ? draftState.values : {}),
  };

  const updateField = <K extends keyof EditShelfFormValues>(
    field: K,
    value: EditShelfFormValues[K],
  ) => {
    setDraftState((prev) => ({
      seed: draftSeed,
      values: {
        ...(prev.seed === draftSeed ? prev.values : {}),
        [field]: value,
      },
    }));
  };

  const handleClose = () => {
    setDraftState({ seed: draftSeed, values: {} });
    onClose();
  };

  const handleSave = () => {
    if (!formValues.shelfName.trim() || !formValues.shelfCode.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Shelf name and code cannot be empty.",
      });
      return;
    }

    updateShelf(
      {
        shelfId: shelf.id,
        payload: {
          name: formValues.shelfName.trim(),
          code: formValues.shelfCode.trim(),
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Shelf updated",
            description: "Shelf details updated successfully.",
            variant: "success",
          });
          handleClose();
        },
        onError: (error: unknown) => {
          toast({
            variant: "destructive",
            title: "Error",
            description:
              error instanceof Error
                ? error.message
                : "Failed to update shelf details.",
          });
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-accent/10 via-card to-card border-b border-border/50">
          <CardTitle>Edit Shelf Details</CardTitle>
          <CardDescription>Update the basic identifying information for this shelf.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-shelf-name">Shelf Name</Label>
            <Input
              id="edit-shelf-name"
              value={formValues.shelfName}
              onChange={(e) => updateField("shelfName", e.target.value)}
              placeholder="e.g. Food & Beverage Shelf"
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-shelf-code">Shelf Identifier / Code</Label>
            <Input
              id="edit-shelf-code"
              value={formValues.shelfCode}
              onChange={(e) => updateField("shelfCode", e.target.value)}
              placeholder="e.g. SH-01"
              className="bg-background/50"
            />
            <p className="text-[10px] text-muted-foreground italic">
              * This is the unique string code used to identify the shelf within its fixture.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-zone">Zone</Label>
              <Input
                id="edit-zone"
                value={formValues.zone}
                onChange={(e) => updateField("zone", e.target.value)}
                placeholder="e.g. Grocery"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-section">Section</Label>
              <Input
                id="edit-section"
                value={formValues.section}
                onChange={(e) => updateField("section", e.target.value)}
                placeholder="e.g. Snacks"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-aisle">Aisle</Label>
              <Input
                id="edit-aisle"
                value={formValues.aisle}
                onChange={(e) => updateField("aisle", e.target.value)}
                placeholder="e.g. A3"
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-fixture-type">Fixture Type</Label>
            <Input
              id="edit-fixture-type"
              value={formValues.fixtureType}
              onChange={(e) => updateField("fixtureType", e.target.value)}
              placeholder="e.g. Gondola, Wall Shelving"
              className="bg-background/50"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-width">Width (cm)</Label>
              <Input
                id="edit-width"
                type="number"
                value={formValues.width}
                onChange={(e) => updateField("width", e.target.value)}
                placeholder="e.g. 120"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-height">Height (cm)</Label>
              <Input
                id="edit-height"
                type="number"
                value={formValues.height}
                onChange={(e) => updateField("height", e.target.value)}
                placeholder="e.g. 200"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-depth">Depth (cm)</Label>
              <Input
                id="edit-depth"
                type="number"
                value={formValues.depth}
                onChange={(e) => updateField("depth", e.target.value)}
                placeholder="e.g. 50"
                className="bg-background/50"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 p-6 pt-0 border-t border-border/50 bg-muted/20">
          <Button variant="ghost" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isPending}
            className="bg-accent text-accent-foreground hover:opacity-90"
          >
            {isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </Modal>
  );
}
