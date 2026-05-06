import { useNavigate, useParams } from "@tanstack/react-router";
import { AlertCircle, Trash2 } from "lucide-react";
import { type ChangeEvent, useCallback, useEffect, useState } from "react";

import MainLayout from "@/components/layouts/main";
import { PlanogramJsonOverview } from "@/components/planogram/PlanogramJsonOverview";
import { PlanogramRenderedPreview } from "@/components/planogram/PlanogramRenderedPreview";
import { DetailBackButton } from "@/components/shared/DetailBackButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePlanogramSectionHref } from "@/hooks/planogram/usePlanogramSectionHref";
import { useToast } from "@/hooks/useToast";
import { parsePlanogramJsonText } from "@/lib/planogram/parsePlanogramJson";
import {
  useDeletePlanogram,
  usePlanogramById,
  useUpdatePlanogram,
} from "@/queries/maker";
import type { PlanogramPayload } from "@/types/planogram";

export function PlanogramDetailPage() {
  const { planogramId } = useParams({ strict: false }) as {
    planogramId: string;
  };
  const href = usePlanogramSectionHref();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, isLoading, error } = usePlanogramById(planogramId);
  const saveMutation = useUpdatePlanogram();
  const deleteMutation = useDeletePlanogram();

  const [editor, setEditor] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [draftPreview, setDraftPreview] = useState<PlanogramPayload | null>(
    null,
  );
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if (!data) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditor(JSON.stringify(data, null, 2));
    setDraftPreview(null);
    setParseError(null);
  }, [data]);

  const runParse = useCallback(() => {
    setParseError(null);
    try {
      setDraftPreview(parsePlanogramJsonText(editor));
    } catch (e) {
      setDraftPreview(null);
      setParseError(e instanceof Error ? e.message : "Invalid JSON.");
    }
  }, [editor]);

  const displayPayload = draftPreview ?? data ?? null;

  const handleSave = useCallback(async () => {
    let next: PlanogramPayload;
    try {
      next = parsePlanogramJsonText(editor);
      setParseError(null);
      setDraftPreview(next);
    } catch (e) {
      toast({
        title: "Fix JSON first",
        description:
          e instanceof Error
            ? e.message
            : "Parse errors must be resolved before saving.",
        variant: "destructive",
      });
      return;
    }
    try {
      await saveMutation.mutateAsync({ id: planogramId, payload: next });
      toast({ title: "Planogram updated", description: next.name });
      setDraftPreview(null);
      setEditor(JSON.stringify(next, null, 2));
    } catch (e) {
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [editor, planogramId, saveMutation, toast]);

  const handleDelete = useCallback(async () => {
    const ok = window.confirm("Remove this planogram from the library?");
    if (!ok) return;
    try {
      const removed = await deleteMutation.mutateAsync(planogramId);
      if (!removed) {
        toast({
          title: "Nothing to delete",
          description: "This planogram could not be deleted.",
        });
        return;
      }
      toast({
        title: "Removed",
        description: "The custom planogram was deleted.",
      });
      void navigate({ to: href.list as never });
    } catch (e) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [deleteMutation, href.list, navigate, planogramId, toast]);

  return (
    <MainLayout>
      <div className="bg-primary min-h-screen px-2 pt-2 pb-4 sm:px-2 sm:pt-3 sm:pb-4 lg:px-2 lg:pt-4 lg:pb-5">
        <div className="mx-auto max-w-screen-2xl space-y-4">
          <header className="flex flex-wrap items-center gap-4">
            <DetailBackButton to={href.list} />
            <div className="min-w-0 flex-1">
              <h1 className="text-foreground truncate text-2xl font-bold">
                {data?.name ?? "Planogram"}
              </h1>
              <p className="text-muted-foreground text-sm">
                View the full structure below, then update JSON and save when
                you are ready.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!isLoading && data ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowEditor((prev) => !prev)}
                >
                  {showEditor ? "Close" : "Edit"}
                </Button>
              ) : null}
              {!isLoading && data && showEditor ? (
                <>
                  <Button
                    type="button"
                    variant="success"
                    disabled={saveMutation.isPending}
                    onClick={() => void handleSave()}
                  >
                    {saveMutation.isPending ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={deleteMutation.isPending}
                    onClick={() => void handleDelete()}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    {deleteMutation.isPending ? "Deleting…" : "Delete"}
                  </Button>
                </>
              ) : null}
            </div>
          </header>

          {error ? (
            <p className="text-destructive text-sm">
              {error instanceof Error
                ? error.message
                : "Failed to load planogram."}
            </p>
          ) : null}

          <div className="space-y-6">
            {!isLoading && data && showEditor ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Update planogram</CardTitle>
                  <CardDescription>
                    Edit the JSON payload, parse to refresh the overview below,
                    then save. Delete removes only custom definitions for this
                    id.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="planogram-json-editor">
                      PlanogramPayload
                    </Label>
                    <Textarea
                      id="planogram-json-editor"
                      value={editor}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                        setEditor(e.target.value)
                      }
                      className="min-h-[280px] font-mono text-xs"
                      spellCheck={false}
                    />
                  </div>
                  {parseError ? (
                    <p className="text-destructive flex items-center gap-1.5 text-sm">
                      <AlertCircle className="size-4 shrink-0" aria-hidden />
                      {parseError}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={runParse}
                    >
                      Parse preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card className="border-border bg-card/80">
              <CardContent className="space-y-4 p-4">
                <PlanogramJsonOverview
                  payload={displayPayload}
                  isLoading={isLoading && !draftPreview}
                  emptyMessage="Planogram not found."
                  embedded
                />
                <PlanogramRenderedPreview
                  payload={displayPayload}
                  isLoading={isLoading && !draftPreview}
                  embedded
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
