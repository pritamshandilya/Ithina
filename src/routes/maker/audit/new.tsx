import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import MainLayout from "@/components/layouts/main";
import { AuditModeSelector, HeaderContextBar, ShelfSelectionFlow } from "@/components/maker";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useStores } from "@/features/maker/hooks";
import { mockUser } from "@/lib/api/mock-data";
import { cn } from "@/lib/utils";
import type { AuditMode, Shelf } from "@/types/maker";

export const Route = createFileRoute("/maker/audit/new")({
  component: AuditCreationPage,
});

type AuditStep = "shelf-selection" | "mode-selection";

function AuditCreationPage() {
  const navigate = useNavigate();
  const { data: stores } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState(() => mockUser.storeId);
  const [step, setStep] = useState<AuditStep>("shelf-selection");
  const [selectedShelf, setSelectedShelf] = useState<Shelf | null>(null);
  const [comingSoonModalOpen, setComingSoonModalOpen] = useState(false);

  const handleShelfSelect = (shelf: Shelf) => {
    setSelectedShelf(shelf);
    setStep("mode-selection");
  };

  const handleModeSelect = (_mode: AuditMode) => {
    setComingSoonModalOpen(true);
  };

  const handleGoBack = () => {
    if (step === "mode-selection") {
      setStep("shelf-selection");
    } else {
      navigate({ to: "/maker/audits/planogram" });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <HeaderContextBar
            stores={stores ?? []}
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
          />

          {/* Header Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="shrink-0 text-muted-foreground hover:text-foreground"
                aria-label={step === "mode-selection" ? "Back to shelf selection" : "Back to My Audits"}
              >
                <ArrowLeft className="size-4 mr-1" />
                Back
              </Button>
              <header className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground">Start New Shelf Audit</h1>
                <p className="text-sm text-muted-foreground">
                  {step === "shelf-selection"
                    ? "Select a shelf to begin your audit"
                    : "Choose how you want to capture shelf data"}
                </p>
              </header>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card/50 px-4 py-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                    step === "shelf-selection" ? "bg-accent text-accent-foreground" : "bg-accent/20 text-accent"
                  )}
                >
                  1
                </span>
                <span className={cn("text-sm font-medium", step === "shelf-selection" ? "text-foreground" : "text-muted-foreground")}>
                  Shelf
                </span>
              </div>
              <div className="h-px w-6 bg-border" />
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                    step === "mode-selection" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  2
                </span>
                <span className={cn("text-sm font-medium", step === "mode-selection" ? "text-foreground" : "text-muted-foreground")}>
                  Mode
                </span>
              </div>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="rounded-lg border border-border bg-card shadow-sm p-6 sm:p-8">
            {step === "shelf-selection" ? (
              <ShelfSelectionFlow
                onShelfSelect={handleShelfSelect}
                compact
                allowCreate={false}
              />
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent border border-accent/20">
                    {selectedShelf?.shelfName} · Aisle {selectedShelf?.aisleNumber}, Bay {selectedShelf?.bayNumber}
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Choose Your Capture Mode</h2>
                  <p className="text-sm text-muted-foreground">
                    Select how you want to record the data for this shelf.
                  </p>
                </div>
                <AuditModeSelector onModeSelect={handleModeSelect} />
              </div>
            )}
          </div>

          {/* What happens next - only on shelf selection step */}
          {step === "shelf-selection" && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold text-foreground flex items-center gap-2 text-sm uppercase tracking-wider">
                <span className="size-2 rounded-full bg-accent" />
                What happens next?
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <p className="text-sm font-bold text-foreground">Vision Edge</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Use your device camera to scan the shelf. Our AI will automatically detect products, check facings,
                    and verify price tags in real-time.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-bold text-foreground">Assist Mode</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Manually enter product details through a structured form. Ideal for low-light conditions or when
                    precise manual verification is needed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Coming Soon Modal */}
      <Modal isOpen={comingSoonModalOpen} onClose={() => setComingSoonModalOpen(false)} className="max-w-md">
        <div className="rounded-lg border border-border bg-card p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-foreground">Coming Soon</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            This feature is coming soon. We&apos;re working on Vision Edge and Assist Mode capture—stay tuned!
          </p>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setComingSoonModalOpen(false)}>OK</Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}
