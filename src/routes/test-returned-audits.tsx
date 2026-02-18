import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ReturnedAuditsSection } from "@/components/maker";

/**
 * DEVELOPMENT ONLY
 * Test page for the ReturnedAuditsSection component
 * This can be removed before production deployment
 * Access at: /test-returned-audits
 */
export const Route = createFileRoute("/test-returned-audits")({
  component: TestReturnedAudits,
});

function TestReturnedAudits() {
  const [lastAction, setLastAction] = useState<{
    auditId: string;
    shelfId: string;
  } | null>(null);

  return (
    <div className="min-h-screen bg-primary p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Returned Audits Section Test
          </h1>
          <p className="mt-2 text-muted-foreground">
            Visual testing for the ReturnedAuditsSection component
          </p>
        </div>

        {/* Action Feedback */}
        {lastAction && (
          <div className="rounded-lg bg-card border border-accent p-4">
            <p className="text-sm text-card-foreground">
              <span className="font-semibold text-accent">Last Action:</span> Re-submit
              requested for Audit ID:{" "}
              <span className="font-mono text-accent">{lastAction.auditId}</span> (Shelf
              ID: <span className="font-mono">{lastAction.shelfId}</span>)
            </p>
          </div>
        )}

        {/* Live Component */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Live Returned Audits Section
          </h2>
          <p className="text-sm text-muted-foreground">
            Uses real TanStack Query hook - only shows if returned audits exist
          </p>

          <ReturnedAuditsSection
            onViewReport={(auditId, shelfId) => {
              setLastAction({ auditId, shelfId });
              console.log("Re-submit requested:", { auditId, shelfId });
              alert(
                `Re-submit requested for:\nAudit: ${auditId}\nShelf: ${shelfId}\n\nIn production, this would navigate to the audit edit page.`
              );
            }}
          />

          <p className="text-xs text-muted-foreground italic">
            Note: If you don't see anything above, there are no returned audits in the
            mock data. The component conditionally renders only when audits exist.
          </p>
        </section>

        {/* Component Features */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Component Features
          </h2>

          <div className="rounded-lg bg-card p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Conditional Rendering:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Only shows when returned audits exist (length greater than 0)</li>
                <li>Returns <code className="bg-muted px-1 py-0.5 rounded text-xs">null</code> when no returned audits</li>
                <li>No empty state needed - component simply doesn't render</li>
                <li>Reduces visual clutter when everything is fine</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Visual Design (Attention-Grabbing):
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Red/warning background color (5% opacity)</li>
                <li>Red border (30% opacity) for emphasis</li>
                <li>Alert triangle icon in header</li>
                <li>Red heading text for immediate recognition</li>
                <li>X-circle icon on each audit card</li>
                <li>Clear visual hierarchy</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Information Displayed:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-card-foreground">Count:</span> Number
                  of returned audits in header
                </li>
                <li>
                  <span className="font-medium text-card-foreground">Shelf Info:</span>{" "}
                  Name, aisle, and bay numbers (linked from shelves data)
                </li>
                <li>
                  <span className="font-medium text-card-foreground">Timestamp:</span>{" "}
                  Relative time ("3 hours ago")
                </li>
                <li>
                  <span className="font-medium text-card-foreground">Feedback:</span>{" "}
                  Checker's rejection reason (full text)
                </li>
                <li>
                  <span className="font-medium text-card-foreground">Score:</span>{" "}
                  Original compliance score (if available)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Re-Submit Action:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Prominent button with refresh icon</li>
                <li>Purple accent color (maker-primary)</li>
                <li>Full width on mobile, auto width on desktop</li>
                <li>Triggers <code className="bg-muted px-1 py-0.5 rounded text-xs">onResubmit</code> callback</li>
                <li>Passes both auditId and shelfId for context</li>
                <li>Descriptive aria-label for accessibility</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Data Integration:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Uses <code className="bg-muted px-1 py-0.5 rounded text-xs">useReturnedAudits()</code> hook</li>
                <li>Uses <code className="bg-muted px-1 py-0.5 rounded text-xs">useAssignedShelves()</code> for shelf context</li>
                <li>Combines data from both hooks for complete information</li>
                <li>Handles loading, error, and success states</li>
                <li>Auto-refetches on window focus</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                State Management:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Loading: Shows skeleton cards in warning container</li>
                <li>Error: Red alert with error message</li>
                <li>Empty: Returns null (component doesn't render)</li>
                <li>Success: Shows all returned audits with full details</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Accessibility:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Role="region" for semantic structure</li>
                <li>ARIA label describing the section</li>
                <li>Button aria-labels with shelf context</li>
                <li>Icons marked aria-hidden (decorative)</li>
                <li>Clear color contrast (red on light background)</li>
                <li>Keyboard navigable</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Rejection Reasons Examples */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Example Rejection Reasons
          </h2>

          <div className="rounded-lg bg-card border border-border p-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              Checkers can provide detailed feedback when rejecting audits. Here are
              examples from the mock data:
            </p>

            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="pl-4 border-l-2 border-border">
                "Product placement does not match planogram layout. Please review
                sections C and D."
              </li>
              <li className="pl-4 border-l-2 border-border">
                "Multiple price tags are missing or incorrect. Recheck all product
                prices."
              </li>
              <li className="pl-4 border-l-2 border-border">
                "Image quality is too low for verification. Please retake photos with
                better lighting."
              </li>
              <li className="pl-4 border-l-2 border-border">
                "Shelf appears partially stocked. Complete restocking before submitting
                audit."
              </li>
              <li className="pl-4 border-l-2 border-border">
                "Wrong products detected in designated zones. Correct and resubmit."
              </li>
              <li className="pl-4 border-l-2 border-border">
                "Compliance score calculation seems inaccurate. Please reverify product
                counts."
              </li>
            </ul>

            <p className="text-xs text-muted-foreground pt-2 border-t border-border">
              These are specific, actionable messages that help workers understand
              exactly what needs to be fixed.
            </p>
          </div>
        </section>

        {/* Usage Example */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Usage Example
          </h2>

          <div className="rounded-lg bg-muted p-4">
            <pre className="text-xs text-muted-foreground overflow-x-auto">
              <code>{`import { ReturnedAuditsSection } from "@/components/maker";
import { useNavigate } from "@tanstack/react-router";

function MakerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <QuickStatsPanel />
      
      {/* Shows only if returned audits exist */}
      <ReturnedAuditsSection 
        onResubmit={(auditId, shelfId) => {
          // Navigate to audit edit page
          navigate({ 
            to: '/maker/audit/$id/edit',
            params: { id: auditId }
          });
        }}
      />
      
      <AssignedShelvesList />
    </div>
  );
}`}</code>
            </pre>
          </div>
        </section>

        {/* Design Rationale */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Design Rationale
          </h2>

          <div className="rounded-lg bg-card border border-border p-6 space-y-3">
            <div>
              <h3 className="font-semibold text-card-foreground">
                Why Red/Warning Colors?
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Returned audits represent blocking work that prevents progress. The
                warning colors ensure workers immediately notice this section and
                prioritize these tasks.
              </p>
            </div>

            <div className="pt-3 border-t border-border">
              <h3 className="font-semibold text-card-foreground">
                Why Conditional Rendering?
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                When everything is approved, showing an empty "Returned Audits" section
                would create unnecessary visual noise. By only rendering when needed, we
                keep the dashboard clean and focused.
              </p>
            </div>

            <div className="pt-3 border-t border-border">
              <h3 className="font-semibold text-card-foreground">
                Why Show Full Rejection Reasons?
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Workers need complete context to fix issues correctly. Truncating or
                summarizing feedback could lead to incomplete corrections and more
                rounds of rejection.
              </p>
            </div>

            <div className="pt-3 border-t border-border">
              <h3 className="font-semibold text-card-foreground">
                Why Include Shelf Context?
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Linking the shelf name, aisle, and bay helps workers quickly locate the
                physical shelf in the store without searching through lists.
              </p>
            </div>
          </div>
        </section>

        {/* Governance Loop */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Governance Loop
          </h2>

          <div className="rounded-lg bg-card border border-border p-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              This component is critical for the maker/checker workflow:
            </p>

            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li className="pl-2">
                <span className="font-medium text-card-foreground">Maker submits audit</span> - 
                Worker completes shelf audit
              </li>
              <li className="pl-2">
                <span className="font-medium text-card-foreground">Checker reviews</span> - 
                Manager/supervisor verifies accuracy
              </li>
              <li className="pl-2">
                <span className="font-medium text-card-foreground">Checker returns with feedback</span> - 
                Issues found, specific feedback provided
              </li>
              <li className="pl-2">
                <span className="font-medium text-card-foreground">This component appears</span> - 
                Worker sees returned audit with reasons
              </li>
              <li className="pl-2">
                <span className="font-medium text-card-foreground">Worker corrects and resubmits</span> - 
                Issues addressed, audit resubmitted
              </li>
              <li className="pl-2">
                <span className="font-medium text-card-foreground">Loop continues until approved</span> - 
                Ensures quality and compliance
              </li>
            </ol>

            <p className="text-xs text-muted-foreground pt-3 border-t border-border">
              This feedback loop is essential for maintaining audit quality and ensuring
              store workers learn from mistakes.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
