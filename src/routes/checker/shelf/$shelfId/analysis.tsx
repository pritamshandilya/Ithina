import {
  createFileRoute,
  useLocation,
  useParams,
} from "@tanstack/react-router";

import { PlanogramShelfEditorView } from "@/components/planogram/PlanogramShelfEditorView";

export const Route = createFileRoute("/checker/shelf/$shelfId/analysis")({
  component: PlanogramAnalysisViewPage,
});

export function PlanogramAnalysisViewPage() {
  const { shelfId } = Route.useParams() as { shelfId: string };
  const location = useLocation();
  const params = useParams({ strict: false }) as { storeId?: string };
  const isAdmin = location.pathname.includes("/admin/");
  const storeId = params.storeId as string | undefined;
  const backTo =
    isAdmin && storeId
      ? `/admin/${storeId}/shelf/${shelfId}`
      : `/checker/shelf/${shelfId}`;

  return (
    <PlanogramShelfEditorView
      shelfId={shelfId}
      backTo={backTo}
      title="Planogram analysis"
    />
  );
}
