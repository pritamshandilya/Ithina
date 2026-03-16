import React from "react";
import {
    History,
    MapPin,
    Package,
    Layers,
    Maximize,
    Calendar,
    User,
    Info,
    type LucideIcon,
} from "lucide-react";
import { type AuditStatus } from "@/types/maker";
import { Modal } from "@/components/ui/modal";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared";
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
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
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
    const { planogram, metadata } = payload;
    const fixture = planogram.fixture;

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton className="max-w-xl">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-card/95 backdrop-blur-md shadow-2xl">
                {/* Header */}
                <div className="relative border-b border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/20 shadow-inner">
                            <Info className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">{planogram.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <StatusBadge status={(metadata?.status || planogram.status) as AuditStatus} />
                                <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/60">
                                    v{planogram.version}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                    {/* General Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <History className="h-4 w-4" />
                            General Information
                        </h3>
                        <div className="space-y-3">
                            <DetailItem icon={MapPin} label="Location" value={metadata?.location || planogram.location || "Not assigned"} />
                            <DetailItem icon={Calendar} label="Created" value={new Date(planogram.createdDate).toLocaleDateString()} />
                            <DetailItem icon={User} label="Created By" value={metadata?.createdBy || "System"} />
                        </div>
                    </div>

                    {/* Fixture Details */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Maximize className="h-4 w-4" />
                            Fixture Details
                        </h3>
                        <div className="space-y-3">
                            <DetailItem icon={Maximize} label="Type" value={fixture.type} />
                            <DetailItem icon={Maximize} label="Dimensions" value={`${fixture.width} × ${fixture.height} × ${fixture.depth} ${fixture.units || 'cm'}`} />
                            <DetailItem icon={Layers} label="Shelves Count" value={stats.shelves} />
                        </div>
                    </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Statistics Summary */}
                <div className="p-6 bg-white/5">
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Planogram Statistics
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                            <p className="text-lg font-bold text-foreground">{stats.skus}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">Unique SKUs</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                            <p className="text-lg font-bold text-foreground">{stats.totalUnits}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">Total Units</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                            <p className="text-lg font-bold text-foreground">{stats.categories}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">Categories</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                            <p className="text-lg font-bold text-foreground text-destructive">{stats.removed}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">Removed</p>
                        </div>
                    </div>
                </div>

                {/* Footer info banner if needed */}
                {metadata?.stockingRules && (
                    <div className="px-6 py-4 border-t border-white/10 flex items-start gap-3">
                        <History className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="text-xs text-muted-foreground italic">
                            Built using stocking rules: {metadata.stockingRules.notes || 'Default distribution'}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};
