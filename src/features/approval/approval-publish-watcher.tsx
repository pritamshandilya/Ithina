import { useQueryClient } from "@tanstack/react-query";

import { approvalKeys } from "@/hooks/use-approval";
import { useCampaignEvents } from "@/hooks/use-campaign-events";
import { campaignKeys } from "@/hooks/use-campaigns";
import { toast } from "@/hooks/use-toast";
import type { ApiCampaignEventResponse } from "@/types/api/campaigns";

function hasEventType(events: ApiCampaignEventResponse[], type: string): boolean {
  return events.some((e) => e.event_type === type);
}

/**
 * Step 6 — after checker approve, polls `GET /api/v1/campaigns/{id}/events` (via `useCampaignEvents`)
 * until the timeline includes `campaign_published`, then invalidates list/inbox caches and toasts.
 * Not the same as `GET /api/v1/campaigns` (list); see JSDoc on `getCampaignTimeline` for DevTools.
 */
export function ApprovalPublishWatcher({
  campaignId,
  onDone,
}: {
  campaignId: string;
  onDone: () => void;
}) {
  const qc = useQueryClient();

  useCampaignEvents(campaignId, {
    intervalMs: 2_500,
    initialPolling: true,
    shouldStop: ({ events }) => hasEventType(events, "campaign_published"),
    onAutoStop: ({ events }) => {
      if (hasEventType(events, "campaign_published")) {
        toast({
          title: "Campaign published",
          description:
            "Batch render finished. Assets are ready and the campaign should appear in Fleet / Schedule.",
        });
      }
      qc.invalidateQueries({ queryKey: campaignKeys.listPrefix });
      qc.invalidateQueries({ queryKey: approvalKeys.inboxPrefix });
      qc.invalidateQueries({ queryKey: ["fleet"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      onDone();
    },
  });

  return null;
}
