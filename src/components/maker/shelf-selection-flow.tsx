import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Plus, ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useShelves } from "@/queries/maker";
import { cn } from "@/lib/utils";
import type { Shelf } from "@/types/maker";

interface ShelfSelectionFlowProps {
  onShelfSelect: (shelf: Shelf) => void;
  onShelfCreate?: (shelfData: Omit<Shelf, "id" | "status" | "assignedTo">) => void;
  /** When true, hides the internal heading (use when page header provides context) */
  compact?: boolean;
  /** When false, only allows selecting existing shelves (no create option). Requires onShelfCreate to be omitted. */
  allowCreate?: boolean;
}

export function ShelfSelectionFlow({
  onShelfSelect,
  onShelfCreate,
  compact = false,
  allowCreate = true,
}: ShelfSelectionFlowProps) {
  const [activeTab, setActiveTab] = useState<"select" | "create">("select");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: shelves, isLoading } = useShelves();

  // Create Mode State
  const [formData, setFormData] = useState({
    aisleCode: "",
    bayCode: "",
    shelfName: "",
    description: "",
  });

  const filteredShelves = useMemo(() => {
    if (!shelves) return [];
    if (!searchQuery) return shelves;

    const lowerQuery = searchQuery.toLowerCase();
    return shelves.filter(
      (shelf) =>
        shelf.shelfName.toLowerCase().includes(lowerQuery) ||
        `aisle ${shelf.aisleCode ?? (shelf.aisleNumber != null ? `A${shelf.aisleNumber}` : "")}`
          .toLowerCase()
          .includes(lowerQuery) ||
        `bay ${shelf.bayCode ?? (shelf.bayNumber != null ? String(shelf.bayNumber) : "")}`
          .toLowerCase()
          .includes(lowerQuery) ||
        `${shelf.aisleCode ?? shelf.aisleNumber ?? ""}-${shelf.bayCode ?? shelf.bayNumber ?? ""}`.includes(lowerQuery)
    );
  }, [shelves, searchQuery]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onShelfCreate?.({
      aisleCode: formData.aisleCode,
      bayCode: formData.bayCode,
      shelfName: formData.shelfName,
      description: formData.description,
    });
  };

  const isFormValid =
    formData.aisleCode && formData.bayCode && formData.shelfName;

  return (
    <div className="space-y-6">
      {!compact && (
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            Which shelf are you auditing?
          </h2>
          <p className="text-muted-foreground">
            {allowCreate
              ? "Select an existing shelf or create a new one if it's not listed."
              : "Select a shelf to begin your audit."}
          </p>
        </div>
      )}

      {/* Tabs - only when allowCreate */}
      {allowCreate && (
        <div
          className={cn(
            "flex rounded-lg border border-border p-0.5 bg-card max-w-sm",
            compact && "mx-auto"
          )}
          role="tablist"
          aria-label="Shelf selection mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "select"}
            onClick={() => setActiveTab("select")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              activeTab === "select"
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
            )}
          >
            <Search className="size-4" />
            Select Existing
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "create"}
            onClick={() => setActiveTab("create")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              activeTab === "create"
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
            )}
          >
            <Plus className="size-4" />
            Create New
          </button>
        </div>
      )}

      {(activeTab === "select" || !allowCreate) ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by aisle, bay or shelf name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-card/50"
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 scrollbar-thin">
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading shelves...
              </div>
            ) : filteredShelves.length > 0 ? (
              filteredShelves.map((shelf) => (
                <button
                  key={shelf.id}
                  onClick={() => onShelfSelect(shelf)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-card/50 hover:bg-accent hover:border-accent transition-all group"
                >
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-accent">
                        Aisle{" "}
                        {shelf.aisleCode ??
                          (shelf.aisleNumber != null ? `A${shelf.aisleNumber}` : "—")}
                      </span>
                      <span className="size-1 rounded-full bg-muted-foreground/30" />
                      <span className="text-xs font-bold uppercase tracking-wider text-accent">
                        Bay {shelf.bayCode ?? (shelf.bayNumber != null ? shelf.bayNumber : "—")}
                      </span>
                    </div>
                    <h4 className="font-semibold text-card-foreground mt-0.5">
                      {shelf.shelfName}
                    </h4>
                  </div>
                  <ArrowRight className="size-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </button>
              ))
            ) : (
              <div className="py-12 text-center space-y-3">
                <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto text-muted-foreground">
                  <Search className="size-6" />
                </div>
                <div>
                  <p className="text-foreground font-medium">No shelves found</p>
                  <p className="text-sm text-muted-foreground">
                    {allowCreate
                      ? "Try searching for something else or create a new shelf."
                      : "Create shelves from the Shelves page to get started."}
                  </p>
                </div>
                {allowCreate ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("create")}
                    className="mt-2"
                  >
                    Create New Shelf
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" asChild className="mt-2">
                    <Link to="/maker/audits/planogram">Go to Planogram Audits</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : allowCreate ? (
        <form
          onSubmit={handleCreateSubmit}
          className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aisleCode">Aisle Code</Label>
              <Input
                id="aisleCode"
                type="text"
                placeholder="e.g. A2"
                value={formData.aisleCode}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, aisleCode: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bayCode">Bay Code</Label>
              <Input
                id="bayCode"
                type="text"
                placeholder="e.g. 01"
                value={formData.bayCode}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bayCode: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shelfName">Shelf Name</Label>
            <Input
              id="shelfName"
              placeholder="e.g. Beverages - Soft Drinks"
              value={formData.shelfName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, shelfName: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <textarea
              id="description"
              rows={3}
              placeholder="Brief description of products on this shelf..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={!isFormValid}
          >
            Create Shelf & Continue
            <Check className="ml-2 size-5" />
          </Button>
        </form>
      ) : null}
    </div>
  );
}
