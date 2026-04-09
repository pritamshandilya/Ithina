import { Building2, Store, Users } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { useAdminOrganizationUsers } from "@/hooks/use-admin-users";
import { useOrganization } from "@/hooks/use-organization";
import { useStoresList } from "@/hooks/use-stores";

export default function AdminOrganizationSettingsPage() {
  const navigate = useNavigate();
  const { data: org } = useOrganization();
  const { data: stores = [] } = useStoresList();
  const { data: users = [] } = useAdminOrganizationUsers();

  return (
    <div className="ithina-page bg-background">
      <div className="ithina-page-inner space-y-5 pb-8 pt-2">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm lg:col-span-2">
            <div className="border-b border-border/40 px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                <Building2 className="size-5 text-blue-400" aria-hidden />
                Organization Information
              </h2>
            </div>
            <div className="space-y-5 px-5 py-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Organization Name</p>
                <p className="mt-1 text-base font-semibold text-white">{org?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Organization ID</p>
                <p className="mt-1 font-mono text-sm text-white/90">{org?.id ?? "—"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border/40 px-5 py-4">
              <h2 className="text-base font-semibold text-white">Overview</h2>
            </div>
            <div className="space-y-4 px-5 py-5">
              <div className="flex items-center justify-between rounded-lg border border-border/40 bg-background/30 px-3 py-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Store className="size-4 text-blue-400" aria-hidden />
                  Stores
                </div>
                <span className="text-lg font-semibold text-white">{stores.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/40 bg-background/30 px-3 py-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="size-4 text-primary" aria-hidden />
                  Users
                </div>
                <span className="text-lg font-semibold text-white">{users.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm">
          <div className="border-b border-border/40 px-5 py-4">
            <h2 className="text-base font-semibold text-white">Management</h2>
          </div>
          <div className="flex flex-wrap gap-3 px-5 py-5">
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
          </div>
        </div>
      </div>
    </div>
  );
}
