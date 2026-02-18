/**
 * Test Page: Audit Mode Selector Component
 * 
 * Route: /test-audit-mode-selector
 * 
 * Purpose: Visual testing and documentation for the AuditModeSelector component
 */

import { createFileRoute } from "@tanstack/react-router";
import { AuditModeSelector } from "@/components/maker";
import { useState } from "react";
import type { AuditMode } from "@/types/maker";

export const Route = createFileRoute("/test-audit-mode-selector")({
  component: TestAuditModeSelectorPage,
});

function TestAuditModeSelectorPage() {
  const [selectedMode, setSelectedMode] = useState<AuditMode | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleModeSelect = (mode: AuditMode) => {
    setSelectedMode(mode);
    console.log("Mode selected:", mode);
  };

  const handleReset = () => {
    setSelectedMode(null);
  };

  return (
    <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-card-foreground">
            Audit Mode Selector Component
          </h1>
          <p className="text-muted-foreground">
            Test page for the mode selection component used in the audit
            creation flow
          </p>
        </div>

        {/* Controls */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">
            Test Controls
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => setIsDisabled(!isDisabled)}
              className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              {isDisabled ? "Enable" : "Disable"} Selector
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80"
            >
              Reset Selection
            </button>
          </div>
          {selectedMode && (
            <div className="mt-4 rounded-lg bg-accent/10 p-4">
              <p className="text-sm font-medium text-accent">
                Selected Mode:{" "}
                <span className="font-bold">
                  {selectedMode === "vision-edge"
                    ? "Vision Edge (AI Camera)"
                    : "Assist Mode (Manual Entry)"}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Component Demo */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-card-foreground">
            Component Demo
          </h2>
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8 lg:p-12">
            <AuditModeSelector
              onModeSelect={handleModeSelect}
              disabled={isDisabled}
            />
          </div>
        </section>

        {/* Documentation */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-card-foreground">
            Component Documentation
          </h2>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Purpose */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Purpose:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>First step in audit creation flow</li>
                <li>Worker chooses between AI camera or manual entry</li>
                <li>Appears after clicking "Start New Shelf Audit"</li>
                <li>Not a permanent dashboard toggle</li>
                <li>Mode can be different for each audit</li>
              </ul>
            </div>

            {/* Vision Edge Features */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Vision Edge Mode:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>AI-powered camera detection</li>
                <li>Faster data capture</li>
                <li>Automatic product recognition</li>
                <li>Automatic compliance checking</li>
                <li>Reduced manual entry errors</li>
                <li>Gradient icon (primary to accent)</li>
              </ul>
            </div>

            {/* Assist Mode Features */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Assist Mode:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Manual structured entry</li>
                <li>Step-by-step guided form</li>
                <li>Works without camera access</li>
                <li>Full control over data entry</li>
                <li>Ideal for complex scenarios</li>
                <li>Gradient icon (secondary to muted)</li>
              </ul>
            </div>

            {/* Design Details */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Design Details:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Large, tappable cards for mobile</li>
                <li>Side-by-side on desktop, stacked on mobile</li>
                <li>Icons with gradient backgrounds</li>
                <li>Feature lists with checkmarks</li>
                <li>Hover effects with bottom border indicator</li>
                <li>Focus states for keyboard navigation</li>
              </ul>
            </div>

            {/* Accessibility */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Accessibility:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Semantic button elements</li>
                <li>Descriptive aria-labels</li>
                <li>Keyboard navigation (Enter/Space)</li>
                <li>Focus ring indicators</li>
                <li>Disabled state support</li>
                <li>Clear visual hierarchy</li>
              </ul>
            </div>

            {/* User Flow */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                User Flow:
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Worker clicks "Start New Shelf Audit"</li>
                <li>Navigates to /maker/audit/new</li>
                <li>Sees this mode selector</li>
                <li>Chooses Vision Edge or Assist Mode</li>
                <li>Proceeds to audit capture screen (Phase 2)</li>
              </ol>
            </div>

            {/* Props */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Component Props:
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">
                    onModeSelect
                  </code>{" "}
                  - Callback when mode is selected (required)
                </li>
                <li>
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">
                    className
                  </code>{" "}
                  - Optional custom styling
                </li>
                <li>
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">
                    disabled
                  </code>{" "}
                  - Disable interaction (default: false)
                </li>
              </ul>
            </div>

            {/* Integration Notes */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Integration Notes:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Used in /maker/audit/new route</li>
                <li>Mode stored in audit submission</li>
                <li>Different capture UIs based on mode</li>
                <li>Mode visible in audit history</li>
                <li>Analytics can track mode preference</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Usage Example */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-card-foreground">
            Usage Example
          </h2>
          <div className="rounded-lg bg-card border border-border p-6">
            <pre className="overflow-x-auto text-sm text-muted-foreground">
              <code>{`import { AuditModeSelector } from "@/components/maker";
import type { AuditMode } from "@/types/maker";

function AuditCreationPage() {
  const handleModeSelect = (mode: AuditMode) => {
    if (mode === "vision-edge") {
      navigate({ to: "/maker/audit/vision-edge" });
    } else {
      navigate({ to: "/maker/audit/assist" });
    }
  };

  return (
    <AuditModeSelector
      onModeSelect={handleModeSelect}
      disabled={false}
    />
  );
}`}</code>
            </pre>
          </div>
        </section>

        {/* Responsive Behavior */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-card-foreground">
            Responsive Behavior
          </h2>
          <div className="rounded-lg bg-card border border-border p-6">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-card-foreground">
                  Mobile (default):
                </span>{" "}
                Cards stack vertically for easy thumb access
              </p>
              <p>
                <span className="font-medium text-card-foreground">
                  Desktop (lg+):
                </span>{" "}
                Cards display side-by-side for quick comparison
              </p>
              <p>
                <span className="font-medium text-card-foreground">
                  Padding:
                </span>{" "}
                Increases from p-8 to p-12 on larger screens for better visual
                balance
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
