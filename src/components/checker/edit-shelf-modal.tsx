import { useState, useEffect } from "react";
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

export function EditShelfModal({ shelf, isOpen, onClose }: EditShelfModalProps) {
  const [shelfName, setShelfName] = useState(shelf.shelfName);
  const [shelfCode, setShelfCode] = useState(shelf.shelfCode);
  const [aisle, setAisle] = useState(shelf.aisle || (shelf.aisleNumber ? String(shelf.aisleNumber) : ""));
  const [zone, setZone] = useState(shelf.zone ?? "");
  const [section, setSection] = useState(shelf.section ?? "");
  const [fixtureType, setFixtureType] = useState(shelf.fixtureType ?? "");

  const [initialWidth, initialHeight, initialDepth] = (shelf.dimensions || "").split("x");
  const [width, setWidth] = useState(initialWidth || "");
  const [height, setHeight] = useState(initialHeight || "");
  const [depth, setDepth] = useState(initialDepth || "");

  const { mutate: updateShelf, isPending } = useUpdateShelf();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setShelfName(shelf.shelfName);
      setShelfCode(shelf.shelfCode);
      setAisle(shelf.aisle || (shelf.aisleNumber ? String(shelf.aisleNumber) : ""));
      setZone(shelf.zone ?? "");
      setSection(shelf.section ?? "");
      setFixtureType(shelf.fixtureType ?? "");
      const [iw, ih, id] = (shelf.dimensions || "").split("x");
      setWidth(iw || "");
      setHeight(ih || "");
      setDepth(id || "");
    }
  }, [isOpen, shelf]);

  const handleSave = () => {
    if (!shelfName.trim() || !shelfCode.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Shelf name and code cannot be empty.",
      });
      return;
    }

    const fixturePayload = {
      type: fixtureType.trim() ? fixtureType.trim() : undefined,
      physical_location:
        aisle.trim() || zone.trim() || section.trim()
          ? {
              aisle: aisle.trim() ? aisle.trim() : undefined,
              zone: zone.trim() ? zone.trim() : undefined,
              section: section.trim() ? section.trim() : undefined,
            }
          : undefined,
      dimensions:
        width.trim() || height.trim() || depth.trim()
          ? {
              width: width.trim() ? Number(width) : undefined,
              height: height.trim() ? Number(height) : undefined,
              depth: depth.trim() ? Number(depth) : undefined,
            }
          : undefined,
    };

    if (fixturePayload.physical_location && Object.values(fixturePayload.physical_location).every((v) => v === undefined)) {
      fixturePayload.physical_location = undefined;
    }
    if (fixturePayload.dimensions && Object.values(fixturePayload.dimensions).every((v) => v === undefined)) {
      fixturePayload.dimensions = undefined;
    }
    
    const hasFixtureUpdates = Object.values(fixturePayload).some(v => v !== undefined);

    updateShelf(
      {
        shelfId: shelf.id,
        payload: {
          name: shelfName.trim(),
          shelf_id: shelfCode.trim(),
          ...(hasFixtureUpdates ? { fixture: fixturePayload } : {}),
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Shelf details updated successfully.",
          });
          onClose();
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to update shelf details.",
          });
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
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
              value={shelfName}
              onChange={(e) => setShelfName(e.target.value)}
              placeholder="e.g. Food & Beverage Shelf"
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-shelf-code">Shelf Identifier / Code</Label>
            <Input
              id="edit-shelf-code"
              value={shelfCode}
              onChange={(e) => setShelfCode(e.target.value)}
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
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="e.g. Grocery"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-section">Section</Label>
              <Input
                id="edit-section"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. Snacks"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-aisle">Aisle</Label>
              <Input
                id="edit-aisle"
                value={aisle}
                onChange={(e) => setAisle(e.target.value)}
                placeholder="e.g. A3"
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-fixture-type">Fixture Type</Label>
            <Input
              id="edit-fixture-type"
              value={fixtureType}
              onChange={(e) => setFixtureType(e.target.value)}
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
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="e.g. 120"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-height">Height (cm)</Label>
              <Input
                id="edit-height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 200"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-depth">Depth (cm)</Label>
              <Input
                id="edit-depth"
                type="number"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                placeholder="e.g. 50"
                className="bg-background/50"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 p-6 pt-0 border-t border-border/50 bg-muted/20">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
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
