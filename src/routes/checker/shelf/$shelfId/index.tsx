import { createFileRoute, Link, useLocation, useParams } from "@tanstack/react-router";
import { ArrowLeft, Edit3, Play, Scan, Settings, Info, Save, X } from "lucide-react";
import { useState } from "react";

import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useShelf } from "@/queries/maker";
import { useStoreFixtureTypes } from "@/queries/checker";
import { cn } from "@/lib/utils";
import { EditableField } from "@/components/common";
import { useUpdateShelf } from "@/queries/maker/hooks/useUpdateShelf";
import { useToast } from "@/hooks/use-toast";

export const Route = createFileRoute("/checker/shelf/$shelfId/")({
  component: ShelfDetailPage,
});

export function ShelfDetailPage() {
  const params = useParams({ strict: false }) as {
    shelfId: string;
    storeId?: string;
  };
  const shelfId = params.shelfId;
  const storeId = params.storeId;
  
  const location = useLocation();
  const { toast } = useToast();
  const updateShelfMutation = useUpdateShelf();
  const { data: fixtureTypeLabels = [] } = useStoreFixtureTypes();

  const [isEditing, setIsEditing] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  const [shelfName, setShelfName] = useState<string>();
  const [shelfCode, setShelfCode] = useState<string>();
  const [aisle, setAisle] = useState<string>();
  const [bay, setBay] = useState<string>();
  const [zone, setZone] = useState<string>();
  const [section, setSection] = useState<string>();
  const [fixtureType, setFixtureType] = useState<string>();
  const [dimWidth, setDimWidth] = useState<string>();
  const [dimHeight, setDimHeight] = useState<string>();
  const [verticalPosition, setVerticalPosition] = useState<string>();

  const isAdmin = location.pathname.includes("/admin/");

  const backToShelvesPath =
    isAdmin && storeId ? `/admin/${storeId}/shelf/` : "/checker/shelf/";
  
  const { data: shelf, isLoading, error } = useShelf(shelfId);

  const backButton = (
    <Button variant="ghost" size="icon" className="shrink-0" asChild>
      <Link to={backToShelvesPath as never} aria-label="Back to shelves">
        <ArrowLeft className="size-4" aria-hidden />
      </Link>
    </Button>
  );

  if (isLoading) {
    return (
      <MainLayout>
        <div className="border-b border-border px-3 py-3 sm:px-4 lg:px-6">
          <div className="mx-auto flex max-w-screen-2xl items-center gap-2">
            {backButton}
            <Skeleton className="h-9 flex-1 max-w-md" />
          </div>
        </div>
        <div className="p-6 space-y-6">
          <Skeleton className="h-12 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !shelf) {
    return (
      <MainLayout>
        <div className="border-b border-border px-3 py-3 sm:px-4 lg:px-6">
          <div className="mx-auto flex max-w-screen-2xl items-center gap-2">
            {backButton}
            <span className="text-sm font-medium text-muted-foreground">Shelf detail</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
          <Info className="size-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Shelf not found</h2>
          <p className="text-muted-foreground mt-2">The shelf you're looking for doesn't exist or you don't have access.</p>
          <Button asChild className="mt-6 gap-2" variant="outline">
            <Link to={backToShelvesPath as never}>
              <ArrowLeft className="size-4" aria-hidden />
              Back to shelves
            </Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const effectiveShelfName = shelfName ?? shelf.shelfName;
  const effectiveShelfCode = shelfCode ?? shelf.shelfCode ?? "";
  const effectiveAisle =
    aisle ??
    shelf.aisleCode ??
    (shelf.aisleNumber != null ? `A${shelf.aisleNumber}` : "");
  const effectiveBay = bay ?? shelf.bayCode ?? (shelf.bayNumber != null ? String(shelf.bayNumber) : "");
  const effectiveZone = zone ?? shelf.zone ?? "";
  const effectiveSection = section ?? shelf.section ?? "";
  const effectiveFixtureType = fixtureType ?? shelf.fixtureType ?? "";
  const fixtureTypeOptions = (() => {
    const values = new Set<string>();
    const options: string[] = [];

    for (const label of fixtureTypeLabels) {
      const value = label.trim();
      if (!value || values.has(value.toLowerCase())) continue;
      values.add(value.toLowerCase());
      options.push(value);
    }

    const current = effectiveFixtureType.trim();
    if (current && !values.has(current.toLowerCase())) {
      options.unshift(current);
    }

    return options;
  })();
  const baseWidth = shelf.width != null ? String(shelf.width) : "";
  const baseHeight = shelf.height != null ? String(shelf.height) : "";
  const baseVerticalPosition =
    shelf.verticalPosition != null ? String(shelf.verticalPosition) : "0";

  const handleStartEditing = () => {
    setIsEditing(true);
    setShelfName(shelf.shelfName);
    setShelfCode(shelf.shelfCode);
    setAisle(
      shelf.aisleCode ?? (shelf.aisleNumber != null ? `A${shelf.aisleNumber}` : ""),
    );
    setBay(shelf.bayCode ?? (shelf.bayNumber != null ? String(shelf.bayNumber) : ""));
    setZone(shelf.zone ?? "");
    setSection(shelf.section ?? "");
    setFixtureType(shelf.fixtureType ?? "");
    const [w = "", h = ""] = (shelf.dimensions ?? "")
      .split("x")
      .map((v) => v?.trim() ?? "");
    setDimWidth(shelf.width != null ? String(shelf.width) : w);
    setDimHeight(shelf.height != null ? String(shelf.height) : h);
    setVerticalPosition(
      shelf.verticalPosition != null ? String(shelf.verticalPosition) : "0",
    );
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setShelfName(undefined);
    setShelfCode(undefined);
    setAisle(undefined);
    setBay(undefined);
    setZone(undefined);
    setSection(undefined);
    setFixtureType(undefined);
    setDimWidth(undefined);
    setDimHeight(undefined);
    setVerticalPosition(undefined);
  };

  const handleSave = async () => {
    const trimmedName = (shelfName ?? shelf.shelfName).trim();
    const rawCode = (shelfCode ?? shelf.shelfCode ?? "").trim();
    const trimmedAisleForCode = effectiveAisle.trim();
    const trimmedBayForCode = effectiveBay.trim();
    const derivedCode =
      trimmedAisleForCode && trimmedBayForCode
        ? `S${trimmedAisleForCode}-${trimmedBayForCode}`
        : rawCode;

    if (!trimmedName || !derivedCode) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Shelf name and code cannot be empty.",
      });
      return;
    }

    const w = (dimWidth ?? baseWidth).trim();
    const h = (dimHeight ?? baseHeight).trim();
    const vPos = (verticalPosition ?? baseVerticalPosition).trim();
    const numericWidth = Number(w);
    const numericHeight = Number(h);
    const numericVerticalPosition = Number(vPos);

    if (!Number.isFinite(numericWidth) || numericWidth <= 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Width must be a valid positive number.",
      });
      return;
    }
    if (!Number.isFinite(numericHeight) || numericHeight <= 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Height must be a valid positive number.",
      });
      return;
    }
    if (!Number.isFinite(numericVerticalPosition)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Vertical position must be a valid number.",
      });
      return;
    }

    try {
      setIsSavingDetails(true);

      await updateShelfMutation.mutateAsync({
        shelfId,
        payload: {
          name: trimmedName,
          code: derivedCode,
          width: numericWidth,
          height: numericHeight,
          vertical_position: numericVerticalPosition,
        },
      });

      toast({
        title: "Shelf updated",
        description: "Shelf details updated successfully.",
        variant: "success",
      });
      setIsEditing(false);
    } catch (updateError) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          updateError instanceof Error
            ? updateError.message
            : "Failed to update shelf details.",
      });
    } finally {
      setIsSavingDetails(false);
    }
  };

  return (
    <MainLayout
      pageHeader={
        <PageHeader
          leading={backButton}
          title={effectiveShelfName}
          description={`Shelf Id: ${effectiveShelfCode}`}
        >
          <div className="flex gap-2">
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={handleStartEditing}>
                <Edit3 className="size-4 mr-2" />
                Edit Details
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEditing}
                  disabled={isSavingDetails}
                >
                  <X className="size-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => {
                    void handleSave();
                  }}
                  disabled={isSavingDetails}
                >
                  <Save className="size-4 mr-1" />
                  {isSavingDetails ? "Saving..." : "Save"}
                </Button>
              </>
            )}
          </div>
        </PageHeader>
      }
    >
      <div className="p-6 space-y-8 w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center">
                  <div className="p-1.5 rounded-md bg-accent/20 text-accent mr-3">
                    <Scan className="size-4" />
                  </div>
                  Physical Location
                </CardTitle>
                <Badge variant="outline" className="font-mono text-[10px]">LOC</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Aisle
                  </p>
                  <EditableField
                    label=""
                    value={effectiveAisle}
                    isEditing={isEditing}
                    onChange={setAisle}
                    className="mt-1"
                  />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Bay
                  </p>
                  <EditableField
                    label=""
                    value={effectiveBay}
                    isEditing={isEditing}
                    onChange={setBay}
                    className="mt-1"
                  />
                </div>
                <div>
                  <EditableField
                    label="Zone"
                    value={effectiveZone}
                    isEditing={isEditing}
                    onChange={setZone}
                  />
                </div>
                <div>
                  <EditableField
                    label="Section"
                    value={effectiveSection}
                    isEditing={isEditing}
                    onChange={setSection}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center">
                  <div className="p-1.5 rounded-md bg-chart-1/20 text-chart-1 mr-3">
                    <Settings className="size-4" />
                  </div>
                  Fixture Details
                </CardTitle>
                <Badge variant="outline" className="font-mono text-[10px]">SPEC</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Type
                </p>
                {!isEditing ? (
                  <p className="text-sm font-semibold capitalize">
                    {effectiveFixtureType?.replace(/_/g, " ") || "Gondola"}
                  </p>
                ) : (
                  <Select
                    value={effectiveFixtureType}
                    onChange={(e) => setFixtureType(e.target.value)}
                    aria-label="Fixture Type"
                  >
                    <option value="">Choose...</option>
                    {fixtureTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                )}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Dimensions (WxH)
                </p>
                {!isEditing ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Width</p>
                      <p className="text-sm font-medium font-mono tabular-nums">{baseWidth || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Height</p>
                      <p className="text-sm font-medium font-mono tabular-nums">{baseHeight || "—"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Width"
                      value={dimWidth ?? baseWidth}
                      onChange={(e) => setDimWidth(e.target.value)}
                    />
                    <Input
                      placeholder="Height"
                      value={dimHeight ?? baseHeight}
                      onChange={(e) => setDimHeight(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Vertical Position
                </p>
                {!isEditing ? (
                  <p className="text-sm font-medium font-mono tabular-nums">
                    {baseVerticalPosition || "0"}
                  </p>
                ) : (
                  <Input
                    placeholder="Vertical Position"
                    type="number"
                    step="0.01"
                    value={verticalPosition ?? baseVerticalPosition}
                    onChange={(e) => setVerticalPosition(e.target.value)}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center">
                  <div className="p-1.5 rounded-md bg-chart-2/20 text-chart-2 mr-3">
                    <Play className="size-4" />
                  </div>
                  Current Status
                </CardTitle>
                <Badge variant="outline" className="font-mono text-[10px]">STATE</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Last Audit</p>
                <p className="text-sm font-medium">{shelf.lastAuditDate ? shelf.lastAuditDate.toLocaleDateString() : "Never Audited"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Compliance Score</p>
                {shelf.complianceScore != null ? (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          shelf.complianceScore >= 90 ? "bg-chart-2" : shelf.complianceScore >= 75 ? "bg-accent" : "bg-destructive"
                        )}
                        style={{ width: `${shelf.complianceScore}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold tabular-nums">{shelf.complianceScore}%</span>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-muted-foreground italic">No score available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </MainLayout>
  );
}
