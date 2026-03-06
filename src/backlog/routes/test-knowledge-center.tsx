/**
 * Test Page: Knowledge Center Section (Milestone 6)
 * 
 * This page tests the Knowledge Center component that provides rule management
 * shortcuts for Checkers (Store Managers).
 * 
 * Test Coverage:
 * - Rule metadata display (active rules, version, last modified)
 * - Action cards (View Rules, Create Rule, Manage Versions, Retire Rule)
 * - Loading states
 * - Error handling
 * - Hover interactions
 * - Responsive grid layout
 * - Integration with useRuleInfo hook
 * 
 * Navigation: http://localhost:5173/test-knowledge-center
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { KnowledgeCenterSection } from "@/components/checker";
import { useStores } from "@/queries/checker";
import { mockCheckerUser } from "@/lib/api/mock-data";

export const Route = createFileRoute("/test-knowledge-center")({
  component: TestKnowledgeCenter,
});

function TestKnowledgeCenter() {
  const { data: stores, isLoading: storesLoading } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState<string>("store-1234");

  return (
    <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Knowledge Center Section Test
          </h1>
          <p className="text-muted-foreground">
            Testing rule management shortcuts for Checker dashboard (Milestone 6)
          </p>

          {/* User Context */}
          <div className="rounded-lg bg-card/50 p-4 backdrop-blur-sm">
            <p className="text-sm text-foreground">
              <strong>Mock User:</strong> {mockCheckerUser.firstName}{" "}
              {mockCheckerUser.lastName} ({mockCheckerUser.email})
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Role:</strong> {mockCheckerUser.role} (Configuration
              Authority)
            </p>
          </div>
        </div>

        {/* Store Selector */}
        <div className="rounded-lg bg-card/50 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Store Selection
          </h2>
          {storesLoading ? (
            <p className="text-muted-foreground">Loading stores...</p>
          ) : stores ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Select a store to load its rule configuration:
              </p>
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="w-full max-w-md rounded-md border border-border bg-background px-4 py-2 text-foreground"
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name} - {store.address}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        {/* Knowledge Center Section */}
        <div className="rounded-lg bg-card/50 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Knowledge Center Component
          </h2>
          <KnowledgeCenterSection storeId={selectedStoreId} />
        </div>

        {/* Feature Notes */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Component Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rule Metadata */}
            <div className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur-sm space-y-3">
              <h3 className="font-semibold text-foreground">
                📊 Rule Metadata Display
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✅ Active Rules Count - Total rules in use</li>
                <li>✅ Current Version - Version identifier (e.g., v3.2.1)</li>
                <li>
                  ✅ Last Modified Date - When rules were last updated
                </li>
                <li>✅ Live data from useRuleInfo hook</li>
                <li>✅ Loading skeletons</li>
                <li>✅ Error handling</li>
              </ul>
            </div>

            {/* Action Cards */}
            <div className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur-sm space-y-3">
              <h3 className="font-semibold text-foreground">
                🎯 Action Cards
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✅ View Rules (Primary action, recommended badge)</li>
                <li>✅ Create New Rule (Green, success color)</li>
                <li>✅ Manage Versions (Orange, warning color)</li>
                <li>✅ Retire Rule (Gray, neutral color)</li>
                <li>✅ Hover effects with scale and shadow</li>
                <li>✅ Color-coded by action type</li>
              </ul>
            </div>

            {/* Interaction Design */}
            <div className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur-sm space-y-3">
              <h3 className="font-semibold text-foreground">
                💡 Interaction Design
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✅ Hover: Scale up, shadow, arrow indicator</li>
                <li>✅ Focus: Ring outline for keyboard navigation</li>
                <li>✅ Active: Scale down for tactile feedback</li>
                <li>✅ Primary card has subtle ring glow</li>
                <li>✅ Icons with color-coded backgrounds</li>
                <li>✅ Smooth transitions</li>
              </ul>
            </div>

            {/* Responsive Layout */}
            <div className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur-sm space-y-3">
              <h3 className="font-semibold text-foreground">
                📱 Responsive Layout
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✅ Mobile: 1 column grid</li>
                <li>✅ Tablet: 2 columns (sm:grid-cols-2)</li>
                <li>✅ Desktop: 4 columns (lg:grid-cols-4)</li>
                <li>✅ Metadata bar: 1→3 columns</li>
                <li>✅ Touch-friendly tap targets</li>
                <li>✅ Fluid spacing and padding</li>
              </ul>
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
                1. Rule Metadata Verification
              </p>
              <p>
                Confirm that the three metadata cards show: Active Rules Count,
                Current Version (e.g., v3.2.1), and Last Modified Date. Verify
                loading skeletons appear during data fetch.
              </p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">
                2. Action Card Interaction
              </p>
              <p>
                Hover over each action card and observe the scale-up effect,
                shadow enhancement, and arrow indicator appearing on the right.
                Click each card to see console logs and placeholder alerts.
              </p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">
                3. Primary Action Emphasis
              </p>
              <p>
                The "View Rules" card should have a "Recommended" badge and a
                subtle ring glow to emphasize it as the primary action.
              </p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">
                4. Store Switching
              </p>
              <p>
                Change the selected store using the dropdown. The rule metadata
                should update to reflect the new store's configuration (if
                different).
              </p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">
                5. Keyboard Navigation
              </p>
              <p>
                Tab through the action cards and verify focus rings are visible.
                Press Enter/Space to activate cards.
              </p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">
                6. Responsive Behavior
              </p>
              <p>
                Resize the browser window to test responsive breakpoints: 1
                column on mobile, 2 columns on tablet, 4 columns on desktop.
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Authority Notice */}
        <div className="rounded-lg border border-[var(--checker-primary)]/50 bg-[var(--checker-primary)]/10 p-6 backdrop-blur-sm">
          <h3 className="font-semibold text-foreground mb-2">
            🔐 Configuration Authority
          </h3>
          <p className="text-sm text-muted-foreground">
            Only Checkers (Store Managers) have access to the Knowledge Center.
            This is governance-level functionality. In Phase 2, these action
            cards will navigate to dedicated rule management routes:
          </p>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground list-disc list-inside">
            <li>
              <code className="text-xs bg-background/50 px-2 py-0.5 rounded">
                /checker/rules/view
              </code>{" "}
              - Browse all rules
            </li>
            <li>
              <code className="text-xs bg-background/50 px-2 py-0.5 rounded">
                /checker/rules/create
              </code>{" "}
              - Create new rule
            </li>
            <li>
              <code className="text-xs bg-background/50 px-2 py-0.5 rounded">
                /checker/rules/versions
              </code>{" "}
              - Manage versions
            </li>
            <li>
              <code className="text-xs bg-background/50 px-2 py-0.5 rounded">
                /checker/rules/retire
              </code>{" "}
              - Retire rules
            </li>
          </ul>
        </div>

        {/* Developer Notes */}
        <div className="rounded-lg border border-border bg-muted/30 p-6 backdrop-blur-sm space-y-3">
          <h3 className="font-semibold text-foreground">
            👨‍💻 Developer Notes
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Component Location:</strong>{" "}
              <code className="text-xs bg-background px-2 py-0.5 rounded">
                src/components/checker/knowledge-center-section.tsx
              </code>
            </p>
            <p>
              <strong className="text-foreground">Data Hook:</strong>{" "}
              <code className="text-xs bg-background px-2 py-0.5 rounded">
                useRuleInfo(storeId)
              </code>
            </p>
            <p>
              <strong className="text-foreground">Props:</strong>{" "}
              <code className="text-xs bg-background px-2 py-0.5 rounded">
                storeId: string, className?: string
              </code>
            </p>
            <p>
              <strong className="text-foreground">Icons:</strong> lucide-react
              (BookOpenIcon, PlusCircleIcon, GitBranchIcon, ArchiveIcon,
              ActivityIcon)
            </p>
            <p>
              <strong className="text-foreground">Accessibility:</strong> ARIA
              labels, keyboard navigation, focus states, semantic HTML
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
