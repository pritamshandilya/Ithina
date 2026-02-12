/**
 * Test Page: Checker Header Component
 * 
 * Route: /test-checker-header
 * 
 * Purpose: Visual testing and documentation for the CheckerHeader component
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckerHeader } from "@/components/checker";
import {
  mockCheckerUser,
  generateMockStores,
  generateMockNotifications,
} from "@/lib/api/mock-data";
import type { Notification } from "@/types/checker";

export const Route = createFileRoute("/test-checker-header")({
  component: TestCheckerHeaderPage,
});

function TestCheckerHeaderPage() {
  const stores = generateMockStores();
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0].id);
  const [notifications, setNotifications] = useState(
    generateMockNotifications(selectedStoreId)
  );

  const handleStoreChange = (storeId: string) => {
    console.log("Store changed to:", storeId);
    setSelectedStoreId(storeId);
    // In real app, this would refetch data for the new store
    setNotifications(generateMockNotifications(storeId));
  };

  const handleNotificationClick = (notification: Notification) => {
    console.log("Notification clicked:", notification);
    // In real app, navigate to related audit or page
    if (notification.auditId) {
      alert(`Navigate to audit: ${notification.auditId}`);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    console.log("Mark as read:", notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    console.log("Mark all as read");
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const selectedStore = stores.find((s) => s.id === selectedStoreId);

  return (
    <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-card-foreground">
            Checker Header Component
          </h1>
          <p className="text-muted-foreground">
            Test page for the Checker Header with store selector and notifications
          </p>
        </div>

        {/* Live Component */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-card-foreground">
            Live Component
          </h2>
          <CheckerHeader
            user={mockCheckerUser}
            stores={stores}
            selectedStoreId={selectedStoreId}
            onStoreChange={handleStoreChange}
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        </section>

        {/* Current State */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-card-foreground">
            Current State
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-card-foreground mb-3">
                Selected Store
              </h3>
              <pre className="text-sm text-muted-foreground overflow-x-auto">
                {JSON.stringify(selectedStore, null, 2)}
              </pre>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-card-foreground mb-3">
                Notification Stats
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Total: <span className="font-semibold text-card-foreground">{notifications.length}</span>
                </p>
                <p className="text-muted-foreground">
                  Unread: <span className="font-semibold" style={{ color: "var(--checker-critical)" }}>
                    {notifications.filter((n) => !n.read).length}
                  </span>
                </p>
                <p className="text-muted-foreground">
                  Read: <span className="font-semibold text-card-foreground">
                    {notifications.filter((n) => n.read).length}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Documentation */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-card-foreground">
            Component Documentation
          </h2>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Features */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Features:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>User info with avatar and initials</li>
                <li>Checker role badge (blue)</li>
                <li>Store selector dropdown with pending counts</li>
                <li>Notifications bell with unread badge</li>
                <li>Knowledge Center icon link</li>
                <li>Responsive layout (stacks on mobile)</li>
                <li>Separators hidden on mobile</li>
              </ul>
            </div>

            {/* Store Selector */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Store Selector:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Dropdown menu with store list</li>
                <li>Shows store name and address</li>
                <li>Pending audit count badge per store</li>
                <li>Check icon for selected store</li>
                <li>Keyboard navigation (Arrow keys, Enter)</li>
                <li>Accessible with ARIA labels</li>
                <li>Truncates long store names</li>
              </ul>
            </div>

            {/* Notifications */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Notifications Dropdown:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Bell icon with unread count badge</li>
                <li>Dropdown panel (max 400px height, scrollable)</li>
                <li>Unread indicator (blue dot)</li>
                <li>Icons based on notification type</li>
                <li>Relative timestamps (e.g., "2 hours ago")</li>
                <li>Click to mark as read</li>
                <li>"Mark all as read" button</li>
                <li>Empty state when no notifications</li>
              </ul>
            </div>

            {/* Notification Types */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Notification Types:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><strong>new_audit</strong>: Clipboard icon, new audit submitted</li>
                <li><strong>critical_audit</strong>: Alert icon (red), needs immediate attention</li>
                <li><strong>rule_change</strong>: Book icon, rule modified/updated</li>
              </ul>
            </div>

            {/* Accessibility */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Accessibility:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>role="banner" on header</li>
                <li>Descriptive aria-label attributes</li>
                <li>aria-hidden on decorative icons</li>
                <li>Keyboard navigation support</li>
                <li>Focus indicators on all interactive elements</li>
                <li>Unread count announced to screen readers</li>
                <li>Proper button semantics</li>
              </ul>
            </div>

            {/* Color Scheme */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Color Scheme:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Avatar: checker-primary (blue) background</li>
                <li>Role badge: checker-primary</li>
                <li>Pending count: checker-primary</li>
                <li>Unread badge: checker-critical (red)</li>
                <li>Unread dot: checker-primary</li>
                <li>Critical notification: checker-critical icon</li>
              </ul>
            </div>

            {/* User Flow */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                User Flow:
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Checker logs in (Sarah Manager)</li>
                <li>Sees header with current store</li>
                <li>Can switch stores via dropdown</li>
                <li>Dashboard updates for selected store</li>
                <li>Notifications show alerts for that store</li>
                <li>Click notification to view related audit</li>
                <li>Click Knowledge Center to manage rules</li>
              </ol>
            </div>

            {/* Integration Notes */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Integration Notes:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Store change filters entire dashboard</li>
                <li>Notifications poll every 30 seconds (Phase 2)</li>
                <li>Knowledge Center link navigates to placeholder</li>
                <li>User info from auth context (Phase 2)</li>
                <li>Optimistic updates for mark as read</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Usage Example */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-card-foreground">
            Usage Example
          </h2>
          <div className="rounded-lg bg-card border border-border p-6">
            <pre className="overflow-x-auto text-sm text-muted-foreground">
              <code>{`import { CheckerHeader } from "@/components/checker";

function CheckerDashboard() {
  const [selectedStoreId, setSelectedStoreId] = useState("store-1234");
  
  const { data: stores } = useStores();
  const { data: notifications } = useNotifications();
  
  return (
    <CheckerHeader
      user={currentUser}
      stores={stores}
      selectedStoreId={selectedStoreId}
      onStoreChange={setSelectedStoreId}
      notifications={notifications}
      onNotificationClick={(n) => navigate(\`/checker/review/\${n.auditId}\`)}
      onMarkAsRead={markNotificationAsRead}
      onMarkAllAsRead={markAllNotificationsAsRead}
    />
  );
}`}</code>
            </pre>
          </div>
        </section>

        {/* Interactive Tests */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-card-foreground">
            Interactive Tests
          </h2>
          <div className="rounded-lg bg-card border border-border p-6 space-y-4">
            <h3 className="font-semibold text-card-foreground">
              Try These Actions:
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Click the store dropdown and select a different store</li>
              <li>Click the bell icon to view notifications</li>
              <li>Click a notification to mark it as read</li>
              <li>Click "Mark all as read" button</li>
              <li>Click the Knowledge Center (book) icon</li>
              <li>Resize the window to test responsive layout</li>
              <li>Use Tab key to navigate through interactive elements</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
