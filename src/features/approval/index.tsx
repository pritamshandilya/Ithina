import { AlertTriangle, Loader2, Zap } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import PageHeader from "@/components/shared/page-header";
import LoadingSpinner from "@/components/shared/loading-spinner";
import {
  useInboxItems,
  usePayloadManifest,
  usePublishToFleet,
  useValidationChecks,
} from "@/hooks/use-approval";

import PayloadManifest from "./components/payload-manifest";
import TaskInbox from "./components/task-inbox";
import ValidationPanel from "./components/validation-panel";
import VisualDiffViewer from "./components/visual-diff-viewer";

export default function Approval() {
  const navigate = useNavigate();
  const [activeInbox, setActiveInbox] = useState(0);

  const { data: inbox = [], isLoading: inboxLoading, isError: inboxError } = useInboxItems();
  const { data: checks = [], isLoading: checksLoading } = useValidationChecks();
  const { data: rows = [], isLoading: rowsLoading } = usePayloadManifest();
  const publishMutation = usePublishToFleet();

  const isLoading = inboxLoading || checksLoading || rowsLoading;
  const hasError = inboxError;
  const activeItem = inbox[activeInbox];

  const handlePublish = useCallback(async () => {
    await publishMutation.mutateAsync();
    navigate({ to: "/fleet" });
  }, [publishMutation, navigate]);

  const approvalHeader = (
    <PageHeader
      breadcrumbs={[{ label: "Promotions Assistant" }, { label: "Approval Queue", isActive: true }]}
      title="Governance & Review"
    />
  );

  if (hasError) {
    return (
      <>
        {approvalHeader}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center" role="alert">
          <AlertTriangle className="size-10 text-rose-400" />
          <h3 className="text-sm font-semibold text-white">Failed to load approval queue</h3>
          <p className="text-xs text-slate-400">Please refresh the page and try again.</p>
        </div>
      </>
    );
  }

  return (
    <>
      {approvalHeader}

      {isLoading ? (
        <LoadingSpinner label="Loading approval queue..." className="flex-1" />
      ) : (
        <div className="flex flex-1 gap-6 overflow-hidden p-6 animate-[fadeIn_0.4s_ease-out] lg:p-8">
          <TaskInbox items={inbox} activeIndex={activeInbox} onSelect={setActiveInbox} />

          <section className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-xl">
            <header className="flex shrink-0 items-center justify-between border-b border-ithina-border bg-white/[0.01] px-8 py-5">
              <div>
                <h2 className="flex items-center gap-3 text-xl font-bold tracking-tight text-white">
                  {activeItem?.title ?? "Campaign"} Review
                  {activeItem?.urgent && (
                    <span className="rounded border border-rose-400/20 bg-rose-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-rose-400">
                      Expires 48H
                    </span>
                  )}
                </h2>
                <p className="mt-1 text-xs text-ithina-muted">
                  Review Agent validations and visual diff before broadcasting to hardware.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="rounded-lg border border-transparent px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-white/10 hover:bg-white/5 hover:text-white"
                  aria-label="Reject campaign"
                >
                  Reject
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishMutation.isPending}
                  aria-label="Approve and publish to hardware"
                  className="flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-900 px-6 py-2.5 text-sm font-bold text-emerald-400 transition-all hover:bg-emerald-800 disabled:opacity-50"
                  style={!publishMutation.isPending ? { boxShadow: "0 0 15px rgba(52,211,153,0.3)" } : undefined}
                >
                  {publishMutation.isPending ? (
                    <>
                      Rasterizing Images...
                      <Loader2 className="size-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      Approve & Publish to Hardware
                      <Zap className="size-4" />
                    </>
                  )}
                </button>
              </div>
            </header>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
              <ValidationPanel checks={checks} />
              <VisualDiffViewer />
              <PayloadManifest rows={rows} />
            </div>
          </section>
        </div>
      )}
    </>
  );
}
