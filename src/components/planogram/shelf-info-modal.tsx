import React from "react";
import {
  Package,
  Layers,
  Maximize,
  Info,
  type LucideIcon,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Separator } from "@/components/ui/separator";
import type { PlanogramPayload } from "@/types/planogram";

interface ShelfInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: PlanogramPayload;
  stats: {
    shelves: number;
    skus: number;
    frontFacings: number;
    totalUnits: number;
    categories: number;
    removed: number;
  };
}

interface DetailItemProps {
  icon?: LucideIcon;
  label: string;
  value: string | number;
}

function DetailItem({ icon: Icon, label, value }: DetailItemProps) {
  return (
    <div className="flex items-center gap-3 py-1">
      {Icon ? (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      ) : null}
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export const ShelfInfoModal: React.FC<ShelfInfoModalProps> = ({
  isOpen,
  onClose,
  payload,
  stats,
}) => {
  const fixture = payload.fixture;

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton className="max-w-xl">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-card/95 shadow-2xl backdrop-blur-md">
        <div className="relative border-b border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/20 text-primary shadow-inner">
              <Info className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{payload.name}</h2>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-full border border-white/60 bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
                  v{payload.version ?? "—"}
                </span>
                <span className="rounded-full border border-white/60 bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
                  {payload.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Info className="h-4 w-4" />
              Overview
            </h3>
            <div className="space-y-3">
              <DetailItem label="Description" value={payload.description ?? "—"} />
              <DetailItem icon={Layers} label="Shelves Count" value={stats.shelves} />
              <DetailItem icon={Package} label="Unique SKUs" value={stats.skus} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Maximize className="h-4 w-4" />
              Fixture Details
            </h3>
            <div className="space-y-3">
              <DetailItem
                icon={Maximize}
                label="Dimensions"
                value={`${fixture.width} × ${fixture.height} × ${fixture.depth}`}
              />
              <DetailItem icon={Package} label="Total Units" value={stats.totalUnits} />
              <DetailItem icon={Package} label="Categories" value={stats.categories} />
            </div>
          </div>
        </div>

        <Separator className="bg-white/10" />

        <div className="bg-white/5 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Package className="h-4 w-4" />
            Planogram Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <p className="text-lg font-bold text-foreground">{stats.skus}</p>
              <p className="text-[10px] uppercase text-muted-foreground">Unique SKUs</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <p className="text-lg font-bold text-foreground">{stats.totalUnits}</p>
              <p className="text-[10px] uppercase text-muted-foreground">Total Units</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <p className="text-lg font-bold text-foreground">{stats.categories}</p>
              <p className="text-[10px] uppercase text-muted-foreground">Categories</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <p className="text-lg font-bold text-destructive">{stats.removed}</p>
              <p className="text-[10px] uppercase text-muted-foreground">Removed</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
