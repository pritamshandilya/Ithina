import { DetailBackButton } from "@/components/shared/DetailBackButton";

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
        <h1 className="text-foreground text-2xl font-bold">
          {isAssociateMode ? "Associated Planogram" : "Add Shelf"}
        </h1>
      </div>
    </header>
  );
}
