import { AlertTriangle } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import LoadingSpinner from "@/components/shared/loading-spinner";
import { useFleetStats, useHardwareAlertQuery, useQueueRows, useResolveAlert } from "@/hooks/use-fleet";

import FleetStats from "./components/fleet-stats";
import HardwareTriage from "./components/hardware-triage";
import PublishingQueue from "./components/publishing-queue";

const FLEET_ALERT_DISMISS_KEY = "fleet-hardware-dismissed";

export default function Fleet() {
  const { data: stats = [], isLoading: statsLoading, isError: statsError } = useFleetStats();
  const { data: queueRows = [], isLoading: queueLoading } = useQueueRows();
  const { data: alert = null } = useHardwareAlertQuery();
  const resolveAlertMutation = useResolveAlert();

  const [localDismissed, setLocalDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(FLEET_ALERT_DISMISS_KEY) === "1";
  });

  const hasAlert = Boolean(alert) && !localDismissed;
  const tagsInTransit = useMemo(
    () =>
      queueRows.reduce((sum, r) => {
        if (r.state === "live") return sum;
        return sum + Math.max(0, r.totalTags - r.completedTags);
      }, 0),
    [queueRows],
  );
  const alertCount = hasAlert ? 1 : 0;
  const successRate = hasAlert ? 99.2 : 99.8;

  const batchStartedAt = useMemo(
    () =>
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    [],
  );

  const handleResolve = useCallback(async () => {
    await resolveAlertMutation.mutateAsync();
    if (typeof window !== "undefined") {
      sessionStorage.setItem(FLEET_ALERT_DISMISS_KEY, "1");
    }
    setLocalDismissed(true);
  }, [resolveAlertMutation]);

  const isLoading = statsLoading || queueLoading;
  const hasError = statsError;

  if (hasError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center" role="alert">
        <AlertTriangle className="size-10 text-rose-400" />
        <h3 className="text-sm font-semibold text-white">Failed to load fleet data</h3>
        <p className="text-xs text-slate-400">Please refresh the page and try again.</p>
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <LoadingSpinner label="Loading fleet data..." className="flex-1" />
      ) : (
        <div className="flex flex-1 flex-col gap-6 overflow-hidden p-6 animate-[fadeIn_0.5s_ease-out] lg:p-8">
          <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col gap-6">
            <FleetStats
              stats={stats}
              batchStartedAt={batchStartedAt}
              alertCount={alertCount}
              hasAlert={hasAlert}
              tagsInTransit={tagsInTransit}
              successRate={successRate}
            />

            <div className="grid min-h-[400px] flex-1 grid-cols-1 gap-6 xl:grid-cols-3">
              <PublishingQueue rows={queueRows} />

              <HardwareTriage
                alert={alert}
                hasAlert={hasAlert}
                isResolving={resolveAlertMutation.isPending}
                onResolve={handleResolve}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
