import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuditModeSelector, ShelfSelectionFlow } from "@/components/maker";
import { ArrowLeft } from "lucide-react";
import type { AuditMode, Shelf } from "@/types/maker";
import { useCreateShelf } from "@/features/maker/hooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/maker/audit/new")({
  component: AuditCreationPage,
});

type AuditStep = "shelf-selection" | "mode-selection";

function AuditCreationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<AuditStep>("shelf-selection");
  const [selectedShelf, setSelectedShelf] = useState<Shelf | null>(null);
  const { mutateAsync: createShelf, isPending: isCreating } = useCreateShelf();

  const handleShelfSelect = (shelf: Shelf) => {
    setSelectedShelf(shelf);
    setStep("mode-selection");
  };

  const handleShelfCreate = async (shelfData: Omit<Shelf, "id" | "status" | "assignedTo">) => {
    try {
      const newShelf = await createShelf(shelfData);
      setSelectedShelf(newShelf);
      setStep("mode-selection");
    } catch (error) {
      console.error("Failed to create shelf:", error);
      alert("Failed to create shelf. Please try again.");
    }
  };

  const handleModeSelect = (mode: AuditMode) => {
    console.log("Starting audit:", { shelfId: selectedShelf?.id, mode });
    
    // In Phase 2, this will navigate to the capture screen
    alert(
      `Shelf: ${selectedShelf?.shelfName} (Aisle ${selectedShelf?.aisleNumber}, Bay ${selectedShelf?.bayNumber})\n` +
      `Mode selected: ${mode === "vision-edge" ? "Vision Edge (AI Camera)" : "Assist Mode (Manual Entry)"}\n\n` +
      "The audit capture screen will be built in Phase 2."
    );
  };

  const handleGoBack = () => {
    if (step === "mode-selection") {
      setStep("shelf-selection");
    } else {
      navigate({ to: "/maker/dashboard" });
    }
  };

  return (
    <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Back Button */}
        <button
          type="button"
          onClick={handleGoBack}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={step === "mode-selection" ? "Back to shelf selection" : "Go back to dashboard"}
        >
          <ArrowLeft className="size-4" />
          {step === "mode-selection" ? "Change Shelf" : "Back to Dashboard"}
        </button>

        <div className="grid gap-6">
          {/* Progress Indicator */}
          <div className="flex items-center gap-4 px-2">
            <div className="flex items-center gap-2">
              <span className={cn(
                "flex size-6 items-center justify-center rounded-full text-xs font-bold transition-colors",
                step === "shelf-selection" 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-accent/20 text-accent"
              )}>
                1
              </span>
              <span className={cn(
                "text-sm font-medium transition-colors",
                step === "shelf-selection" ? "text-foreground" : "text-muted-foreground"
              )}>
                Shelf Selection
              </span>
            </div>
            <div className="h-px w-8 bg-border" />
            <div className="flex items-center gap-2">
              <span className={cn(
                "flex size-6 items-center justify-center rounded-full text-xs font-bold transition-colors",
                step === "mode-selection" 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-muted text-muted-foreground"
              )}>
                2
              </span>
              <span className={cn(
                "text-sm font-medium transition-colors",
                step === "mode-selection" ? "text-foreground" : "text-muted-foreground"
              )}>
                Audit Mode
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-card/50 p-6 sm:p-8 lg:p-12 backdrop-blur-sm border border-border/50 shadow-xl">
            {step === "shelf-selection" ? (
              <ShelfSelectionFlow 
                onShelfSelect={handleShelfSelect}
                onShelfCreate={handleShelfCreate}
              />
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent border border-accent/20">
                    Selected Shelf: {selectedShelf?.shelfName}
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Choose Your Capture Mode
                  </h2>
                  <p className="text-muted-foreground">
                    Select how you want to record the data for Aisle {selectedShelf?.aisleNumber}, Bay {selectedShelf?.bayNumber}.
                  </p>
                </div>
                <AuditModeSelector onModeSelect={handleModeSelect} />
              </div>
            )}
          </div>

          {/* Additional Context */}
          <div className="rounded-lg border border-border bg-card/30 p-6 backdrop-blur-sm">
            <h3 className="mb-3 font-semibold text-card-foreground flex items-center gap-2 text-sm uppercase tracking-wider">
              <span className="size-2 rounded-full bg-accent" />
              What happens next?
            </h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-card-foreground">
                  Vision Edge
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Use your device camera to scan the shelf. Our AI will automatically detect products, check facings, and verify price tags in real-time.
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-card-foreground">
                  Assist Mode
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Manually enter product details through a structured form. Ideal for low-light conditions or when precise manual verification is needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay for Creation */}
      {isCreating && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="size-12 rounded-full border-4 border-accent border-t-transparent animate-spin" />
          <p className="mt-4 font-medium animate-pulse">Creating your new shelf...</p>
        </div>
      )}
    </div>
  );
}
