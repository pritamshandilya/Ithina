import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AssignedShelvesList, ShelfCard } from "@/components/maker";
import { generateMockShelves } from "@/lib/api/mock-data";

/**
 * Test page for the Assigned Shelves List components
 * Access at: /test-shelves-list
 */
export const Route = createFileRoute("/test-shelves-list")({
  component: TestShelvesList,
});

function TestShelvesList() {
  const [clickedShelf, setClickedShelf] = useState<string | null>(null);
  const mockShelves = generateMockShelves();

  return (
    <div className="min-h-screen bg-primary p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Assigned Shelves List Test
          </h1>
          <p className="mt-2 text-muted-foreground">
            Visual testing for ShelfCard and AssignedShelvesList components
          </p>
        </div>

        {/* Individual ShelfCard Examples */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Individual Shelf Cards
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Never Audited */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Never Audited:</p>
              <ShelfCard
                shelf={mockShelves.find((s) => s.status === "never-audited")!}
                onClick={(id) => {
                  setClickedShelf(id);
                  alert(`Clicked shelf: ${id}`);
                }}
              />
            </div>

            {/* Pending */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Pending Review:</p>
              <ShelfCard
                shelf={mockShelves.find((s) => s.status === "pending")!}
              />
            </div>

            {/* Approved */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Approved:</p>
              <ShelfCard
                shelf={mockShelves.find((s) => s.status === "approved")!}
              />
            </div>

            {/* Returned */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Returned:</p>
              <ShelfCard
                shelf={mockShelves.find((s) => s.status === "returned")!}
              />
            </div>

            {/* High Compliance */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">High Compliance (95%):</p>
              <ShelfCard
                shelf={{
                  ...mockShelves[1],
                  complianceScore: 95,
                }}
              />
            </div>

            {/* Low Compliance */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Low Compliance (68%):</p>
              <ShelfCard
                shelf={{
                  ...mockShelves[3],
                  complianceScore: 68,
                }}
              />
            </div>
          </div>
        </section>

        {/* Click Handler Demo */}
        {clickedShelf && (
          <div className="rounded-lg bg-card border border-accent p-4">
            <p className="text-sm text-card-foreground">
              Last clicked shelf ID:{" "}
              <span className="font-mono font-bold text-accent">{clickedShelf}</span>
            </p>
          </div>
        )}

        {/* Full AssignedShelvesList Component */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Complete Assigned Shelves List
          </h2>
          <p className="text-sm text-muted-foreground">
            With filtering, loading states, and real data from TanStack Query
          </p>

          <AssignedShelvesList
            onShelfClick={(id) => {
              setClickedShelf(id);
              console.log("Shelf clicked:", id);
            }}
          />
        </section>

        {/* Component Features */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Component Features
          </h2>

          <div className="rounded-lg bg-card p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                ShelfCard Features:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Aisle and bay number display (prominent heading)</li>
                <li>Shelf name with truncation for long names</li>
                <li>Status badge (color-coded by status)</li>
                <li>Optional description with 2-line clamp</li>
                <li>Relative time display ("2 days ago")</li>
                <li>Color-coded compliance score (green/purple/red)</li>
                <li>"Never audited" message for new shelves</li>
                <li>Optional click handler with hover effect</li>
                <li>Keyboard accessible (Tab, Enter, Space)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                AssignedShelvesList Features:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Filter tabs with shelf counts</li>
                <li>Filters: All, Never Audited, Pending, Returned, Approved</li>
                <li>Active filter highlighting (purple accent)</li>
                <li>Filtered count display</li>
                <li>Responsive grid layout (1→2→3 columns)</li>
                <li>Skeleton loading states</li>
                <li>Error handling with retry option</li>
                <li>Empty states (no shelves, no filtered results)</li>
                <li>Horizontal scroll for filter tabs on mobile</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Data Integration:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Uses useAssignedShelves() hook (TanStack Query)</li>
                <li>Automatic caching and refetching</li>
                <li>Loading, error, and success states</li>
                <li>Client-side filtering (no server calls)</li>
                <li>Memoized filtered results for performance</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Accessibility:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Filter buttons with aria-pressed state</li>
                <li>Descriptive aria-labels with counts</li>
                <li>Keyboard navigation (Tab through cards)</li>
                <li>Enter/Space to activate cards</li>
                <li>Focus visible indicators</li>
                <li>Semantic HTML (role="button" when clickable)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Visual Design:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Card layout with borders and shadows</li>
                <li>Hover effects (border color, shadow lift)</li>
                <li>Consistent spacing and padding</li>
                <li>Color-coded by status and score</li>
                <li>Clear visual hierarchy (heading → details → metrics)</li>
                <li>Tabular numbers for compliance scores</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Usage Examples
          </h2>

          <div className="space-y-4">
            {/* Example 1 */}
            <div className="rounded-lg bg-muted p-4">
              <p className="text-xs font-semibold text-card-foreground mb-2">
                Basic usage (list with click handler):
              </p>
              <pre className="text-xs text-muted-foreground overflow-x-auto">
                <code>{`import { AssignedShelvesList } from "@/components/maker";
import { useNavigate } from "@tanstack/react-router";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <AssignedShelvesList 
      onShelfClick={(id) => navigate({ to: '/shelf/$id', params: { id }})}
    />
  );
}`}</code>
              </pre>
            </div>

            {/* Example 2 */}
            <div className="rounded-lg bg-muted p-4">
              <p className="text-xs font-semibold text-card-foreground mb-2">
                Individual shelf card:
              </p>
              <pre className="text-xs text-muted-foreground overflow-x-auto">
                <code>{`import { ShelfCard } from "@/components/maker";

function ShelfDetail() {
  const { data: shelf } = useShelfById(id);

  return (
    <ShelfCard 
      shelf={shelf}
      onClick={(id) => console.log('Clicked', id)}
    />
  );
}`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Filter Behavior Demo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Filter Behavior
          </h2>

          <div className="rounded-lg bg-card border border-border p-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              Try clicking different filter tabs above to see how the list updates.
              Notice how:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Active filter is highlighted with purple accent background</li>
              <li>Shelf count updates to show filtered vs total</li>
              <li>Empty state appears when no shelves match filter</li>
              <li>Filtering happens instantly (client-side)</li>
              <li>Filter state persists during component lifetime</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
