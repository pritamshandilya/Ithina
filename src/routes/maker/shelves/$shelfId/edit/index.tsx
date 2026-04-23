import { createFileRoute } from "@tanstack/react-router";
import { PlanogramShelfEditorView } from "@/features/planogram-library/planogram-shelf-editor-view";

export const Route = createFileRoute("/maker/shelves/$shelfId/edit/")({
  component: PlanogramPreviewPage,
});

function PlanogramPreviewPage() {
  const { shelfId } = Route.useParams();

  return (
    <PlanogramShelfEditorView
      shelfId={shelfId}
      backTo="/maker/shelves"
      title="Planogram editor"
    />
  );
}
