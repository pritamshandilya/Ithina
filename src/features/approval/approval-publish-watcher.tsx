import { useQueryClient } from "@tanstack/react-query";

import { approvalKeys } from "@/hooks/use-approval";
import { campaignKeys, useCampaignEvents } from "@/hooks/use-campaigns";
import { toast } from "@/hooks/use-toast";
import type { ApiCampaignEventResponse } from "@/types/api/campaigns";

function hasEventType(events: ApiCampaignEventResponse[], type: string): boolean {
  return events.some((e) => e.event_type === type);
}

/**
 * After checker approve, polls campaign events until `campaign_published`, then refreshes lists and toasts.
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
      qc.invalidateQueries({ queryKey: campaignKeys.list });
      qc.invalidateQueries({ queryKey: approvalKeys.inbox });
      qc.invalidateQueries({ queryKey: ["fleet"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      onDone();
    },
  });

  return null;
}
