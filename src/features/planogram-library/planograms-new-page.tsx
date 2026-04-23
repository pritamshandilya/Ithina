import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Download, FileUp, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";

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
import planogramSampleRaw from "@/lib/constants/planogram.json?raw";
import { parsePlanogramJsonText } from "@/lib/planogram/parse-planogram-json";
import { useCreatePlanogram } from "@/queries/maker";
import type { PlanogramPayload } from "@/types/planogram";

function downloadTextFile(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function PlanogramsNewPage() {
  const href = usePlanogramSectionHref();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rawJson, setRawJson] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PlanogramPayload | null>(null);
  const saveMutation = useCreatePlanogram();

  const runParse = useCallback(() => {
    setParseError(null);
    if (!rawJson.trim()) {
      setPreview(null);
      return;
    }
    try {
      setPreview(parsePlanogramJsonText(rawJson));
    } catch (e) {
      setPreview(null);
      setParseError(e instanceof Error ? e.message : "Could not parse planogram JSON.");
    }
  }, [rawJson]);

  useEffect(() => {
    if (!rawJson.trim()) {
      setPreview(null);
      setParseError(null);
      return;
    }

    const timer = setTimeout(() => {
      try {
        setPreview(parsePlanogramJsonText(rawJson));
        setParseError(null);
      } catch (e) {
        setPreview(null);
        setParseError(e instanceof Error ? e.message : "Could not parse planogram JSON.");
      }
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [rawJson]);

  const onFile = useCallback((file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setRawJson(text);
      setParseError(null);
      try {
        setPreview(parsePlanogramJsonText(text));
      } catch (e) {
        setPreview(null);
        setParseError(e instanceof Error ? e.message : "Could not parse planogram JSON.");
      }
    };
    reader.readAsText(file);
  }, []);

  const loadSample = useCallback(() => {
    setRawJson(planogramSampleRaw);
    setParseError(null);
    try {
      setPreview(parsePlanogramJsonText(planogramSampleRaw));
    } catch (e) {
      setPreview(null);
      setParseError(e instanceof Error ? e.message : "Could not parse sample JSON.");
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!preview) {
      toast({
        title: "Nothing to save",
        description: "Parse valid JSON first, then save to the library.",
        variant: "destructive",
      });
      return;
    }
    try {
      await saveMutation.mutateAsync(preview);
      toast({ title: "Planogram saved", description: `${preview.name} is now in your library.` });
      void navigate({ to: href.list as never });
    } catch (e) {
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [href, preview, saveMutation, navigate, toast]);

  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Add planogram"
          description="Import JSON from a file, paste from the clipboard, or start from the bundled sample."
        />
      }
    >
      <div className="mx-auto max-w-screen-2xl space-y-4 px-2 pb-6 pt-2 sm:px-3 lg:px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={href.list as never}>
              <ArrowLeft className="size-4" aria-hidden />
              <span className="sr-only">Back to planograms</span>
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Import JSON</CardTitle>
                <CardDescription>
                  The file should follow the planogram schema (see bundled sample). Parsing normalizes missing fields.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  className="sr-only"
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
                    <FileUp className="size-4" aria-hidden />
                    Upload JSON
                  </Button>
                  <Button type="button" variant="secondary" onClick={loadSample}>
                    <Sparkles className="size-4" aria-hidden />
                    Load sample JSON
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => downloadTextFile("planogram-sample.json", planogramSampleRaw)}
                  >
                    <Download className="size-4" aria-hidden />
                    Download sample
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planogram-json-paste">Paste JSON</Label>
                  <Textarea
                    id="planogram-json-paste"
                    value={rawJson}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setRawJson(e.target.value)}
                    placeholder='{ "name": "...", "fixture": { "width": 1200, "height": 2000, "depth": 400 }, "shelves": [...] }'
                    className="min-h-[220px] font-mono text-xs"
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
                    Parse &amp; refresh preview
                  </Button>
                  <Button
                    type="button"
                    variant="success"
                    disabled={!preview || saveMutation.isPending}
                    onClick={() => void handleSave()}
                  >
                    {saveMutation.isPending ? "Saving…" : "Save to library"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <PlanogramJsonOverview
            payload={preview}
            emptyMessage="Upload, paste, or load the sample JSON, then parse to see a detailed overview."
          />
        </div>
      </div>
    </MainLayout>
  );
}
