import { createFileRoute } from "@tanstack/react-router";
import { PlanogramShelfEditorView } from "@/features/planogram-library/planogram-shelf-editor-view";

export const Route = createFileRoute("/maker/audits/planogram/$shelfId/")({
  component: PlanogramPreviewPage,
});

function PlanogramPreviewPage() {
  const { shelfId } = Route.useParams();

  return (
    <PlanogramShelfEditorView
      shelfId={shelfId}
      backTo="/maker/audits/planogram"
      title="Planogram preview"
    />
  );
}
