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
  variant = "icon-ghost",
  size = "icon",
  ...props
}: IconButtonProps) {
  const button = (
    <Button
      variant={variant}
      size={size}
      className={cn(
        variant === "icon-ghost" ? "text-muted-foreground" : undefined,
        className,
      )}
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
