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
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-card-foreground">
          Choose Audit Mode
        </h2>
        <p className="text-muted-foreground">
          Select how you want to capture shelf data
        </p>
      </div>

      {/* Mode Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vision Edge Mode */}
        <button
          type="button"
          onClick={() => handleModeSelect("vision-edge")}
          onKeyDown={(e) => handleKeyDown(e, "vision-edge")}
          disabled={disabled}
          className="group relative rounded-xl border-2 border-border bg-card p-8 text-left transition-all hover:border-primary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Select Vision Edge mode - AI-powered camera detection"
        >
          {/* Icon */}
          <div className="mb-6 inline-flex size-16 items-center justify-center rounded-full bg-linear-to-br from-primary to-accent">
            <Camera className="size-8 text-primary-foreground" />
          </div>

          {/* Title & Badge */}
          <div className="mb-3 flex items-center gap-3">
            <h3 className="text-xl font-bold text-card-foreground">
              Vision Edge
            </h3>
            <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">
              AI Powered
            </span>
          </div>

          {/* Description */}
          <p className="mb-6 text-sm text-muted-foreground">
            Use your device camera with AI detection to automatically identify
            and verify products on the shelf.
          </p>

          {/* Features */}
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-accent">✓</span>
              <span>Faster data capture with camera</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-accent">✓</span>
              <span>AI-powered product recognition</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-accent">✓</span>
              <span>Automatic compliance checking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-accent">✓</span>
              <span>Reduced manual entry errors</span>
            </li>
          </ul>

          {/* Hover Indicator */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-primary to-accent opacity-0 transition-opacity group-hover:opacity-100" />
        </button>

        {/* Assist Mode */}
        <button
          type="button"
          onClick={() => handleModeSelect("assist-mode")}
          onKeyDown={(e) => handleKeyDown(e, "assist-mode")}
          disabled={disabled}
          className="group relative rounded-xl border-2 border-border bg-card p-8 text-left transition-all hover:border-primary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Select Assist Mode - Manual structured entry"
        >
          {/* Icon */}
          <div className="mb-6 inline-flex size-16 items-center justify-center rounded-full bg-linear-to-br from-secondary to-muted">
            <ClipboardList className="size-8 text-secondary-foreground" />
          </div>

          {/* Title & Badge */}
          <div className="mb-3 flex items-center gap-3">
            <h3 className="text-xl font-bold text-card-foreground">
              Assist Mode
            </h3>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              Manual Entry
            </span>
          </div>

          {/* Description */}
          <p className="mb-6 text-sm text-muted-foreground">
            Manually enter shelf data using a structured form with guided
            fields and validation.
          </p>

          {/* Features */}
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-primary">✓</span>
              <span>Step-by-step guided entry</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-primary">✓</span>
              <span>Works without camera access</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-primary">✓</span>
              <span>Full control over data entry</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-primary">✓</span>
              <span>Ideal for complex scenarios</span>
            </li>
          </ul>

          {/* Hover Indicator */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-secondary to-primary opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      </div>

      {/* Help Text */}
      <div className="rounded-lg bg-muted/50 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          💡 <span className="font-medium">Tip:</span> You can change modes for
          each audit. Choose what works best for the current shelf.
        </p>
      </div>
    </div>
  );
}
