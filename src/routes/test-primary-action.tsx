import { createFileRoute } from "@tanstack/react-router";

import { PrimaryActionSection } from "@/components/maker";

/**
 * Test page for the PrimaryActionSection component
 * Access at: /test-primary-action
 */
export const Route = createFileRoute("/test-primary-action")({
  component: TestPrimaryAction,
});

function TestPrimaryAction() {
  return (
    <div className="min-h-screen bg-primary p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Primary Action Section Test
          </h1>
          <p className="mt-2 text-muted-foreground">
            Visual testing for the PrimaryActionSection component
          </p>
        </div>

        {/* Default Configuration */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Default Configuration
          </h2>
          <p className="text-sm text-muted-foreground">
            Dropdown with Planogram Based Analysis and Adhoc Analysis options
          </p>
          <PrimaryActionSection />
        </section>

        {/* Disabled State */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Disabled State
          </h2>
          <p className="text-sm text-muted-foreground">
            Shows how the button appears when disabled
          </p>
          <PrimaryActionSection disabled />
        </section>

        {/* Responsive Behavior */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Responsive Behavior
          </h2>
          <p className="text-sm text-muted-foreground">
            Try resizing your browser to see how the component adapts
          </p>

          <div className="space-y-6">
            {/* Desktop */}
            <div>
              <p className="text-sm font-medium text-card-foreground mb-2">
                Desktop View (full width):
              </p>
              <PrimaryActionSection />
            </div>

            {/* Tablet */}
            <div>
              <p className="text-sm font-medium text-card-foreground mb-2">
                Tablet View (768px):
              </p>
              <div className="max-w-[768px]">
                <PrimaryActionSection />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <p className="text-sm font-medium text-card-foreground mb-2">
                Mobile View (375px):
              </p>
              <div className="max-w-[375px]">
                <PrimaryActionSection />
              </div>
            </div>
          </div>
        </section>

        {/* Component Features */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Component Features
          </h2>

          <div className="rounded-lg bg-card p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Visual Design:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Gradient background (accent color, subtle)</li>
                <li>Purple accent border that brightens on hover</li>
                <li>Large clipboard icon at the top</li>
                <li>Clear heading and descriptive text</li>
                <li>Shadow that lifts on hover for depth</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Button Design:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Uses maker-primary color (purple accent)</li>
                <li>Large size with generous padding (44px+ height)</li>
                <li>Plus icon for "new" action clarity</li>
                <li>Responsive text sizing (larger on desktop)</li>
                <li>Shadow effect for prominence</li>
                <li>Smooth hover transitions</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Interaction:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Dropdown with Planogram Based Analysis and Adhoc Analysis</li>
                <li>Planogram: navigates to /maker/audits/planogram</li>
                <li>Adhoc: navigates to /maker/audits/adhoc/new</li>
                <li>Keyboard accessible (Tab to focus, Enter to activate)</li>
                <li>Focus visible with ring indicator</li>
                <li>Disabled state prevents interaction</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Accessibility:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Role="region" for semantic structure</li>
                <li>ARIA label for context</li>
                <li>Button has descriptive aria-label</li>
                <li>Icons are aria-hidden (decorative)</li>
                <li>High contrast text and colors</li>
                <li>Large touch targets (44px minimum)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Responsive Design:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Padding adjusts: 24px mobile → 32px desktop</li>
                <li>Icon size: 48px mobile → 56px desktop</li>
                <li>Heading: text-xl mobile → text-2xl desktop</li>
                <li>Button height: 48px mobile → 56px desktop</li>
                <li>Button text: base mobile → lg desktop</li>
                <li>Center-aligned for all screen sizes</li>
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
                Basic usage (dropdown with audit mode options):
              </p>
              <pre className="text-xs text-muted-foreground overflow-x-auto">
                <code>{`import { PrimaryActionSection } from "@/components/maker";

function Dashboard() {
  return (
    <div>
      <PrimaryActionSection />
    </div>
  );
}`}</code>
              </pre>
            </div>

            {/* Example 2 */}
            <div className="rounded-lg bg-muted p-4">
              <p className="text-xs font-semibold text-card-foreground mb-2">
                Conditionally disabled:
              </p>
              <pre className="text-xs text-muted-foreground overflow-x-auto">
                <code>{`import { PrimaryActionSection } from "@/components/maker";

function Dashboard() {
  const { data: shelves } = useAssignedShelves();
  const hasNoShelves = !shelves || shelves.length === 0;

  return (
    <PrimaryActionSection 
      disabled={hasNoShelves}
    />
  );
}`}</code>
              </pre>
            </div>
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
                Why Gradient Background?
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Creates visual hierarchy and draws attention to the primary action
                without being overwhelming. The subtle gradient adds depth.
              </p>
            </div>

            <div className="pt-3 border-t border-border">
              <h3 className="font-semibold text-card-foreground">
                Why So Large?
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                This is the most important action on the Maker dashboard. Store workers
                need to find it quickly and tap it easily, even with gloves or in
                challenging environments.
              </p>
            </div>

            <div className="pt-3 border-t border-border">
              <h3 className="font-semibold text-card-foreground">
                Why Helper Text?
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Reduces anxiety by informing users they'll have options. They know
                they won't be immediately forced into one mode.
              </p>
            </div>

            <div className="pt-3 border-t border-border">
              <h3 className="font-semibold text-card-foreground">
                Why Purple Accent?
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Consistent with the maker-primary color theme, creating a cohesive
                visual identity for maker actions throughout the app.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
