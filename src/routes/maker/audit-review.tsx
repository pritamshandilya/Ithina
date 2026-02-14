import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import MainLayout from "@/components/layouts/main";
import { AuditReviewQueue, HeaderContextBar } from "@/components/maker";
import { Button } from "@/components/ui/button";
import { useStores } from "@/features/maker/hooks";
import { mockUser } from "@/lib/api/mock-data";

export const Route = createFileRoute("/maker/audit-review")({
  component: MakerAuditReviewPage,
});

function MakerAuditReviewPage() {
  const navigate = useNavigate();
  const { data: stores } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState(() => mockUser.storeId);

  const handleAction = (auditId: string, action: "resume" | "fix") => {
    if (action === "resume") {
      navigate({ to: "/maker/audit/new" });
    } else {
      navigate({ to: "/maker/dashboard", hash: "my-audits-heading" });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <HeaderContextBar
            stores={stores ?? []}
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
          />

          {/* Header Bar with Start New Audit CTA */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-card p-4 shadow-sm">
            <header className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">My Audits</h1>
              <p className="text-sm text-muted-foreground">
                Manage your draft audits and correct returned submissions.
              </p>
            </header>

            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto shrink-0">
              <Link to="/maker/audit/new">
                <Plus className="size-4 mr-2" />
                Start New Shelf Audit
              </Link>
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-card shadow-sm p-6">
            <AuditReviewQueue onAction={handleAction} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
