import { createFileRoute } from "@tanstack/react-router";
import { AuditReviewQueue } from "@/components/maker";
import MainLayout from "@/components/layouts/main";

export const Route = createFileRoute("/test-maker-audit-queue")({
  component: TestMakerAuditQueue,
});

function TestMakerAuditQueue() {
  return (
    <MainLayout>
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Audit Review Queue (Maker)</h1>
          <p className="text-muted-foreground mt-2">
            Combined view of drafts and returned audits requiring attention.
          </p>
        </div>
        
        <div className="rounded-xl border border-border bg-card/50 p-6 shadow-sm">
          <AuditReviewQueue 
            onAction={(id, action) => {
              console.log(`${action} clicked for audit ${id}`);
              alert(`Action: ${action}\nAudit ID: ${id}`);
            }}
          />
        </div>
      </div>
    </div>
    </MainLayout>
  );
}
