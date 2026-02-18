import { MoreHorizontal, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface ActionItem {
  id?: string;
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface ActionMenuProps {
  actions: ActionItem[];
  icon?: LucideIcon;
  className?: string;
  align?: "start" | "end" | "center";
}

export function ActionMenu({ 
  actions, 
  icon: Icon = MoreHorizontal, 
  className,
  align = "end"
}: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent", className)}
        >
          <Icon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-[160px] bg-popover/95 backdrop-blur-sm">
        {actions.map((action, index) => {
          const showSeparator = action.destructive && index > 0;
          
          return (
            <div key={action.id || index}>
               {showSeparator && <DropdownMenuSeparator />}
               <DropdownMenuItem
                className={cn(
                  "cursor-pointer gap-2 focus:bg-accent focus:text-accent-foreground",
                  action.destructive && "text-destructive focus:text-destructive focus:bg-destructive/10",
                  action.className
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick?.();
                }}
                disabled={action.disabled}
              >
                {action.icon && <action.icon className="h-4 w-4" />}
                <span>{action.label}</span>
              </DropdownMenuItem>
            </div>
           
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
