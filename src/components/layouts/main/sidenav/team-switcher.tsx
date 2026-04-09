import { Building2, Check, ChevronsUpDown, LayoutDashboard, Store } from "lucide-react";
import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "@tanstack/react-router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useStoresList } from "@/hooks/use-stores";
import { StoreContext } from "@/lib/store-context";
import { PromoAuthService } from "@/lib/auth/promo-auth";
import { cn } from "@/lib/utils";
import type { Store as StoreRecord } from "@/services/stores";

export function TeamSwitcher() {
  const navigate = useNavigate();
  const { isMobile, state } = useSidebar();
  const user = PromoAuthService.getCurrentUser();
  const role = user?.role ?? "maker";
  const isCollapsed = !isMobile && state === "collapsed";

  const { data: stores = [] } = useStoresList();

  const activeStoreId = useSyncExternalStore(
    StoreContext.subscribe,
    () => StoreContext.getStoreId(),
    () => null,
  );

  const organization = user?.organization ?? { id: "", name: "Organization" };

  const selectedStore = useMemo(
    () => (activeStoreId ? stores.find((s) => s.id === activeStoreId) : undefined),
    [stores, activeStoreId],
  );

  const isOrgDashboard = !activeStoreId;

  const handleOrgClick = () => {
    StoreContext.clearStoreId();
    if (role === "admin") {
      navigate({ to: "/admin/dashboard" });
      return;
    }
    if (role === "checker") {
      navigate({ to: "/checker/dashboard" });
      return;
    }
    navigate({ to: "/maker/dashboard" });
  };

  const handleStoreClick = (store: StoreRecord) => {
    StoreContext.setStoreId(store.id);
    if (role === "admin") {
      navigate({ to: "/admin/campaigns" });
      return;
    }
    if (role === "checker") {
      navigate({ to: "/checker/dashboard" });
      return;
    }
    navigate({ to: "/maker/dashboard" });
  };

  const subtitle = isOrgDashboard ? "Organization View" : selectedStore?.name ?? "Organization View";

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              tooltip={isCollapsed ? "Organization and store switcher" : undefined}
              size="lg"
              className={cn(
                "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                isCollapsed && "justify-center rounded-xl p-0",
              )}
            >
              <div className="flex aspect-square size-9 shrink-0 items-center justify-center rounded-xl border border-accent/15 bg-accent/10 text-accent">
                <Building2 className="size-4" />
              </div>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold text-sidebar-foreground">{organization.name}</span>
                <span className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {subtitle}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 opacity-50 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="px-2 py-1.5 text-xs text-muted-foreground">Organization</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={handleOrgClick}
              className={cn(
                "cursor-pointer gap-2 p-2",
                isOrgDashboard && "bg-sidebar-accent text-sidebar-accent-foreground",
              )}
            >
              <div className="flex size-7 items-center justify-center rounded-lg border border-border/60 bg-secondary">
                <LayoutDashboard className="size-3.5 shrink-0" />
              </div>
              <div className="flex min-w-0 flex-1 items-center justify-between">
                <span className="font-medium">
                  {role === "admin" ? "Organization view" : organization.name}
                </span>
                {isOrgDashboard ? <Check className="size-3.5 shrink-0" /> : null}
              </div>
            </DropdownMenuItem>

            {stores.length > 0 ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="px-2 py-1.5 text-xs text-muted-foreground">Stores</DropdownMenuLabel>
                <div className="max-h-[300px] overflow-y-auto">
                  {stores.map((store) => {
                    const isSelected = !isOrgDashboard && selectedStore?.id === store.id;
                    return (
                      <DropdownMenuItem
                        key={store.id}
                        onClick={() => handleStoreClick(store)}
                        className={cn(
                          "cursor-pointer gap-2 p-2",
                          isSelected && "bg-sidebar-accent text-sidebar-accent-foreground",
                        )}
                      >
                        <div className="flex size-7 items-center justify-center rounded-lg border border-border/60 bg-secondary">
                          <Store className="size-3.5 shrink-0" />
                        </div>
                        <div className="flex min-w-0 flex-1 items-center justify-between">
                          <span className="truncate">{store.name}</span>
                          {isSelected ? <Check className="size-3.5 shrink-0" /> : null}
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
