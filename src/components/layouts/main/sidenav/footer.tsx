import { ChevronsUpDown, LogOut } from "lucide-react";

import { useNavigate } from "@tanstack/react-router";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
<<<<<<< Updated upstream
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SimulatedAuthService } from "@/lib/auth/simulated-auth";
=======
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearSession } from "@/store/slices/session-slice";
import { toggleTheme } from "@/store/slices/ui-slice";
>>>>>>> Stashed changes

export default function SidenavFooter() {
  const navigate = useNavigate();
<<<<<<< Updated upstream
  const user = SimulatedAuthService.getCurrentUser();

=======
  const dispatch = useAppDispatch();
  const isDark = useAppSelector((s) => s.ui.isDarkMode);
  const user = useAppSelector((s) => s.session.user);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    dispatch(clearSession());
    navigate({ to: "/login" });
  };

>>>>>>> Stashed changes
  if (!user) {
    return (
      <div className="shrink-0 border-t border-white/[0.05] bg-black/20 p-4">
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
    <div className="shrink-0 border-t border-white/[0.05] bg-black/20 p-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center gap-3 rounded-lg p-1 text-left transition-colors hover:bg-white/[0.04]">
            <Avatar className="size-10 shrink-0 rounded-full border border-ithina-border">
              <AvatarFallback className="rounded-full bg-ithina-panel text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
<<<<<<< Updated upstream

            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate font-mono text-[10px] text-slate-500">
                {user.email}
=======
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{fullName}</p>
              <p className="truncate font-mono text-[10px] text-slate-500">{user.email}</p>
              <p className="truncate font-mono text-[10px] text-slate-600">
                {user.role}
>>>>>>> Stashed changes
              </p>
            </div>

            <ChevronsUpDown className="ml-auto size-4 shrink-0 text-slate-500" />
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
                <AvatarFallback className="rounded-lg">
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

<<<<<<< Updated upstream
          <DropdownMenuSeparator />
=======
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="truncate text-sm font-medium leading-tight text-white">{fullName}</p>
          <p className="truncate font-mono text-[10px] text-slate-500">{user.role}</p>
        </div>
>>>>>>> Stashed changes

          <DropdownMenuItem onClick={handleLogout}>
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

