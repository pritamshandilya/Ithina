import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableColumn, DataTableProps } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface ReportStat {
    title: string;
    value: string | number;
    icon: LucideIcon;
    variant?: "default" | "success" | "warning" | "accent";
}

interface ReportPageProps<T extends object> {
    title?: string;
    subtitle?: string;
    stats: ReportStat[];
    tableTitle: string;
    tableColumns: DataTableColumn<T>[];
    tableData: T[];
    className?: string;
    tableProps?: Partial<Omit<DataTableProps<T>, "columns" | "data">>;
}

export function ReportPage<T extends object>({
    title,
    subtitle,
    stats,
    tableTitle,
    tableColumns,
    tableData,
    className,
    tableProps,
}: ReportPageProps<T>) {
    return (
        <div className={cn("flex flex-col gap-4", className)}>
            {/* Header - Only show if title is provided */}
            {title && (
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="size-4" />
                        Export PDF
                    </Button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <StatCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        variant={stat.variant}
                    />
                ))}
            </div>

            {/* Table Section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="size-1.5 rounded-full bg-accent" />
                        <h2 className="text-lg font-semibold">{tableTitle}</h2>
                    </div>
                    <span className="text-xs text-muted-foreground">{tableData.length} records</span>
                </div>
                <DataTable
                    columns={tableColumns}
                    data={tableData}
                    pageSize={10}
                    showRowNumber
                    className="min-h-[400px]"
                    {...tableProps}
                />
            </div>
        </div>
    );
}
