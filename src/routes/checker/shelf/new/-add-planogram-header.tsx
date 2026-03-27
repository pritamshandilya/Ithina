import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

interface AddPlanogramHeaderProps {
  shelfListPath: string;
  isAssociateMode: boolean;
}

export function AddPlanogramHeader({
  shelfListPath,
  isAssociateMode,
}: AddPlanogramHeaderProps) {
  return (
    <header className="flex items-center gap-4">
      <Button variant="ghost" size="icon" asChild>
        <Link to={shelfListPath as never}>
          <ArrowLeft className="size-4" aria-hidden />
          <span className="sr-only">Back</span>
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {isAssociateMode ? "Associated Planogram" : "Add Shelf"}
        </h1>
      </div>
    </header>
  );
}
