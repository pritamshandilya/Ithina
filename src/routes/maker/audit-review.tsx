import { createFileRoute } from "@tanstack/react-router";

import MainLayout from "@/components/layouts/main";
import { AuditReviewQueue } from "@/components/maker";

export const Route = createFileRoute("/maker/audit-review")({
  component: MakerAuditReviewPage,
});

function MakerAuditReviewPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Audit Review</h1>
            <p className="text-muted-foreground">
              Manage your draft audits and correct returned submissions.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm p-6">
            <AuditReviewQueue 
              onAction={(id, action) => {
                // In a real app, this would navigate or trigger logic
                console.log(`${action} clicked for audit ${id}`);
              }}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
