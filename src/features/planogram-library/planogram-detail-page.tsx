import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, type ChangeEvent } from "react";

import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/page-header";
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
import { PlanogramJsonOverview } from "@/features/planogram-library/planogram-json-overview";
import { usePlanogramSectionHref } from "@/features/planogram-library/use-planogram-section-href";
import { useToast } from "@/hooks/use-toast";
import { parsePlanogramJsonText } from "@/lib/planogram/parse-planogram-json";
import { useDeletePlanogram, usePlanogramById, useUpdatePlanogram } from "@/queries/maker";
import type { PlanogramPayload } from "@/types/planogram";

export function PlanogramDetailPage() {
  const { planogramId } = useParams({ strict: false }) as { planogramId: string };
  const href = usePlanogramSectionHref();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, isLoading, error } = usePlanogramById(planogramId);
  const saveMutation = useUpdatePlanogram();
  const deleteMutation = useDeletePlanogram();

  const [editor, setEditor] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [draftPreview, setDraftPreview] = useState<PlanogramPayload | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if (!data) return;
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
        description: e instanceof Error ? e.message : "Parse errors must be resolved before saving.",
        variant: "destructive",
      });
      return;
    }
    try {
      await saveMutation.mutateAsync({ id: planogramId, payload: next });
      toast({ title: "Planogram updated", description: next.planogram.name });
      setDraftPreview(null);
      setEditor(JSON.stringify(next, null, 2));
    } catch (e) {
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [editor, saveMutation, toast]);

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
      toast({ title: "Removed", description: "The custom planogram was deleted." });
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
    <MainLayout
      pageHeader={
        <PageHeader
          title={data?.planogram.name ?? "Planogram"}
          description="View the full structure below, then update JSON and save when you are ready."
        />
      }
    >
      <div className="mx-auto max-w-screen-2xl space-y-4 px-2 pb-6 pt-2 sm:px-3 lg:px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={href.list as never}>
              <ArrowLeft className="size-4" aria-hidden />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            {!isLoading && data ? (
              <Button type="button" variant="secondary" onClick={() => setShowEditor((prev) => !prev)}>
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
        </div>

        {error ? (
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load planogram."}
          </p>
        ) : null}

        <div className="space-y-6">
          {!isLoading && data && showEditor ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Update planogram</CardTitle>
                <CardDescription>
                  Edit the JSON payload, parse to refresh the overview below, then save. Delete removes only custom
                  definitions for this id.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="planogram-json-editor">PlanogramPayload</Label>
                  <Textarea
                    id="planogram-json-editor"
                    value={editor}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditor(e.target.value)}
                    className="min-h-[280px] font-mono text-xs"
                    spellCheck={false}
                  />
                </div>
                {parseError ? (
                  <p className="flex items-center gap-1.5 text-sm text-destructive">
                    <AlertCircle className="size-4 shrink-0" aria-hidden />
                    {parseError}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={runParse}>
                    Parse preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <PlanogramJsonOverview
            payload={displayPayload}
            isLoading={isLoading && !draftPreview}
            emptyMessage="Planogram not found."
          />
        </div>
      </div>
    </MainLayout>
  );
}
