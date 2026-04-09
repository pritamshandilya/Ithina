/**
 * Test Page: Returned Audits Section Redesign
 * 
 * This page demonstrates the redesigned "Audits Requiring Attention" section
 * with a focus on detailed feedback reports rather than immediate resubmission.
 * 
 * Key Changes:
 * - Replaced "Re-Submit Audit" button with "View Full Report" button
 * - Enhanced card layout with better visual hierarchy
 * - Added report contents indicators (photos, planogram, detailed feedback)
 * - Larger compliance score badge for visibility
 * - Feedback summary preview in card
 * - Informative help text about report contents
 * - Entire card is clickable for better UX
 * 
 * Navigation: http://localhost:5177/test-returned-audits-redesign
 */

import { createFileRoute } from "@tanstack/react-router";
import { ReturnedAuditsSection } from "@/components/maker";
import { mockUser } from "@/lib/api/mock-data";

export const Route = createFileRoute("/test-returned-audits-redesign")({
  component: TestReturnedAuditsRedesign,
});

function TestReturnedAuditsRedesign() {
  return (
    <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Returned Audits Section — Redesigned
          </h1>
          <p className="text-muted-foreground">
            New design focuses on reviewing detailed feedback reports before taking action
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

        {/* Design Philosophy */}
        <div className="rounded-lg bg-card/50 p-6 backdrop-blur-sm space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Design Philosophy
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-destructive text-xl">❌</span>
                Old Approach
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                <li>Direct "Re-Submit Audit" button</li>
                <li>Brief feedback text only</li>
                <li>Assumed worker could fix immediately</li>
                <li>No indication of additional report contents</li>
                <li>Small visual emphasis</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-chart-2 text-xl">✅</span>
                New Approach
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                <li>"View Full Report" button for detailed review</li>
                <li>Feedback summary + report contents preview</li>
                <li>Worker reviews photos, planogram, detailed comments first</li>
                <li>Clear indicators of what's in the report</li>
                <li>Prominent card design with hover effects</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Returned Audits Section Component */}
        <div className="rounded-lg bg-card/50 p-6 backdrop-blur-sm space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Live Component
          </h2>
          
          <ReturnedAuditsSection
            onViewReport={(auditId, shelfId) => {
              alert(
                `View Full Report\n\n` +
                `Audit ID: ${auditId}\n` +
                `Shelf ID: ${shelfId}\n\n` +
                `Report Contents:\n` +
                `• Detailed checker comments with annotations\n` +
                `• Photo evidence showing issues\n` +
                `• Planogram comparison (expected vs actual)\n` +
                `• Violation list with severity levels\n` +
                `• Step-by-step corrective actions\n\n` +
                `Phase 2: This will navigate to a dedicated report page.`
              );
            }}
          />
        </div>

        {/* Key Features */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Key Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="rounded-lg border border-border bg-card/50 p-5 backdrop-blur-sm space-y-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-accent/20 p-2">
                  <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground">Report-First Design</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Workers must review the full feedback report before acting, ensuring they understand all issues and have the planogram reference.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg border border-border bg-card/50 p-5 backdrop-blur-sm space-y-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-chart-2/20 p-2">
                  <svg className="h-5 w-5 text-chart-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground">Visual Evidence</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Reports will include photo evidence from the checker, showing exactly what issues were identified during the audit.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg border border-border bg-card/50 p-5 backdrop-blur-sm space-y-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-chart-1/20 p-2">
                  <svg className="h-5 w-5 text-chart-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 010 2H6v2a1 1 0 01-2 0V5zM20 5a1 1 0 00-1-1h-4a1 1 0 100 2h2v2a1 1 0 102 0V5zM4 19a1 1 0 001 1h4a1 1 0 100-2H6v-2a1 1 0 10-2 0v3zM20 19a1 1 0 01-1 1h-4a1 1 0 110-2h2v-2a1 1 0 112 0v3z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground">Planogram Reference</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Side-by-side planogram comparison shows expected layout vs actual, making it clear what needs to be corrected.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-lg border border-border bg-card/50 p-5 backdrop-blur-sm space-y-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-destructive/20 p-2">
                  <svg className="h-5 w-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground">Prominent Alert Design</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Bold destructive colors, large compliance score badge, and count indicator ensure returned audits grab immediate attention.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-lg border border-border bg-card/50 p-5 backdrop-blur-sm space-y-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-accent/20 p-2">
                  <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground">Interactive Cards</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Entire card is clickable with hover effects and visual feedback, making it easy and intuitive to access the full report.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-lg border border-border bg-card/50 p-5 backdrop-blur-sm space-y-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-chart-2/20 p-2">
                  <svg className="h-5 w-5 text-chart-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground">Helpful Context</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Info box explains what workers will find in the report, setting clear expectations and reducing confusion.
              </p>
            </div>
          </div>
        </div>

        {/* Visual Improvements */}
        <div className="rounded-lg bg-card/50 p-6 backdrop-blur-sm space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Visual Improvements
          </h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-chart-2 text-lg mt-0.5">✓</span>
              <div>
                <p className="font-semibold text-foreground">Larger Compliance Score Badge</p>
                <p className="text-muted-foreground">Prominent 2xl font size with destructive background makes score immediately visible</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-chart-2 text-lg mt-0.5">✓</span>
              <div>
                <p className="font-semibold text-foreground">Feedback Summary Box</p>
                <p className="text-muted-foreground">Muted background with icon for feedback preview, line-clamped to 2 lines</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-chart-2 text-lg mt-0.5">✓</span>
              <div>
                <p className="font-semibold text-foreground">Report Contents Indicators</p>
                <p className="text-muted-foreground">Color-coded icons for detailed report, photos, and planogram with descriptive labels</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-chart-2 text-lg mt-0.5">✓</span>
              <div>
                <p className="font-semibold text-foreground">Count Badge in Header</p>
                <p className="text-muted-foreground">Circular badge showing number of returned audits at top-right of section header</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-chart-2 text-lg mt-0.5">✓</span>
              <div>
                <p className="font-semibold text-foreground">Full-Width Action Button</p>
                <p className="text-muted-foreground">Prominent accent button with icon and chevron, responsive hover animations</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-chart-2 text-lg mt-0.5">✓</span>
              <div>
                <p className="font-semibold text-foreground">Better Spacing & Hierarchy</p>
                <p className="text-muted-foreground">Increased padding, clear sections with borders, proper use of whitespace</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Flow */}
        <div className="rounded-lg border border-accent/50 bg-accent/10 p-6 backdrop-blur-sm space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Expected User Flow (Phase 2)
          </h2>
          
          <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
            <li className="pl-2">
              <span className="font-semibold text-foreground">Worker sees returned audit</span> in dashboard with prominent alert styling
            </li>
            <li className="pl-2">
              <span className="font-semibold text-foreground">Worker clicks "View Full Report"</span> to navigate to dedicated report page
            </li>
            <li className="pl-2">
              <span className="font-semibold text-foreground">Report page shows:</span>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>Detailed checker comments with section annotations</li>
                <li>Photo evidence (before/during inspection)</li>
                <li>Planogram comparison (expected vs actual layout)</li>
                <li>Violation list with severity indicators</li>
                <li>Suggested corrective actions</li>
              </ul>
            </li>
            <li className="pl-2">
              <span className="font-semibold text-foreground">Worker reviews all information</span> and understands exactly what needs fixing
            </li>
            <li className="pl-2">
              <span className="font-semibold text-foreground">Worker goes to physical shelf</span> with report/planogram reference on device
            </li>
            <li className="pl-2">
              <span className="font-semibold text-foreground">Worker makes corrections</span> based on planogram and feedback
            </li>
            <li className="pl-2">
              <span className="font-semibold text-foreground">Worker starts new audit</span> from dashboard or report page to resubmit
            </li>
          </ol>
        </div>

        {/* Testing Instructions */}
        <div className="rounded-lg bg-muted/30 p-6 backdrop-blur-sm space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            🧪 Testing Instructions
          </h2>

          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-foreground mb-1">1. Visual Review</p>
              <p className="text-muted-foreground">
                Examine the returned audits section above. Verify the design is visually appealing, well-organized, and draws attention with destructive colors.
              </p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">2. Card Interaction</p>
              <p className="text-muted-foreground">
                Hover over the audit cards. They should highlight with a border color change and shadow effect. The entire card should feel clickable.
              </p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">3. View Report Button</p>
              <p className="text-muted-foreground">
                Click "View Full Report" button. An alert will show what the Phase 2 report page will contain (detailed feedback, photos, planogram, etc.).
              </p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">4. Information Hierarchy</p>
              <p className="text-muted-foreground">
                Verify: Shelf name {'>'} Location {'>'} Timestamp is clear, compliance score is prominent, feedback summary is readable, report contents indicators are visible.
              </p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">5. Maker Dashboard Integration</p>
              <p className="text-muted-foreground">
                Navigate to <code className="text-xs bg-background px-2 py-0.5 rounded">/maker</code> to see this section in context with the full dashboard layout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
