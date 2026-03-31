import { useMemo, useState } from "react";

import { useCampaignList, useUpdateCampaign, useDeleteCampaign } from "@/hooks/use-campaigns";
import type { CampaignCreateForm, CampaignListItem } from "@/types/campaigns";

import CampaignModal from "./components/campaign-modal";

type ScheduledItem = {
  id: number;
  campaignId?: string;
  name: string;
  type: "recurring" | "one-time";
  date: string;
  month: number;
  year: number;
  day: number;
  time: string;
  targets: string;
  skus: number;
  approvalRequired: boolean;
};

const SCHEDULED_ITEMS: ScheduledItem[] = [
  {
    id: 1,
    name: "Weekend Beverage Promo",
    type: "recurring",
    date: "Sat, Mar 22",
    month: 2,
    year: 2026,
    day: 22,
    time: "08:00 AM",
    targets: 'ESL 4.2" · LCD 10"',
    skus: 14,
    approvalRequired: false,
  },
  {
    id: 2,
    name: "Electronics Flash Sale",
    type: "one-time",
    date: "Fri, Mar 28",
    month: 2,
    year: 2026,
    day: 28,
    time: "06:00 AM",
    targets: 'ESL 2.9", ESL 4.2"',
    skus: 8,
    approvalRequired: true,
  },
  {
    id: 3,
    name: "Easter Seasonal Push",
    type: "one-time",
    date: "Sun, Mar 31",
    month: 2,
    year: 2026,
    day: 31,
    time: "00:01 AM",
    targets: "All ESL · All LCD",
    skus: 42,
    approvalRequired: true,
  },
];

export default function CampaignsScheduledTab() {
  const { data: campaigns = [] } = useCampaignList();
  const updateMutation = useUpdateCampaign();
  const deleteMutation = useDeleteCampaign();
  const [scheduledItems, setScheduledItems] = useState<ScheduledItem[]>(SCHEDULED_ITEMS);
  const [editing, setEditing] = useState<{ campaign: CampaignListItem; form: CampaignCreateForm } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ScheduledItem | null>(null);
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedCalDay, setSelectedCalDay] = useState<number | null>(today.getDate());

  const mergedScheduledItems = useMemo(() => {
    const mapped: ScheduledItem[] = campaigns
      .filter((c) => c.status === "Scheduled")
      .map((c, idx) => {
        const raw = (c.date || "").trim();
        const parsed = new Date(raw);
        const dt = Number.isNaN(parsed.getTime()) ? null : parsed;
        const year = dt ? dt.getFullYear() : today.getFullYear();
        const month = dt ? dt.getMonth() : today.getMonth();
        const day = dt ? dt.getDate() : today.getDate();

        return {
          id: 10_000 + idx,
          campaignId: c.id,
          name: c.name,
          type: "one-time",
          date: dt
            ? dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
            : "Scheduled",
          month,
          year,
          day,
          time: dt
            ? dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
            : "08:00 AM",
          targets: c.hardware.length > 0 ? c.hardware.join(" · ") : "Scheduled via Wizard",
          skus: c.skus,
          approvalRequired: true,
        };
      });

    return [...scheduledItems, ...mapped];
  }, [campaigns, scheduledItems, today]);

  const calendarCells = useMemo(() => {
    const year = viewDate.getFullYear();
    const monthIdx = viewDate.getMonth();
    const firstDow = new Date(year, monthIdx, 1).getDay();
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    const eventDays = new Set(
      mergedScheduledItems
        .filter((item) => item.year === year && item.month === monthIdx)
        .map((item) => item.day),
    );

    const cells: Array<{ day: number | null; hasEvent: boolean; isToday: boolean }> = [];
    for (let i = 0; i < firstDow; i++) cells.push({ day: null, hasEvent: false, isToday: false });
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        hasEvent: eventDays.has(d),
        isToday:
          d === today.getDate() &&
          monthIdx === today.getMonth() &&
          year === today.getFullYear(),
      });
    }
    while (cells.length % 7 !== 0) cells.push({ day: null, hasEvent: false, isToday: false });
    return cells;
  }, [mergedScheduledItems, today, viewDate]);

  const filtered = selectedCalDay
    ? mergedScheduledItems.filter(
        (x) =>
          x.day === selectedCalDay &&
          x.month === viewDate.getMonth() &&
          x.year === viewDate.getFullYear(),
      )
    : mergedScheduledItems.filter(
        (x) => x.month === viewDate.getMonth() && x.year === viewDate.getFullYear(),
      );

  const handleEdit = (item: ScheduledItem) => {
    if (!item.campaignId) {
      return;
    }
    const campaign = campaigns.find((c) => c.id === item.campaignId);
    if (!campaign) return;

    setEditing({
      campaign,
      form: {
        name: campaign.name,
        status: campaign.status,
        skus: campaign.skus,
        hardware: campaign.hardware.join(", "),
        initiator: campaign.initiator,
        scheduled_date: campaign.date,
      },
    });
  };

  const handleCancel = (item: ScheduledItem) => {
    setCancelTarget(item);
  };

  return (
    <>
      {cancelTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-ithina-border bg-ithina-panel p-6 shadow-modal">
            <h2 className="text-base font-semibold text-white">Cancel scheduled campaign?</h2>
            <p className="mt-1 text-sm text-slate-400">
              This will remove{" "}
              <span className="font-semibold text-white">{cancelTarget.name}</span> from the schedule.
            </p>
            <p className="mt-2 text-[11px] font-mono text-slate-500">
              {cancelTarget.date} · {cancelTarget.time}
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="rounded-lg border border-ithina-border px-4 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-white"
              >
                Keep Scheduled
              </button>
              <button
                type="button"
                onClick={() => {
                  if (cancelTarget.campaignId) {
                    deleteMutation.mutate(cancelTarget.campaignId);
                  } else {
                    setScheduledItems((prev) => prev.filter((c) => c.id !== cancelTarget.id));
                  }
                  setCancelTarget(null);
                }}
                className="rounded-lg bg-rose-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-rose-600"
              >
                Cancel Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <CampaignModal
          mode="edit"
          form={editing.form}
          onChange={(form) => setEditing({ ...editing, form })}
          onClose={() => setEditing(null)}
          onSave={() => {
            updateMutation.mutate(
              { id: editing.campaign.id, form: editing.form },
              { onSuccess: () => setEditing(null) },
            );
          }}
          isSaving={updateMutation.isPending}
        />
      )}

      <div className="flex min-h-0 flex-1 gap-0 overflow-hidden">
        <div className="flex w-64 shrink-0 flex-col border-r border-ithina-border/40">
          <div className="flex-1 overflow-auto p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                {viewDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="rounded border border-ithina-purple/25 bg-ithina-purple/10 px-2 py-0.5 text-[9px] font-mono font-semibold text-ithina-purple transition-colors hover:bg-ithina-purple/20"
                  onClick={() => {
                    const now = new Date();
                    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
                    setSelectedCalDay(now.getDate());
                  }}
                >
                  Today
                </button>
                <button
                  type="button"
                  className="rounded-md border border-ithina-border/60 p-1 text-slate-500 transition-colors hover:text-white"
                  aria-label="Previous month"
                  onClick={() => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="rounded-md border border-ithina-border/60 p-1 text-slate-500 transition-colors hover:text-white"
                  aria-label="Next month"
                  onClick={() => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mb-1 grid grid-cols-7">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
                <div key={`${d}-${idx}`} className="py-0.5 text-center font-mono text-[9px] text-slate-700">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {calendarCells.map((cell, idx) => {
                if (!cell.day) return <div key={idx} className="aspect-square" />;
                const isSelected = selectedCalDay === cell.day;
                const hasEvent = cell.hasEvent;

                return (
                  <button
                    key={idx}
                    type="button"
                    className={[
                      "relative flex aspect-square items-center justify-center rounded-md font-mono text-[10px] transition-colors",
                      isSelected
                        ? "bg-ithina-purple font-bold text-white ring-2 ring-ithina-purple/40"
                        : cell.isToday
                          ? "bg-ithina-purple/80 font-bold text-white"
                          : hasEvent
                            ? "cursor-pointer bg-ithina-purple/12 text-ithina-purple hover:bg-ithina-purple/25"
                            : "cursor-pointer text-slate-600 hover:bg-white/[0.04]",
                    ].join(" ")}
                    onClick={() => setSelectedCalDay(cell.day)}
                  >
                    <span>{cell.day}</span>
                    {hasEvent && !isSelected && !cell.isToday ? (
                      <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-ithina-purple" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 border-t border-ithina-border/40 pt-4">
              <p className="text-center font-mono text-[9px] uppercase tracking-widest text-slate-600">
                Use the Campaign Wizard to schedule a new deployment
              </p>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-auto">
          <div className="space-y-3 p-5">
            <div className="mb-1 flex items-center gap-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                {selectedCalDay ? `Mar ${selectedCalDay}` : "UPCOMING"} - {filtered.length} deployment
                {filtered.length !== 1 ? "s" : ""}
              </p>
              {selectedCalDay ? (
                <button
                  type="button"
                  onClick={() => setSelectedCalDay(null)}
                  className="rounded border border-ithina-border/40 px-1.5 py-0.5 text-[9px] text-slate-600 transition-colors hover:text-white"
                >
                  Clear
                </button>
              ) : null}
            </div>

            <div className="space-y-3">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-start justify-between gap-4 rounded-2xl border border-ithina-border bg-ithina-panel p-5 transition-all duration-150 hover:border-ithina-purple/40 hover:shadow-[0_0_0_1px_rgba(168,85,247,0.25)]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-xl border border-ithina-purple/20 bg-ithina-purple/10">
                        <span className="size-2 rounded-sm bg-ithina-purple" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                        <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500">{item.targets}</p>
                        <p className="mt-0.5 font-mono text-[10px] text-slate-500">{item.skus} SKUs</p>
                        <div className="mt-2">
                          {item.approvalRequired ? (
                            <span className="inline-flex h-6 items-center justify-center whitespace-nowrap rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 text-[10px] font-semibold text-amber-400">
                              Needs Approval
                            </span>
                          ) : (
                            <span className="inline-flex h-6 items-center justify-center whitespace-nowrap rounded-lg border border-emerald-400/30 bg-emerald-900/40 px-2.5 text-[10px] font-semibold text-emerald-400">
                              Auto-approved
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-[120px] text-right">
                    <p className="whitespace-nowrap text-xs font-semibold text-white">{item.date}</p>
                    <p className="mt-1 whitespace-nowrap font-mono text-[10px] text-slate-500">{item.time}</p>
                    <div className="mt-3 flex items-center justify-end gap-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                      {item.campaignId && (
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="inline-flex h-5 min-w-[28px] items-center justify-center rounded-md px-1.5 text-[10px] font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCancel(item)}
                        className="inline-flex h-5 min-w-[40px] items-center justify-center rounded-md px-1.5 text-[10px] font-medium text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
