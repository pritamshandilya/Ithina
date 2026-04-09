import { ChevronsUpDown, LogOut, User } from "lucide-react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import { AuthSessionService, getInitialsFromEmail } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { useStore } from "@/providers/store";

export default function SidenavFooter() {
  const { isMobile, state } = useSidebar();
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setSelectedStore } = useStore();
  const isCollapsed = !isMobile && state === "collapsed";
  const currentUser = useSyncExternalStore(
    (onStoreChange) => AuthSessionService.subscribe(onStoreChange),
    () => AuthSessionService.getSnapshot().user,
    () => null,
  );

  const handleLogout = () => {
    AuthSessionService.logout();
    queryClient.clear();
    setSelectedStore(null);
    router.invalidate();
    navigate({ to: "/login" });
  };

  const user = currentUser || {
    firstName: "User",
    lastName: "Account",
    email: "user@example.com",
    organization: { name: "Organization" },
  };

  const fallbackNames = getInitialsFromEmail(user.email);
  const firstName = (user.firstName || "").trim() || fallbackNames.firstName;
  const lastName = (user.lastName || "").trim() || fallbackNames.lastName;

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              tooltip={isCollapsed ? "Account" : undefined}
              size="lg"
              className={cn(
                "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                isCollapsed && "justify-center rounded-xl p-0"
              )}
            >
              <Avatar className="h-9 w-9 rounded-xl border border-white/6">
                <AvatarImage
                  src={undefined}
                  alt={firstName}
                />

                <AvatarFallback className="rounded-xl bg-accent/10 text-accent">
                  {firstName.charAt(0)}
                  {lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium text-sidebar-foreground">
                  {firstName} {lastName}
                </span>

                <span className="truncate font-mono text-[10px] text-muted-foreground">{user.email}</span>
                <span className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {user.organization.name}
                </span>
              </div>

              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-9 w-9 rounded-xl border border-white/6">
                  <AvatarImage
                    src={undefined}
                    alt={firstName}
                  />

                  <AvatarFallback className="rounded-xl bg-accent/10 text-accent">
                    {firstName.charAt(0)}
                    {lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {firstName} {lastName}
                  </span>

                  <span className="truncate font-mono text-[10px] text-muted-foreground">{user.email}</span>
                  <span className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {user.organization.name}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                <User />
                Profile
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
