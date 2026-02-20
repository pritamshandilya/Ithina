/**
 * Send for Approval Modal
 *
 * Confirmation dialog when Maker sends an audit to the Store Manager.
 * Includes optional notes for the approver.
 */

import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

export interface SendForApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (notes: string) => void;
  isLoading?: boolean;
}

export function SendForApprovalModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: SendForApprovalModalProps) {
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (isLoading) return;
    onSubmit(notes);
    setNotes("");
    // Parent is responsible for closing when submission completes
  };

  const handleClose = () => {
    if (isLoading) return;
    setNotes("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} showCloseButton>
      <div
        className="rounded-xl border border-border bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-chart-2/20 p-2 shrink-0">
            <Send className="size-5 text-chart-2" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-foreground">Send for Approval</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This analysis will be sent to the Store Manager for review and approval.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <label
            htmlFor="approval-notes"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Notes for approver (optional)
          </label>
          <textarea
            id="approval-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Shelf 2 rearrangement — please review compliance."
            rows={3}
            disabled={isLoading}
            className={cn(
              "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50"
            )}
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-chart-2 text-white hover:opacity-90"
          >
            {isLoading ? (
              "Sending…"
            ) : (
              <>
                <Send className="size-4" aria-hidden />
                Submit
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
