import { DetailBackButton } from "@/components/shared/detail-back-button";

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
      <DetailBackButton to={shelfListPath} />
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {isAssociateMode ? "Associated Planogram" : "Add Shelf"}
        </h1>
      </div>
    </header>
  );
}
