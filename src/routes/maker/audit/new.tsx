/**
 * Audit Mode Selection Route
 * 
 * Route: /maker/audit/new
 * 
 * Purpose:
 * - First step in the audit creation flow
 * - Worker selects between Vision Edge (AI camera) or Assist Mode (manual entry)
 * - After selection, navigates to the appropriate audit capture screen
 * 
 * Flow:
 * 1. Worker clicks "Start New Shelf Audit" on dashboard
 * 2. Lands here to choose mode
 * 3. Selects mode → navigates to audit capture screen (to be built in next phase)
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuditModeSelector } from "@/components/maker";
import { ArrowLeft } from "lucide-react";
import type { AuditMode } from "@/types/maker";

export const Route = createFileRoute("/maker/audit/new")({
  component: AuditModeSelectionPage,
});

function AuditModeSelectionPage() {
  const navigate = useNavigate();

  const handleModeSelect = (mode: AuditMode) => {
    console.log("Selected audit mode:", mode);
    
    // TODO: Navigate to the appropriate audit capture screen
    // For now, we'll just log and show an alert
    // In Phase 2, this will navigate to:
    // - /maker/audit/vision-edge (for Vision Edge mode)
    // - /maker/audit/assist (for Assist Mode)
    
    alert(
      `Mode selected: ${mode === "vision-edge" ? "Vision Edge (AI Camera)" : "Assist Mode (Manual Entry)"}\n\n` +
      "The audit capture screen will be built in Phase 2."
    );
  };

  const handleGoBack = () => {
    navigate({ to: "/maker/dashboard" });
  };

  return (
    <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Back Button */}
        <button
          type="button"
          onClick={handleGoBack}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Go back to dashboard"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </button>

        {/* Mode Selector */}
        <div className="rounded-xl bg-card/50 p-6 sm:p-8 lg:p-12 backdrop-blur-sm">
          <AuditModeSelector onModeSelect={handleModeSelect} />
        </div>

        {/* Additional Context (Optional) */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-3 font-semibold text-card-foreground">
            What happens next?
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-card-foreground">
                Vision Edge:
              </span>{" "}
              You'll be guided to use your camera to scan the shelf. The AI
              will automatically detect products and check compliance.
            </p>
            <p>
              <span className="font-medium text-card-foreground">
                Assist Mode:
              </span>{" "}
              You'll fill out a structured form with product details, facings,
              and positioning. Perfect for when camera access isn't available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
