import { useMemo, useState } from "react";
import { Edit3, Plus, Trash2 } from "lucide-react";

import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateShelfTemplate,
  useDeleteShelfTemplate,
  useShelfTemplates,
  useUpdateShelfTemplate,
} from "@/queries/checker";
import type {
  ShelfTemplate,
  ShelfTemplateCreateInput,
  ShelfTemplateFixtureType,
} from "@/types/shelf-template";

const FIXTURE_OPTIONS: Array<{ value: ShelfTemplateFixtureType; label: string }> = [
  { value: "gondola", label: "Gondola" },
  { value: "wall_shelving", label: "Wall Shelving" },
  { value: "end_cap", label: "End Cap" },
  { value: "freezer", label: "Freezer" },
  { value: "cooler", label: "Cooler" },
];

function toNumberOr(value: string, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function ShelfTemplatesPage() {
  const { toast } = useToast();
  const { data: templates = [], isLoading } = useShelfTemplates();
  const createMutation = useCreateShelfTemplate();
  const updateMutation = useUpdateShelfTemplate();
  const deleteMutation = useDeleteShelfTemplate();

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<ShelfTemplate | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    fixtureType: "gondola" as ShelfTemplateFixtureType,
    zone: "",
    section: "",
    width: "1200",
    height: "1800",
    depth: "450",
  });

  const sortedTemplates = useMemo(() => {
    return [...templates].sort((a, b) => a.name.localeCompare(b.name));
  }, [templates]);

  const openCreate = () => {
    setMode("create");
    setEditing(null);
    setForm({
      name: "",
      description: "",
      fixtureType: "gondola",
      zone: "",
      section: "",
      width: "1200",
      height: "1800",
      depth: "450",
    });
    setModalOpen(true);
  };

  const openEdit = (tpl: ShelfTemplate) => {
    setMode("edit");
    setEditing(tpl);
    setForm({
      name: tpl.name,
      description: tpl.description ?? "",
      fixtureType: tpl.fixtureType,
      zone: tpl.zone ?? "",
      section: tpl.section ?? "",
      width: String(tpl.width),
      height: String(tpl.height),
      depth: String(tpl.depth),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (createMutation.isPending || updateMutation.isPending) return;
    setModalOpen(false);
  };

  const submit = async () => {
    const payload: ShelfTemplateCreateInput = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      fixtureType: form.fixtureType,
      zone: form.zone.trim() || undefined,
      section: form.section.trim() || undefined,
      width: toNumberOr(form.width, 1200),
      height: toNumberOr(form.height, 1800),
      depth: toNumberOr(form.depth, 450),
    };

    if (!payload.name) {
      toast({
        title: "Missing name",
        description: "Template name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(payload);
        toast({ title: "Template created", description: "Shelf template saved." });
      } else if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...payload });
        toast({ title: "Template updated", description: "Changes saved." });
      }
      setModalOpen(false);
    } catch (e) {
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const remove = async (tpl: ShelfTemplate) => {
    try {
      await deleteMutation.mutateAsync(tpl.id);
      toast({ title: "Template deleted", description: `"${tpl.name}" removed.` });
    } catch (e) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Shelf Templates"
          description="Create reusable shelf templates for this store."
        >
          <Button className="bg-chart-2 text-white hover:opacity-90" onClick={openCreate}>
            <Plus className="size-4" aria-hidden />
            New template
          </Button>
        </PageHeader>
      }
    >
      <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto w-full max-w-screen-2xl space-y-4">
          <Card className="border-border/60 bg-card/70 shadow-xl glassmorphism">
            <CardHeader>
              <CardTitle className="text-base">Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : sortedTemplates.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/20 px-6 py-8 text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    No templates yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Create a template to reuse fixture type and dimensions.
                  </p>
                  <Button className="mt-4" onClick={openCreate}>
                    <Plus className="size-4" aria-hidden />
                    Create template
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {sortedTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="rounded-xl border border-border bg-background/40 p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">{tpl.name}</p>
                          {tpl.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                              {tpl.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(tpl)}
                            aria-label={`Edit ${tpl.name}`}
                          >
                            <Edit3 className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => remove(tpl)}
                            aria-label={`Delete ${tpl.name}`}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fixture</span>
                          <span className="text-foreground font-medium">
                            {tpl.fixtureType.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dimensions</span>
                          <span className="text-foreground font-medium tabular-nums">
                            {tpl.width}×{tpl.height}×{tpl.depth}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Zone</span>
                          <span className="text-foreground">{tpl.zone ?? "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Section</span>
                          <span className="text-foreground">{tpl.section ?? "—"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} className="max-w-xl" showCloseButton>
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
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                className="bg-chart-2 text-white hover:opacity-90"
                onClick={submit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving…"
                  : "Save template"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}

