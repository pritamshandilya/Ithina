import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, Store, Users } from "lucide-react";

import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrganization, useOrgStores, useOrgUsers } from "@/queries/checker";

export const Route = createFileRoute("/admin/organization-settings/")({
  component: OrganizationSettingsPage,
});

function OrganizationSettingsPage() {
  const navigate = useNavigate();
  const { data: organization } = useOrganization();
  const { data: stores = [] } = useOrgStores();
  const { data: users = [] } = useOrgUsers();

  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Organization Settings"
          description="View and manage organization-wide information."
        />
      }
    >
      <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto w-full max-w-screen-2xl space-y-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Building2 className="size-5 text-blue-400" />
                  Organization Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Organization Name
                  </p>
                  <p className="mt-1 text-base font-semibold text-white">
                    {organization?.name || "My Organization"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Organization ID
                  </p>
                  <p className="mt-1 font-mono text-sm text-white/90">
                    {organization?.id || "default-org"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border/40 bg-background/30 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Store className="size-4 text-blue-400" />
                    Stores
                  </div>
                  <span className="text-lg font-semibold text-white">{stores.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/40 bg-background/30 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="size-4 text-accent" />
                    Users
                  </div>
                  <span className="text-lg font-semibold text-white">{users.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Management</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => navigate({ to: "/admin/stores" })}>
                <Store className="mr-2 size-4" />
                Manage Stores
              </Button>
              <Button variant="outline" onClick={() => navigate({ to: "/admin/users" })}>
                <Users className="mr-2 size-4" />
                Manage Users
              </Button>
              <Button variant="outline" onClick={() => navigate({ to: "/admin/dashboard" })}>
                <Building2 className="mr-2 size-4" />
                Open Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
