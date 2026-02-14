import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import MainLayout from "@/components/layouts/main";
import { AuditReviewQueue, HeaderContextBar } from "@/components/maker";
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

          <header className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">My Audits</h1>
            <p className="text-sm text-muted-foreground">
              Manage your draft audits and correct returned submissions.
            </p>
          </header>

          <div className="rounded-lg border border-border bg-card shadow-sm p-6">
            <AuditReviewQueue onAction={handleAction} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
