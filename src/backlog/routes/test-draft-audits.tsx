/**
 * Test Page: Draft Audits Feature
 * 
 * This page tests the complete draft audit functionality including:
 * - Draft status badge
 * - Draft filter in assigned shelves list
 * - Draft audits section with resume and delete
 * - Progress indicators
 * - Last saved timestamps
 * - Visual distinction from "Never Audited"
 * 
 * Navigation: http://localhost:5174/test-draft-audits
 */

import { createFileRoute } from "@tanstack/react-router";
import { DraftAuditsSection } from "@/components/maker";
import { StatusBadge } from "@/components/shared";
import { mockUser } from "@/lib/api/mock-data";

export const Route = createFileRoute("/test-draft-audits")({
  component: TestDraftAudits,
});

function TestDraftAudits() {
  return (
    <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Draft Audits Feature Test
          </h1>
          <p className="text-muted-foreground">
            Testing the complete draft/in-progress audit lifecycle
          </p>

          {/* User Context */}
          <div className="rounded-lg bg-card/50 p-4 backdrop-blur-sm">
            <p className="text-sm text-foreground">
              <strong>Mock User:</strong> {mockUser.firstName}{" "}
              {mockUser.lastName} ({mockUser.email})
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Role:</strong> {mockUser.role}
            </p>
          </div>
        </div>

        {/* Draft Status Badge Examples */}
        <div className="rounded-lg bg-card/50 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            1. Status Badge Comparison
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <StatusBadge status="never-audited" size="md" />
              <p className="text-xs text-muted-foreground">Never Audited</p>
              <p className="text-xs text-muted-foreground italic">
                Gray - No action taken
              </p>
            </div>
            <div className="space-y-2">
              <StatusBadge status="draft" size="md" />
              <p className="text-xs text-muted-foreground">Draft</p>
              <p className="text-xs text-accent italic">
                Purple - In progress
              </p>
            </div>
            <div className="space-y-2">
              <StatusBadge status="pending" size="md" />
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-xs text-muted-foreground italic">
                Purple - Submitted
              </p>
            </div>
            <div className="space-y-2">
              <StatusBadge status="approved" size="md" />
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-xs text-muted-foreground italic">
                Green - Success
              </p>
            </div>
            <div className="space-y-2">
              <StatusBadge status="returned" size="md" />
              <p className="text-xs text-muted-foreground">Returned</p>
              <p className="text-xs text-muted-foreground italic">
                Red - Needs fix
              </p>
            </div>
          </div>
        </div>

        {/* Draft Audits Section */}
        <div className="rounded-lg bg-card/50 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            2. Draft Audits Section Component
          </h2>
          <DraftAuditsSection
            onResume={(auditId, shelfId) => {
              alert(`Resume draft:\nAudit ID: ${auditId}\nShelf ID: ${shelfId}\n\nThis will navigate to the audit editor in Phase 2.`);
            }}
          />
        </div>

        {/* Feature Overview */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Feature Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Audit Lifecycle */}
            <div className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur-sm space-y-3">
              <h3 className="font-semibold text-foreground">
                📋 Complete Audit Lifecycle
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-status-neutral" />
                  <span className="text-foreground font-medium">
                    1. Never Audited
                  </span>
                  <span className="text-muted-foreground">
                    - Initial state
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  <span className="text-foreground font-medium">
                    2. Draft
                  </span>
                  <span className="text-muted-foreground">
                    - In progress (NEW)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-status-pending" />
                  <span className="text-foreground font-medium">
                    3. Pending
                  </span>
                  <span className="text-muted-foreground">- Submitted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-status-approved" />
                  <span className="text-foreground font-medium">
                    4. Approved
                  </span>
                  <span className="text-muted-foreground">- Success</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-status-rejected" />
                  <span className="text-foreground font-medium">
                    5. Returned
                  </span>
                  <span className="text-muted-foreground">- Needs fixes</span>
                </div>
              </div>
            </div>

            {/* Draft Features */}
            <div className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur-sm space-y-3">
              <h3 className="font-semibold text-foreground">
                ✨ Draft Features
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✅ Purple badge with edit icon (distinct from gray)</li>
                <li>✅ "Draft saved X ago" timestamp in shelf cards</li>
                <li>✅ Progress percentage (30-70%)</li>
                <li>✅ Progress bar visualization</li>
                <li>✅ Resume button to continue editing</li>
                <li>✅ Delete button to discard draft</li>
                <li>✅ Auto-save notice (every 30 seconds)</li>
                <li>✅ Visible in Assigned Shelves with "Draft" filter</li>
                <li>✅ "Click to resume audit" CTA in shelf card</li>
              </ul>
            </div>

            {/* Visual Distinctions */}
            <div className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur-sm space-y-3">
              <h3 className="font-semibold text-foreground">
                👁️ Visual Distinctions
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-foreground mb-1">
                    Never Audited vs Draft
                  </p>
                  <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                    <li>Never Audited: Gray badge, no timestamp</li>
                    <li>Draft: Purple badge, "saved X ago" timestamp</li>
                    <li>Draft: Shows progress percentage</li>
                    <li>Draft: "Click to resume" CTA</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">
                    Draft vs Pending
                  </p>
                  <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                    <li>Draft: Not submitted, can be edited/deleted</li>
                    <li>Pending: Submitted, awaiting checker review</li>
                    <li>Draft: No compliance score yet</li>
                    <li>Pending: Has compliance score</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Data Integration */}
            <div className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur-sm space-y-3">
              <h3 className="font-semibold text-foreground">
                🔗 Data Integration
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Hook:</strong>{" "}
                  <code className="text-xs bg-background px-2 py-0.5 rounded">
                    useDraftAudits()
                  </code>
                </p>
                <p>
                  <strong className="text-foreground">Mutations:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <code className="text-xs bg-background px-2 py-0.5 rounded">
                      useSaveDraftProgress()
                    </code>
                  </li>
                  <li>
                    <code className="text-xs bg-background px-2 py-0.5 rounded">
                      useDeleteDraft()
                    </code>
                  </li>
                </ul>
                <p className="mt-2">
                  <strong className="text-foreground">Cache:</strong> 1 minute
                  stale time, refetch on focus
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Testing Instructions */}
        <div className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur-sm space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            🧪 Testing Instructions
          </h2>

          <div className="space-y-3 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-1">
                1. Status Badge Comparison
              </p>
              <p>
                Compare the "Never Audited" (gray) and "Draft" (purple) badges.
                They should be visually distinct with different colors and icons.
              </p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">
                2. Draft Audits Section
              </p>
              <p>
                Verify the Draft Audits Section displays 2 draft audits with:
                progress bars, last saved timestamps, resume buttons, and delete
                buttons.
              </p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">
                3. Resume Functionality
              </p>
              <p>
                Click the "Resume" button on any draft. It should show an alert
                with the audit ID and shelf ID (Phase 2 will navigate to
                editor).
              </p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">
                4. Delete Functionality
              </p>
              <p>
                Click the trash icon to delete a draft. A confirmation dialog
                should appear. Confirm to delete (mock deletion).
              </p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">
                5. Maker Dashboard Integration
              </p>
              <p>
                Navigate to <code className="text-xs bg-background px-2 py-0.5 rounded">/maker</code>
                {" "}and verify:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Draft Audits Section appears above Returned Audits</li>
                <li>Assigned Shelves List has "Draft" filter option</li>
                <li>Draft shelves show "Draft saved X ago" timestamp</li>
                <li>Draft shelves have "Click to resume audit" CTA</li>
                <li>Clicking draft shelf cards triggers resume action</li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">
                6. Filter Testing
              </p>
              <p>
                In the Assigned Shelves List, click the "Draft" filter tab.
                Only draft shelves should appear (currently 2 mock drafts:
                Beverages - Water, Snacks - Cookies).
              </p>
            </div>
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="rounded-lg border border-accent/50 bg-accent/10 p-6 backdrop-blur-sm">
          <h3 className="font-semibold text-foreground mb-2">
            🛠️ Implementation Summary
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Type Updates:</strong> Added
              "draft" to AuditStatus, plus draftSavedAt and draftProgress fields
              to Audit interface
            </p>
            <p>
              <strong className="text-foreground">Mock Data:</strong> 2 draft
              audits added (shelf-003, shelf-006) with progress 30-70%
            </p>
            <p>
              <strong className="text-foreground">API Functions:</strong>{" "}
              fetchDraftAudits, saveDraftProgress, deleteDraft
            </p>
            <p>
              <strong className="text-foreground">Components:</strong>{" "}
              DraftAuditsSection, updated StatusBadge, updated ShelfCard
            </p>
            <p>
              <strong className="text-foreground">CSS:</strong> Added
              .status-draft class with purple accent styling
            </p>
            <p>
              <strong className="text-foreground">Filters:</strong> "Draft"
              filter added to AssignedShelvesList
            </p>
          </div>
        </div>

        {/* Phase 2 Features */}
        <div className="rounded-lg border border-border bg-muted/30 p-6 backdrop-blur-sm">
          <h3 className="font-semibold text-foreground mb-2">
            🚀 Phase 2 Enhancements
          </h3>
          <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
            <li>Navigate to audit editor when resuming draft</li>
            <li>Auto-save draft progress every 30 seconds during editing</li>
            <li>Offline draft support with local storage</li>
            <li>Draft conflict resolution (multi-device)</li>
            <li>Progress percentage based on actual form completion</li>
            <li>Draft expiration (auto-delete after X days)</li>
            <li>Bulk delete drafts option</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
