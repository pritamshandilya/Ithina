import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2Icon, ClockIcon, AlertTriangleIcon } from "lucide-react";

import { StatusBadge, StatCard } from "@/components/shared";

/**
 * Test page for viewing shared components
 * This route is temporary and can be deleted after verifying components
 * Access at: /test-components
 */
export const Route = createFileRoute("/test-components")({
  component: TestComponents,
});

function TestComponents() {
  return (
    <div className="min-h-screen bg-primary p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Shared Components Test
          </h1>
          <p className="mt-2 text-muted-foreground">
            Visual testing for StatusBadge and StatCard components
          </p>
        </div>

        {/* StatusBadge Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">
            StatusBadge Component
          </h2>

          <div className="rounded-lg bg-card p-6">
            <h3 className="mb-4 text-lg font-medium text-card-foreground">
              Default Size (md) with Icons
            </h3>
            <div className="flex flex-wrap gap-4">
              <StatusBadge status="never-audited" />
              <StatusBadge status="pending" />
              <StatusBadge status="approved" />
              <StatusBadge status="returned" />
            </div>
          </div>

          <div className="rounded-lg bg-card p-6">
            <h3 className="mb-4 text-lg font-medium text-card-foreground">
              Small Size (sm)
            </h3>
            <div className="flex flex-wrap gap-4">
              <StatusBadge status="never-audited" size="sm" />
              <StatusBadge status="pending" size="sm" />
              <StatusBadge status="approved" size="sm" />
              <StatusBadge status="returned" size="sm" />
            </div>
          </div>

          <div className="rounded-lg bg-card p-6">
            <h3 className="mb-4 text-lg font-medium text-card-foreground">
              Large Size (lg)
            </h3>
            <div className="flex flex-wrap gap-4">
              <StatusBadge status="never-audited" size="lg" />
              <StatusBadge status="pending" size="lg" />
              <StatusBadge status="approved" size="lg" />
              <StatusBadge status="returned" size="lg" />
            </div>
          </div>

          <div className="rounded-lg bg-card p-6">
            <h3 className="mb-4 text-lg font-medium text-card-foreground">
              Without Icons
            </h3>
            <div className="flex flex-wrap gap-4">
              <StatusBadge status="never-audited" showIcon={false} />
              <StatusBadge status="pending" showIcon={false} />
              <StatusBadge status="approved" showIcon={false} />
              <StatusBadge status="returned" showIcon={false} />
            </div>
          </div>
        </section>

        {/* StatCard Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">
            StatCard Component
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Audits Submitted Today"
              value={5}
              icon={CheckCircle2Icon}
              variant="success"
            />
            <StatCard
              title="Pending Review"
              value={3}
              icon={ClockIcon}
              variant="accent"
              description="Awaiting checker approval"
            />
            <StatCard
              title="Returned Audits"
              value={2}
              icon={AlertTriangleIcon}
              variant="warning"
              description="Requires resubmission"
            />
          </div>

          <div className="rounded-lg bg-card p-6">
            <h3 className="mb-4 text-lg font-medium text-card-foreground">
              With Trend Indicators
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Total Audits This Week"
                value={24}
                icon={CheckCircle2Icon}
                variant="default"
                trend={{
                  value: 12,
                  label: "from last week",
                  isPositive: true,
                }}
              />
              <StatCard
                title="Avg Compliance Score"
                value="89%"
                variant="success"
                trend={{
                  value: 3,
                  label: "from last week",
                  isPositive: true,
                }}
              />
              <StatCard
                title="Returned Rate"
                value="8%"
                icon={AlertTriangleIcon}
                variant="warning"
                trend={{
                  value: 2,
                  label: "from last week",
                  isPositive: false,
                }}
              />
            </div>
          </div>

          <div className="rounded-lg bg-card p-6">
            <h3 className="mb-4 text-lg font-medium text-card-foreground">
              Without Icons
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Simple Metric"
                value={42}
                variant="default"
              />
              <StatCard
                title="String Value"
                value="Active"
                variant="accent"
                description="Current status"
              />
              <StatCard
                title="Large Number"
                value="1,234"
                variant="success"
              />
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Combined Usage Example
          </h2>
          <div className="rounded-lg bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-card-foreground">
                  Aisle 3 - Bay 2
                </h3>
                <p className="text-sm text-muted-foreground">
                  Dairy - Yogurt Section
                </p>
              </div>
              <StatusBadge status="pending" />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <StatCard
                title="Compliance"
                value="92%"
                variant="success"
                description="Last audit"
              />
              <StatCard
                title="Days Since Audit"
                value={2}
                variant="default"
              />
              <StatCard
                title="Issues Found"
                value={3}
                variant="warning"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
