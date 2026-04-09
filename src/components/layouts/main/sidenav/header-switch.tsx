import { Building2, ChevronsUpDown, Store, LayoutDashboard, Check } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { useStore } from "@/providers/store"
import type { Store as StoreType } from "@/types/checker"
import { cn } from "@/lib/utils"

interface TeamSwitcherProps {
    organization: {
        name: string
        id?: string
    }
    stores: StoreType[]
    currentRole: "admin" | "maker" | "checker"
    isOrgDashboard?: boolean
}

export function TeamSwitcher({ organization, stores, currentRole, isOrgDashboard }: TeamSwitcherProps) {
    const { isMobile, state } = useSidebar()
    const { selectedStore, setSelectedStore } = useStore()
    const navigate = useNavigate()
    const isCollapsed = !isMobile && state === "collapsed"

    const handleOrgClick = () => {
        if (currentRole === "admin") {
            navigate({ to: "/admin/organization-settings" })
            return;
        }

        if (currentRole === "checker") {
            navigate({ to: "/checker/dashboard" })
        } else {
            navigate({ to: "/maker/dashboard" })
        }
    }

    const handleStoreClick = (store: StoreType) => {
        setSelectedStore(store)
        if (currentRole === "admin") {
            navigate({ to: "/admin/$storeId/dashboard", params: { storeId: store.id } })
            return;
        }

        if (currentRole === "checker") {
            navigate({ to: "/checker/dashboard" })
        } else {
            navigate({ to: "/maker/dashboard" })
        }
    }

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
                                isCollapsed && "justify-center rounded-xl p-0"
                            )}
                        >
                            <div className="flex aspect-square size-9 shrink-0 items-center justify-center rounded-xl border border-accent/15 bg-accent/10 text-accent">
                                <Building2 className="size-4" />
                            </div>
                            <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                <span className="truncate font-semibold text-sidebar-foreground">
                                    {organization.name}
                                </span>
                                <span className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                    {isOrgDashboard ? "Organization View" : (selectedStore?.name || "Select Store")}
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
                        <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
                            Organization
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={handleOrgClick}
                            className={cn(
                                "gap-2 p-2 cursor-pointer",
                                isOrgDashboard && "bg-sidebar-accent text-sidebar-accent-foreground"
                            )}
                        >
                            <div className="flex size-7 items-center justify-center rounded-lg border border-border/60 bg-secondary">
                                <LayoutDashboard className="size-3.5 shrink-0" />
                            </div>
                            <div className="flex flex-1 items-center justify-between">
                                <span className="font-medium">
                                    {currentRole === "admin" ? "Organization Settings" : organization.name}
                                </span>
                                {isOrgDashboard && <Check className="size-3.5" />}
                            </div>
                        </DropdownMenuItem>

                        {stores.length > 0 && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
                                    Stores
                                </DropdownMenuLabel>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {stores.map((store) => {
                                        const isSelected = !isOrgDashboard && selectedStore?.id === store.id;
                                        return (
                                            <DropdownMenuItem
                                                key={store.id}
                                                onClick={() => handleStoreClick(store)}
                                                className={cn(
                                                    "gap-2 p-2 cursor-pointer",
                                                    isSelected && "bg-sidebar-accent text-sidebar-accent-foreground"
                                                )}
                                            >
                                                <div className="flex size-7 items-center justify-center rounded-lg border border-border/60 bg-secondary">
                                                    <Store className="size-3.5 shrink-0" />
                                                </div>
                                                <div className="flex flex-1 items-center justify-between min-w-0">
                                                    <span className="truncate">{store.name}</span>
                                                    {isSelected && <Check className="size-3.5" />}
                                                </div>
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
