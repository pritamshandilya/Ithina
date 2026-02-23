import { createFileRoute, useNavigate } from "@tanstack/react-router";

import MainLayout from "@/components/layouts/main";
import { ManualOverrideList, type ApprovalAction } from "@/components/maker";

export const Route = createFileRoute("/maker/manual-audits")({
  component: MakerManualAuditsPage,
});

function MakerManualAuditsPage() {
  const navigate = useNavigate();

  const handleAction = (_auditId: string, shelfId: string, action: ApprovalAction, mode?: string) => {
    const isPlanogram = mode === "planogram-based" || mode === "vision-edge";

    if (action === "fix") {
      if (isPlanogram) {
        navigate({ to: "/maker/audits/planogram/run/$shelfId", params: { shelfId } });
      } else {
        navigate({ to: "/maker/audits/adhoc/new" });
      }
    } else if (action === "view-report" || action === "view-details") {
      if (isPlanogram) {
        navigate({ to: "/maker/audits/planogram/$shelfId", params: { shelfId } });
      } else {
        navigate({ to: "/maker/audits/adhoc" });
      }
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto max-w-screen-2xl space-y-4">

          {/* Header Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-card p-4 shadow-sm">
            <header className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">Approvals</h1>
              <p className="text-sm text-muted-foreground">
                Track the approval status of your submitted audits
              </p>
            </header>
          </div>

          <div className="rounded-lg border border-border bg-card shadow-sm p-6">
            <ManualOverrideList onAction={handleAction} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
