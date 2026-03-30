import { AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import PageHeader from "@/components/shared/page-header";
import LoadingSpinner from "@/components/shared/loading-spinner";
import { useInboxItems } from "@/hooks/use-approval";
import { useFleetStats, useHardwareAlertQuery, useQueueRows, useResolveAlert } from "@/hooks/use-fleet";

import FleetStats from "./components/fleet-stats";
import HardwareTriage from "./components/hardware-triage";
import PublishingQueue from "./components/publishing-queue";

export default function Fleet() {
  const { data: stats = [], isLoading: statsLoading, isError: statsError } = useFleetStats();
  const { data: queueRows = [], isLoading: queueLoading } = useQueueRows();
  const { data: inbox = [] } = useInboxItems();
  const { data: alert = null } = useHardwareAlertQuery();
  const resolveAlertMutation = useResolveAlert();

  const [hasAlert, setHasAlert] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [successRate, setSuccessRate] = useState(99.2);

  const scheduledToDate = useCallback((dateLabel?: string, timeLabel?: string) => {
    if (!dateLabel || dateLabel === "Immediate") return null;
    const clean = dateLabel.replace(/^[A-Za-z]{3},\s*/, "").trim();
    const [monthRaw, dayRaw] = clean.split(/\s+/);
    const day = Number(dayRaw);
    if (!monthRaw || !Number.isFinite(day)) return null;
    const monthIdx = new Date(`${monthRaw} 1, 2000`).getMonth();
    if (!Number.isFinite(monthIdx)) return null;
    const tm = (timeLabel ?? "08:00 AM").match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    let hours = 8;
    let minutes = 0;
    if (tm) {
      hours = Number(tm[1]);
      minutes = Number(tm[2]);
      const suffix = (tm[3] ?? "").toUpperCase();
      if (suffix === "PM" && hours < 12) hours += 12;
      if (suffix === "AM" && hours === 12) hours = 0;
    }
    return new Date(new Date().getFullYear(), monthIdx, day, hours, minutes, 0);
  }, []);

  const dueRows = useMemo(() => {
    const now = Date.now();
    return inbox
      .filter((item) => item.status === "approved")
      .filter((item) => {
        const at = scheduledToDate(item.scheduledDate, item.scheduledTime);
        return !!at && at.getTime() <= now;
      })
      .map((item) => ({
        name: `${item.title} - Fleet Execution`,
        target: item.hardwareTargets?.join(", ") ?? "ESL 4.2\"",
        totalTags: Math.max(item.skus, 1) * 10,
        completedTags: 0,
        state: "publishing" as const,
      }));
  }, [inbox, scheduledToDate]);

  const runtimeQueueRows = useMemo(() => {
    const merged = [...dueRows];
    for (const row of queueRows) {
      if (!merged.some((x) => x.name === row.name)) merged.push(row);
    }
    return merged;
  }, [dueRows, queueRows]);

  const totalCount = runtimeQueueRows.length > 0 ? runtimeQueueRows[0].totalTags : 1240;
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

  const fleetHeader = (
    <PageHeader
      breadcrumbs={[{ label: "Promotions Assistant" }, { label: "Fleet Execution", isActive: true }]}
      title="Live Network Tracking"
    />
  );

  if (hasError) {
    return (
      <>
        {fleetHeader}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center" role="alert">
          <AlertTriangle className="size-10 text-rose-400" />
          <h3 className="text-sm font-semibold text-white">Failed to load fleet data</h3>
          <p className="text-xs text-slate-400">Please refresh the page and try again.</p>
        </div>
      </>
    );
  }

  return (
    <>
      {fleetHeader}

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
                rows={runtimeQueueRows}
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
