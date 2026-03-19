import { useMemo, useState } from "react";
import { Edit3, Plus, Trash2 } from "lucide-react";

import { ShelfTemplateModal } from "@/components/common/shelf-template-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/types/shelf-template";
import type { ShelfTemplateModalValues } from "@/components/common/shelf-template-modal";

function toNumberOr(value: string, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

interface ShelfTemplatesContentProps {
  showHeaderCard?: boolean;
}

export function ShelfTemplatesContent({ showHeaderCard = true }: ShelfTemplatesContentProps) {
  const { toast } = useToast();
  const { data: templates = [], isLoading } = useShelfTemplates();
  const createMutation = useCreateShelfTemplate();
  const updateMutation = useUpdateShelfTemplate();
  const deleteMutation = useDeleteShelfTemplate();

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<ShelfTemplate | null>(null);

  const [form, setForm] = useState<ShelfTemplateModalValues>({
    name: "",
    description: "",
    fixtureType: "gondola",
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

  const submit = async (values: ShelfTemplateModalValues) => {
    const payload: ShelfTemplateCreateInput = {
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      fixtureType: values.fixtureType,
      zone: values.zone.trim() || undefined,
      section: values.section.trim() || undefined,
      width: toNumberOr(values.width, 1200),
      height: toNumberOr(values.height, 1800),
      depth: toNumberOr(values.depth, 450),
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

  const card = (
    <Card className="border-border/60 bg-card/70 shadow-xl glassmorphism">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Templates</CardTitle>
        <Button className="bg-chart-2 text-white hover:opacity-90" onClick={openCreate}>
          <Plus className="size-4" aria-hidden />
          New template
        </Button>
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
                      {tpl.width}x{tpl.height}x{tpl.depth}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Zone</span>
                    <span className="text-foreground">{tpl.zone ?? "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Section</span>
                    <span className="text-foreground">{tpl.section ?? "-"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      {showHeaderCard ? <div className="space-y-4">{card}</div> : card}
      <ShelfTemplateModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={submit}
        isSaving={createMutation.isPending || updateMutation.isPending}
        mode={mode}
        initialValues={form}
      />
    </>
  );
}

