import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Maker Dashboard Route
 * 
 * Main dashboard for store workers (makers) to manage shelf audits.
 * This is a task-oriented, operational dashboard focused on daily execution
 * rather than analytics or reporting.
 * 
 * Layout Structure:
 * 1. Header Context Bar - User, store, date, sync status
 * 2. Primary Action Section - Start New Shelf Audit CTA
 * 3. Quick Stats Panel - Today's metrics at a glance
 * 4. Draft Audits Section - In-progress audits (conditional)
 * 5. Returned Audits Section - Audits requiring resubmission (conditional)
 * 6. Assigned Shelves List - All assigned shelves with filtering
 * 
 * Access at: /maker (redirects to /maker/dashboard)
 */
export const Route = createFileRoute("/maker/")({
  beforeLoad: () => {
    throw redirect({ to: "/maker/dashboard" });
  },
});
