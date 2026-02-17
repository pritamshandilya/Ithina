import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface IconButtonProps extends React.ComponentProps<typeof Button> {
  icon: ReactNode;
  tooltip?: string;
}

export function IconButton({
  icon,
  tooltip,
  className,
  variant = "ghost",
  size = "icon",
  ...props
}: IconButtonProps) {
  const button = (
    <Button
      variant={variant}
      size={size}
      className={cn("h-8 w-8", className)}
      // title={tooltip} // Removed to prevent native tooltip overlap with custom tooltip
      {...props}
    >
      {icon}
    </Button>
  );

  if (!tooltip) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
