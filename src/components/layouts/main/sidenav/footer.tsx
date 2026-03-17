import { ChevronsUpDown, LogOut } from "lucide-react";

import { useNavigate } from "@tanstack/react-router";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SimulatedAuthService } from "@/lib/auth/simulated-auth";

export default function SidenavFooter() {
  const navigate = useNavigate();
  const user = SimulatedAuthService.getCurrentUser();

  if (!user) {
    return (
      <div className="shrink-0 border-t border-ithina-border/40 bg-black/20 p-4">
        <div className="flex items-center gap-3">
          <div className="size-10 shrink-0 rounded-full border border-ithina-border bg-ithina-panel" />
          <div className="overflow-hidden">
            <p className="truncate text-sm font-medium text-white">Guest</p>
            <p className="truncate font-mono text-[10px] text-slate-500">
              Not signed in
            </p>
          </div>
        </div>
      </div>
    );
  }

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;

  const handleLogout = () => {
    SimulatedAuthService.logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="shrink-0 border-t border-ithina-border/40 bg-gradient-to-t from-black/30 to-transparent p-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center gap-3 rounded-lg p-1.5 text-left transition-all duration-200 hover:bg-white/[0.04]">
            <Avatar className="size-9 shrink-0 rounded-full border border-ithina-purple/20 shadow-[0_0_8px_rgba(168,85,247,0.1)]">
              <AvatarFallback className="rounded-full bg-ithina-purple/10 text-xs font-semibold text-ithina-purple">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate font-mono text-[10px] text-slate-500">
                {user.email}
              </p>
            </div>

            <ChevronsUpDown className="ml-auto size-4 shrink-0 text-slate-600" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-56 rounded-lg"
          side="right"
          align="end"
          sideOffset={8}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-ithina-purple/10 text-xs font-semibold text-ithina-purple">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user.firstName} {user.lastName}
                </span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleLogout}>
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
