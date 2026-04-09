import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLocation, useParams } from "@tanstack/react-router";
import { CheckerShelfListPage } from "@/features/shelf/CheckerShelfListPage";
import {
  ShelvesPageTabs,
  type ShelvesPageTabId,
} from "@/features/shelf/shelves-page-tabs";
import { ShelfTemplatesContent } from "@/features/shelf/ShelfTemplatesContent";
import { useStore } from "@/providers/store";
import { Modal } from "@/components/ui/modal";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useShelfTemplates } from "@/queries/checker";

export const Route = createFileRoute("/checker/shelf/")({
  component: PlanogramAnalysisPage,
  meta: {
    layoutMode: "stickyTable",
  },
});

function getOptionalStoreId(params: unknown): string | undefined {
  if (!params || typeof params !== "object") return undefined;
  const { storeId } = params as { storeId?: unknown };
  return typeof storeId === "string" ? storeId : undefined;
}

function asRouterPath(path: string): never {
  return path as never;
}

function asRouterParams(params: Record<string, string | undefined>): never {
  return params as never;
}

export function PlanogramAnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams({ strict: false });
  const { selectedStore } = useStore();
  const [activeTab, setActiveTab] = useState<ShelvesPageTabId>("shelves");
  const [isAddShelfModalOpen, setIsAddShelfModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<"manual" | "template">("manual");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const isAdmin = location.pathname.includes("/admin/");
  const storeId =
    getOptionalStoreId(params) ?? (isAdmin ? selectedStore?.id : undefined);

  const shelfDetailPath = isAdmin
    ? "/admin/$storeId/shelf/$shelfId"
    : "/checker/shelf/$shelfId";
  const shelfNewPath = isAdmin
    ? "/admin/$storeId/shelf/new"
    : "/checker/shelf/new";
  const adhocNewPath = "/admin/$storeId/audits/adhoc/new";
  const pogNewPath = "/admin/$storeId/audits/planogram/new";
  const checkerAdhocNewPath = "/checker/audits/adhoc/new";
  const checkerPogNewPath = "/checker/audits/planogram/new";

  const pageDescription =
    activeTab === "shelves"
      ? "Manage and monitor store shelf compliance."
      : "Preset fixture layouts and dimensions—same templates as in Store Defaults.";
  const { data: shelfTemplates = [], isLoading: shelfTemplatesLoading } =
    useShelfTemplates();
  const canContinueAddShelf =
    addMode === "manual" || (addMode === "template" && !!selectedTemplateId);

  const handleContinueAddShelf = () => {
    if (!canContinueAddShelf) return;
    navigate({
      to: asRouterPath(shelfNewPath),
      params: asRouterParams({ storeId }),
      search:
        addMode === "template"
          ? ({ addMode: "template", templateId: selectedTemplateId } as never)
          : ({ addMode: "manual" } as never),
    });
    setIsAddShelfModalOpen(false);
  };

  return (
    <MainLayout
      pageHeader={
        <PageHeader title="Shelves" description={pageDescription}>
          {activeTab === "shelves" ? (
            <Button
              variant="success"
              className="shrink-0"
              onClick={() => setIsAddShelfModalOpen(true)}
            >
              <Plus className="size-4" aria-hidden />
              Add Shelf
            </Button>
          ) : null}
        </PageHeader>
      }
    >
      <div className="mx-auto max-w-screen-2xl px-2 pb-10 pt-4 sm:px-4">
        <ShelvesPageTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          shelvesPanel={
            <CheckerShelfListPage
              shelfDetailPath={shelfDetailPath}
              adhocNewPath={isAdmin ? adhocNewPath : checkerAdhocNewPath}
              pogNewPath={isAdmin ? pogNewPath : checkerPogNewPath}
            />
          }
          templatesPanel={<ShelfTemplatesContent showHeaderCard />}
        />
      </div>
      <Modal
        isOpen={isAddShelfModalOpen}
        onClose={() => setIsAddShelfModalOpen(false)}
        className="max-w-lg"
        showCloseButton
      >
        <div className="rounded-xl border border-border bg-card p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-foreground">How would you like to add a shelf?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
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
              <p className="font-medium text-foreground">Manual</p>
              <p className="text-xs text-muted-foreground">
                Enter shelf details and fixture values manually.
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
              <p className="font-medium text-foreground">Use Template</p>
              <p className="text-xs text-muted-foreground">
                Pre-fill shelf fields from a saved shelf template.
              </p>
            </button>
          </div>

          {addMode === "template" ? (
            <div className="mt-4 space-y-2">
              <Label htmlFor="add-shelf-template">Shelf template</Label>
              {shelfTemplatesLoading ? (
                <div className="h-9 w-full animate-pulse rounded-md bg-muted/50" />
              ) : (
                <Select
                  id="add-shelf-template"
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
              {!shelfTemplatesLoading && shelfTemplates.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No templates found. Create one in the Shelf Templates tab first.
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddShelfModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleContinueAddShelf}
              disabled={!canContinueAddShelf}
            >
              Continue
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}
