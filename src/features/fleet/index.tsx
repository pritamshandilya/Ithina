import { AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import LoadingSpinner from "@/components/shared/loading-spinner";
import { useFleetStats, useHardwareAlertQuery, useQueueRows, useResolveAlert } from "@/hooks/use-fleet";

import FleetStats from "./components/fleet-stats";
import HardwareTriage from "./components/hardware-triage";
import PublishingQueue from "./components/publishing-queue";

export default function Fleet() {
  const { data: stats = [], isLoading: statsLoading, isError: statsError } = useFleetStats();
  const { data: queueRows = [], isLoading: queueLoading } = useQueueRows();
  const { data: alert = null } = useHardwareAlertQuery();
  const resolveAlertMutation = useResolveAlert();

  const [hasAlert, setHasAlert] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [successRate, setSuccessRate] = useState(99.2);

  const totalCount = queueRows.length > 0 ? queueRows[0].totalTags : 1240;
  const [progressCount, setProgressCount] = useState(0);
  const tagsInTransit = totalCount - progressCount;
  const alertCount = hasAlert ? 1 : 0;

  const batchStartedAt = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const target = Math.floor(totalCount * 0.9);
    const increment = 25;

    intervalRef.current = setInterval(() => {
      setProgressCount((prev) => {
        const next = prev + Math.floor(Math.random() * increment) + 8;
        if (next >= target) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return target;
        }
        return next;
      });
    }, 600);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [totalCount]);

  const handleResolve = useCallback(async () => {
    await resolveAlertMutation.mutateAsync();
    setHasAlert(false);
    setSuccessRate(99.8);
    setProgressCount(totalCount);
    timerRef.current = setTimeout(() => setIsComplete(true), 1000);
  }, [resolveAlertMutation, totalCount]);

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
              <PublishingQueue
                rows={queueRows}
                progressCount={progressCount}
                totalCount={totalCount}
                isComplete={isComplete}
              />

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
