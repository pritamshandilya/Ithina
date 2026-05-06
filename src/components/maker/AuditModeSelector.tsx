/**
 * Audit Mode Selector Component
 *
 * Purpose:
 * - Allows workers to choose between Vision Edge (AI camera) and Assist Mode (manual entry)
 * - Appears during audit initiation, not as a permanent dashboard toggle
 * - Clear visual distinction between the two modes
 * - Provides context about what each mode does
 *
 * Design:
 * - Large, tappable cards for easy mobile selection
 * - Icons and descriptions to clarify each mode
 * - Responsive layout (stacked on mobile, side-by-side on desktop)
 * - Accessible with keyboard navigation
 */
import { Camera, ClipboardList } from "lucide-react";

import type { AuditMode } from "@/types/maker";

export interface AuditModeSelectorProps {
  /**
   * Callback when a mode is selected
   */
  onModeSelect: (mode: AuditMode) => void;

  /**
   * Optional className for custom styling
   */
  className?: string;

  /**
   * Disable mode selection (e.g., during loading)
   */
  disabled?: boolean;
}

/**
 * AuditModeSelector Component
 *
 * Displays two large, interactive cards for selecting audit mode.
 * Each card includes an icon, title, description, and feature list.
 */
export function AuditModeSelector({
  onModeSelect,
  className = "",
  disabled = false,
}: AuditModeSelectorProps) {
  const handleModeSelect = (mode: AuditMode) => {
    if (!disabled) {
      onModeSelect(mode);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, mode: AuditMode) => {
    if (!disabled && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onModeSelect(mode);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="space-y-2 text-center">
        <h2 className="text-card-foreground text-2xl font-bold">
          Choose Audit Mode
        </h2>
        <p className="text-muted-foreground">
          Select how you want to capture shelf data
        </p>
      </div>

      {/* Mode Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Vision Edge Mode */}
        <button
          type="button"
          onClick={() => handleModeSelect("vision-edge")}
          onKeyDown={(e) => handleKeyDown(e, "vision-edge")}
          disabled={disabled}
          className="group border-border bg-card hover:border-primary focus:ring-primary relative rounded-xl border-2 p-8 text-left transition-all hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Select Vision Edge mode - AI-powered camera detection"
        >
          {/* Icon */}
          <div className="from-primary to-accent mb-6 inline-flex size-16 items-center justify-center rounded-full bg-linear-to-br">
            <Camera className="text-primary-foreground size-8" />
          </div>

          {/* Title & Badge */}
          <div className="mb-3 flex items-center gap-3">
            <h3 className="text-card-foreground text-xl font-bold">
              Vision Edge
            </h3>
            <span className="bg-accent/20 text-accent rounded-full px-3 py-1 text-xs font-semibold">
              AI Powered
            </span>
          </div>

          {/* Description */}
          <p className="text-muted-foreground mb-6 text-sm">
            Use your device camera with AI detection to automatically identify
            and verify products on the shelf.
          </p>

          {/* Features */}
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">✓</span>
              <span>Faster data capture with camera</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">✓</span>
              <span>AI-powered product recognition</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">✓</span>
              <span>Automatic compliance checking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">✓</span>
              <span>Reduced manual entry errors</span>
            </li>
          </ul>

          {/* Hover Indicator */}
          <div className="from-primary to-accent absolute inset-x-0 bottom-0 h-1 bg-linear-to-r opacity-0 transition-opacity group-hover:opacity-100" />
        </button>

        {/* Assist Mode */}
        <button
          type="button"
          onClick={() => handleModeSelect("assist-mode")}
          onKeyDown={(e) => handleKeyDown(e, "assist-mode")}
          disabled={disabled}
          className="group border-border bg-card hover:border-primary focus:ring-primary relative rounded-xl border-2 p-8 text-left transition-all hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Select Assist Mode - Manual structured entry"
        >
          {/* Icon */}
          <div className="from-secondary to-muted mb-6 inline-flex size-16 items-center justify-center rounded-full bg-linear-to-br">
            <ClipboardList className="text-secondary-foreground size-8" />
          </div>

          {/* Title & Badge */}
          <div className="mb-3 flex items-center gap-3">
            <h3 className="text-card-foreground text-xl font-bold">
              Assist Mode
            </h3>
            <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-semibold">
              Manual Entry
            </span>
          </div>

          {/* Description */}
          <p className="text-muted-foreground mb-6 text-sm">
            Manually enter shelf data using a structured form with guided fields
            and validation.
          </p>

          {/* Features */}
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Step-by-step guided entry</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Works without camera access</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Full control over data entry</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Ideal for complex scenarios</span>
            </li>
          </ul>

          {/* Hover Indicator */}
          <div className="from-secondary to-primary absolute inset-x-0 bottom-0 h-1 bg-linear-to-r opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      </div>

      {/* Help Text */}
      <div className="bg-muted/50 rounded-lg p-4 text-center">
        <p className="text-muted-foreground text-sm">
          💡 <span className="font-medium">Tip:</span> You can change modes for
          each audit. Choose what works best for the current shelf.
        </p>
      </div>
    </div>
  );
}
