import { useCallback, useRef, useState } from "react";
import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/hooks/use-toast";

const BULK_SHELVES_SAMPLE_JSON = JSON.stringify(
  {
    fixtures: [
      {
        code: "FRONT-01",
        type: "Gondola",
        dimensions: { width: 120, height: 200, depth: 45 },
        dimension_unit: "cm",
        physical_location: { section: "Produce", aisle: "A1", zone: "North" },
        shelves: [
          { code: "S-A1-01", name: "Top Shelf", width: 100, height: 35, vertical_position: 10 },
          { code: "S-A1-02", name: "Middle Shelf", width: 98, height: 35, vertical_position: 55 },
        ],
      },
    ],
  },
  null,
  2,
);

export type BulkShelfInput = {
  code: string;
  name: string;
  width: number;
  height: number;
  vertical_position: number;
};

export type BulkFixtureInput = {
  code: string;
  type: string;
  dimensions: { width: number; height: number; depth: number };
  dimension_unit: string;
  physical_location: { section: string; aisle: string; zone: string };
  shelves: BulkShelfInput[];
};

export type ParsedBulkPayload = {
  fixtures: BulkFixtureInput[];
  totalShelves: number;
};

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function parseBulkShelvesPayload(raw: string): ParsedBulkPayload {
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== "object") throw new Error("JSON root must be an object.");
  const fixtures = (parsed as { fixtures?: unknown }).fixtures;
  if (!Array.isArray(fixtures) || fixtures.length === 0) {
    throw new Error("`fixtures` must be a non-empty array.");
  }
  const normalizedFixtures: BulkFixtureInput[] = fixtures.map((fixture, fixtureIdx) => {
    if (!fixture || typeof fixture !== "object") {
      throw new Error(`Fixture ${fixtureIdx + 1} is invalid.`);
    }
    const f = fixture as Record<string, unknown>;
    const code = String(f.code ?? "").trim();
    const type = String(f.type ?? "").trim();
    const dimensionUnit = String(f.dimension_unit ?? "").trim();
    const dimensions = f.dimensions as Record<string, unknown> | undefined;
    const location = f.physical_location as Record<string, unknown> | undefined;
    const shelves = f.shelves as unknown;
    if (!code || !type || !dimensionUnit) {
      throw new Error(`Fixture ${fixtureIdx + 1}: code, type, and dimension_unit are required.`);
    }
    if (!dimensions || !location || !Array.isArray(shelves) || shelves.length === 0) {
      throw new Error(
        `Fixture ${fixtureIdx + 1}: dimensions, physical_location, and shelves are required.`,
      );
    }
    const width = dimensions.width;
    const height = dimensions.height;
    const depth = dimensions.depth;
    if (!isPositiveNumber(width) || !isPositiveNumber(height) || !isPositiveNumber(depth)) {
      throw new Error(`Fixture ${fixtureIdx + 1}: dimensions must be positive numbers.`);
    }
    const section = String(location.section ?? "").trim();
    const aisle = String(location.aisle ?? "").trim();
    const zone = String(location.zone ?? "").trim();
    if (!section || !aisle || !zone) {
      throw new Error(`Fixture ${fixtureIdx + 1}: section, aisle and zone are required.`);
    }
    const normalizedShelves: BulkShelfInput[] = shelves.map((shelf, shelfIdx) => {
      if (!shelf || typeof shelf !== "object") {
        throw new Error(`Fixture ${fixtureIdx + 1}, shelf ${shelfIdx + 1} is invalid.`);
      }
      const s = shelf as Record<string, unknown>;
      const shelfCode = String(s.code ?? "").trim();
      const shelfName = String(s.name ?? "").trim();
      const shelfWidth = s.width;
      const shelfHeight = s.height;
      const verticalPosition = s.vertical_position;
      if (!shelfCode || !shelfName) {
        throw new Error(`Fixture ${fixtureIdx + 1}, shelf ${shelfIdx + 1}: code and name are required.`);
      }
      if (!isPositiveNumber(shelfWidth) || !isPositiveNumber(shelfHeight)) {
        throw new Error(
          `Fixture ${fixtureIdx + 1}, shelf ${shelfIdx + 1}: width/height must be positive numbers.`,
        );
      }
      if (
        typeof verticalPosition !== "number" ||
        !Number.isFinite(verticalPosition) ||
        verticalPosition < 0
      ) {
        throw new Error(
          `Fixture ${fixtureIdx + 1}, shelf ${shelfIdx + 1}: vertical_position must be >= 0.`,
        );
      }
      return {
        code: shelfCode,
        name: shelfName,
        width: shelfWidth,
        height: shelfHeight,
        vertical_position: verticalPosition,
      };
    });
    return {
      code,
      type,
      dimensions: { width, height, depth },
      dimension_unit: dimensionUnit,
      physical_location: { section, aisle, zone },
      shelves: normalizedShelves,
    };
  });
  return {
    fixtures: normalizedFixtures,
    totalShelves: normalizedFixtures.reduce((sum, f) => sum + f.shelves.length, 0),
  };
}

interface BulkAddShelvesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitBulk: (payload: ParsedBulkPayload) => Promise<number>;
}

export function BulkAddShelvesModal({
  isOpen,
  onClose,
  onSubmitBulk,
}: BulkAddShelvesModalProps) {
  const { toast } = useToast();
  const [bulkAddMode, setBulkAddMode] = useState<"file" | "paste">("file");
  const [bulkAddStep, setBulkAddStep] = useState<"input" | "preview">("input");
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [isBulkDragging, setIsBulkDragging] = useState(false);
  const [pastedBulkJson, setPastedBulkJson] = useState("");
  const [parsedBulkPayload, setParsedBulkPayload] = useState<ParsedBulkPayload | null>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setBulkAddMode("file");
    setBulkAddStep("input");
    setBulkFile(null);
    setPastedBulkJson("");
    setParsedBulkPayload(null);
    setIsBulkDragging(false);
  }, []);

  const handleBulkFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      if (file && !file.name.toLowerCase().endsWith(".json")) {
        toast({
          title: "Invalid file type",
          description: "Only JSON files are supported.",
          variant: "warning",
        });
        return;
      }
      setBulkFile(file);
      event.target.value = "";
    },
    [toast],
  );

  const handleConfirmBulkAdd = useCallback(async () => {
    let raw = "";
    if (bulkAddMode === "file") {
      if (!bulkFile) {
        toast({
          title: "No file selected",
          description: "Select a JSON file to continue.",
          variant: "warning",
        });
        return;
      }
      try {
        raw = await bulkFile.text();
      } catch {
        toast({
          title: "Read failed",
          description: "Could not read the selected file.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!pastedBulkJson.trim()) {
        toast({
          title: "No JSON pasted",
          description: "Paste JSON content to continue.",
          variant: "warning",
        });
        return;
      }
      raw = pastedBulkJson;
    }

    try {
      const normalized = parseBulkShelvesPayload(raw);
      setParsedBulkPayload(normalized);
      setBulkAddStep("preview");
      toast({
        title: "JSON parsed",
        description: `Found ${normalized.fixtures.length} fixtures and ${normalized.totalShelves} shelves.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Invalid JSON structure",
        description:
          error instanceof Error
            ? error.message
            : "Could not parse fixtures and shelves from JSON.",
        variant: "destructive",
      });
    }
  }, [bulkAddMode, bulkFile, pastedBulkJson, toast]);

  const handleCreateBulkShelves = useCallback(async () => {
    if (!parsedBulkPayload) return;
    try {
      const createdShelves = await onSubmitBulk(parsedBulkPayload);
      toast({
        title: "Bulk create completed",
        description: `Created ${createdShelves} shelves successfully.`,
        variant: "success",
      });
      onClose();
      reset();
    } catch (error) {
      toast({
        title: "Bulk create failed",
        description:
          error instanceof Error
            ? error.message
            : "Could not create fixtures/shelves from parsed JSON.",
        variant: "destructive",
      });
    }
  }, [onClose, onSubmitBulk, parsedBulkPayload, reset, toast]);

  const handleDownloadSampleJson = useCallback(() => {
    const blob = new Blob([BULK_SHELVES_SAMPLE_JSON], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bulk-shelves-sample.json";
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleLoadSampleJson = useCallback(() => {
    setBulkAddMode("paste");
    setPastedBulkJson(BULK_SHELVES_SAMPLE_JSON);
    setBulkFile(null);
    setParsedBulkPayload(null);
    setBulkAddStep("input");
  }, []);

  const handleBulkDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsBulkDragging(false);
      const file = event.dataTransfer.files?.[0] ?? null;
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".json")) {
        toast({
          title: "Invalid file type",
          description: "Only JSON files are supported.",
          variant: "warning",
        });
        return;
      }
      setBulkFile(file);
    },
    [toast],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        reset();
      }}
      className="max-w-3xl"
    >
      <div className="rounded-lg border border-border bg-card p-6 shadow-lg min-h-[520px] flex flex-col">
        <h3 className="text-base font-semibold text-foreground">Bulk Add Shelves</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload or paste JSON, then review before creating.
        </p>
        <div className="mt-4 inline-flex rounded-md border border-border bg-muted/30 p-1">
          <Button
            type="button"
            size="sm"
            variant={bulkAddMode === "file" ? "default" : "ghost"}
            onClick={() => {
              setBulkAddMode("file");
              setBulkAddStep("input");
              setParsedBulkPayload(null);
            }}
          >
            Upload JSON
          </Button>
          <Button
            type="button"
            size="sm"
            variant={bulkAddMode === "paste" ? "default" : "ghost"}
            onClick={() => {
              setBulkAddMode("paste");
              setBulkAddStep("input");
              setParsedBulkPayload(null);
            }}
          >
            Paste JSON
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleLoadSampleJson}>
            Upload sample JSON
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleDownloadSampleJson}>
            Download sample JSON
          </Button>
        </div>
        <input
          ref={bulkFileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleBulkFileChange}
        />
        <div className="mt-4 flex-1 min-h-0">
          {bulkAddStep === "input" ? (
            bulkAddMode === "file" ? (
              <>
                <div
                  className={`h-full min-h-[340px] rounded-lg border-2 border-dashed p-6 text-center transition-colors flex flex-col items-center justify-center ${
                    isBulkDragging ? "border-accent bg-accent/10" : "border-border bg-card"
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsBulkDragging(true);
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    setIsBulkDragging(false);
                  }}
                  onDrop={handleBulkDrop}
                >
                  <Upload className="mx-auto mb-2 size-6 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">Upload bulk shelves JSON</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Drag and drop a JSON file, then upload.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => bulkFileInputRef.current?.click()}
                  >
                    {bulkFile ? "Change File" : "Browse File"}
                  </Button>
                </div>
                {bulkFile ? (
                  <div className="mt-3 flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
                    <p className="truncate text-sm text-foreground">{bulkFile.name}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setBulkFile(null)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="h-full rounded-lg border border-border bg-muted/20 p-3">
                <textarea
                  value={pastedBulkJson}
                  onChange={(e) => setPastedBulkJson(e.target.value)}
                  placeholder="Paste JSON with fixtures and shelves"
                  className="h-[calc(100%-8px)] min-h-[300px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )
          ) : (
            <div className="h-full min-h-[340px] overflow-auto rounded-lg border border-border bg-muted/20 p-3">
              <p className="mb-3 text-sm text-muted-foreground">
                Previewing{" "}
                <span className="font-semibold text-foreground">
                  {parsedBulkPayload?.totalShelves ?? 0}
                </span>{" "}
                shelves from{" "}
                <span className="font-semibold text-foreground">
                  {parsedBulkPayload?.fixtures.length ?? 0}
                </span>{" "}
                fixtures
              </p>
              <div className="overflow-auto rounded-md border border-border bg-card">
                <table className="w-full min-w-[820px] text-sm">
                  <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Fixture</th>
                      <th className="px-3 py-2">Location</th>
                      <th className="px-3 py-2">Shelf Code</th>
                      <th className="px-3 py-2">Shelf Name</th>
                      <th className="px-3 py-2">Width</th>
                      <th className="px-3 py-2">Height</th>
                      <th className="px-3 py-2">Vertical Pos.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(parsedBulkPayload?.fixtures ?? []).flatMap((fixture) =>
                      fixture.shelves.map((shelf) => (
                        <tr
                          key={`${fixture.code}-${shelf.code}`}
                          className="border-t border-border text-foreground"
                        >
                          <td className="px-3 py-2">{fixture.code}</td>
                          <td className="px-3 py-2">
                            {fixture.physical_location.section} / {fixture.physical_location.aisle} /{" "}
                            {fixture.physical_location.zone}
                          </td>
                          <td className="px-3 py-2">{shelf.code}</td>
                          <td className="px-3 py-2">{shelf.name}</td>
                          <td className="px-3 py-2">{shelf.width}</td>
                          <td className="px-3 py-2">{shelf.height}</td>
                          <td className="px-3 py-2">{shelf.vertical_position}</td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <div className="mt-auto pt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onClose();
              reset();
            }}
          >
            Cancel
          </Button>
          {bulkAddStep === "preview" ? (
            <Button type="button" variant="outline" onClick={() => setBulkAddStep("input")}>
              Back
            </Button>
          ) : null}
          <Button
            type="button"
            variant="success"
            onClick={() => {
              if (bulkAddStep === "input") {
                void handleConfirmBulkAdd();
              } else {
                void handleCreateBulkShelves();
              }
            }}
          >
            {bulkAddStep === "input" ? "Preview" : "Create Shelves"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
