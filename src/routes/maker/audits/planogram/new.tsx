import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import MainLayout from "@/components/layouts/main";
import { HeaderContextBar } from "@/components/maker";
import { Button } from "@/components/ui/button";
import { useStores } from "@/features/maker/hooks";
import { mockUser } from "@/lib/api/mock-data";

export const Route = createFileRoute("/maker/audits/planogram/new")({
  component: AddPlanogramPage,
});

function AddPlanogramPage() {
  const { data: stores } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState(() => mockUser.storeId);

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <HeaderContextBar
            stores={stores ?? []}
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
          />

          <header className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/maker/audits/planogram">
                <ArrowLeft className="size-4" aria-hidden />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Add Planogram</h1>
              <p className="text-sm text-muted-foreground">
                Select a planogram from your provider, customize the arrangement, and save.
              </p>
            </div>
          </header>

          <div className="rounded-xl border border-border bg-card/80 p-8 text-center">
            <p className="text-muted-foreground">
              Planogram selection and visual builder coming in next milestones.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
