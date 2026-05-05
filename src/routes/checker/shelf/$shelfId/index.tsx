import {
  Link,
  createFileRoute,
  useLocation,
  useParams,
} from "@tanstack/react-router";
import {
  ArrowLeft,
  Edit3,
  Info,
  Play,
  Save,
  Scan,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";

import { EditableField } from "@/components/common";
import MainLayout from "@/components/layouts/main";
import { DetailBackButton } from "@/components/shared/detail-back-button";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useStoreFixtureTypes } from "@/queries/checker";
import { useShelf } from "@/queries/maker";
import { useUpdateShelf } from "@/queries/maker/hooks/useUpdateShelf";

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
    <DetailBackButton to={backToShelvesPath} aria-label="Back to shelves" />
  );

  if (isLoading) {
    return (
      <MainLayout>
        <div className="border-border border-b px-3 py-3 sm:px-4 lg:px-6">
          <div className="mx-auto flex max-w-screen-2xl items-center gap-2">
            {backButton}
            <Skeleton className="h-9 max-w-md flex-1" />
          </div>
        </div>
        <div className="space-y-6 p-6">
          <Skeleton className="h-12 w-1/3" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
        <div className="border-border border-b px-3 py-3 sm:px-4 lg:px-6">
          <div className="mx-auto flex max-w-screen-2xl items-center gap-2">
            {backButton}
            <span className="text-muted-foreground text-sm font-medium">
              Shelf detail
            </span>
          </div>
        </div>
        <div className="flex h-[60vh] flex-col items-center justify-center p-12 text-center">
          <Info className="text-muted-foreground mb-4 size-12" />
          <h2 className="text-xl font-semibold">Shelf not found</h2>
          <p className="text-muted-foreground mt-2">
            The shelf you're looking for doesn't exist or you don't have access.
          </p>
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
  const effectiveBay =
    bay ??
    shelf.bayCode ??
    (shelf.bayNumber != null ? String(shelf.bayNumber) : "");
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
      shelf.aisleCode ??
        (shelf.aisleNumber != null ? `A${shelf.aisleNumber}` : ""),
    );
    setBay(
      shelf.bayCode ?? (shelf.bayNumber != null ? String(shelf.bayNumber) : ""),
    );
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
                <Edit3 className="mr-2 size-4" />
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
                  <X className="mr-1 size-4" />
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
                  <Save className="mr-1 size-4" />
                  {isSavingDetails ? "Saving..." : "Save"}
                </Button>
              </>
            )}
          </div>
        </PageHeader>
      }
    >
      <div className="mx-auto w-full space-y-8 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-sm font-medium">
                  <div className="bg-accent/20 text-accent mr-3 rounded-md p-1.5">
                    <Scan className="size-4" />
                  </div>
                  Physical Location
                </CardTitle>
                <Badge variant="outline" className="font-mono text-[10px]">
                  LOC
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
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
                  <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
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
                <CardTitle className="flex items-center text-sm font-medium">
                  <div className="bg-chart-1/20 text-chart-1 mr-3 rounded-md p-1.5">
                    <Settings className="size-4" />
                  </div>
                  Fixture Details
                </CardTitle>
                <Badge variant="outline" className="font-mono text-[10px]">
                  SPEC
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
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
                <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                  Dimensions (WxH)
                </p>
                {!isEditing ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                        Width
                      </p>
                      <p className="font-mono text-sm font-medium tabular-nums">
                        {baseWidth || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                        Height
                      </p>
                      <p className="font-mono text-sm font-medium tabular-nums">
                        {baseHeight || "—"}
                      </p>
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
                <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                  Vertical Position
                </p>
                {!isEditing ? (
                  <p className="font-mono text-sm font-medium tabular-nums">
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
                <CardTitle className="flex items-center text-sm font-medium">
                  <div className="bg-chart-2/20 text-chart-2 mr-3 rounded-md p-1.5">
                    <Play className="size-4" />
                  </div>
                  Current Status
                </CardTitle>
                <Badge variant="outline" className="font-mono text-[10px]">
                  STATE
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                  Last Audit
                </p>
                <p className="text-sm font-medium">
                  {shelf.lastAuditDate
                    ? shelf.lastAuditDate.toLocaleDateString()
                    : "Never Audited"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                  Compliance Score
                </p>
                {shelf.complianceScore != null ? (
                  <div className="mt-1 flex items-center gap-2">
                    <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          shelf.complianceScore >= 90
                            ? "bg-chart-2"
                            : shelf.complianceScore >= 75
                              ? "bg-accent"
                              : "bg-destructive",
                        )}
                        style={{ width: `${shelf.complianceScore}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold tabular-nums">
                      {shelf.complianceScore}%
                    </span>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm font-medium italic">
                    No score available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
