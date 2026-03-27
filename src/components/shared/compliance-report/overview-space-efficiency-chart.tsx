import { useState } from "react";

interface SpaceEfficiencyPoint {
  name: string;
  weightKg: number;
  revenuePerSqFt: number;
  unitMargin: number;
  isHighEfficiency: boolean;
}

const SPACE_EFFICIENCY_DATA: SpaceEfficiencyPoint[] = [
  { name: "Green Pasta Stack", weightKg: 0.3, revenuePerSqFt: 63.17, unitMargin: 4.58, isHighEfficiency: true },
  { name: "Yellow Pasta Box", weightKg: 0.45, revenuePerSqFt: 52.1, unitMargin: 6.2, isHighEfficiency: true },
  { name: "White Pasta Box", weightKg: 0.38, revenuePerSqFt: 48.5, unitMargin: 5.1, isHighEfficiency: true },
  { name: "Black Pasta Box", weightKg: 0.42, revenuePerSqFt: 41.2, unitMargin: 3.8, isHighEfficiency: false },
  { name: "Red Pasta Stack", weightKg: 0.25, revenuePerSqFt: 38.9, unitMargin: 2.9, isHighEfficiency: false },
  { name: "Black Pasta Bag", weightKg: 0.55, revenuePerSqFt: 35.4, unitMargin: 2.1, isHighEfficiency: false },
  { name: "Potato Chips", weightKg: 0.15, revenuePerSqFt: 95.2, unitMargin: 7.5, isHighEfficiency: true },
  { name: "Tortilla Chips", weightKg: 0.2, revenuePerSqFt: 72.8, unitMargin: 5.2, isHighEfficiency: true },
  { name: "Coca-Cola 500ml", weightKg: 0.52, revenuePerSqFt: 58.3, unitMargin: 4.1, isHighEfficiency: false },
  { name: "Water Bottle 1L", weightKg: 0.55, revenuePerSqFt: 28.4, unitMargin: 1.8, isHighEfficiency: false },
];

const CHART_WIDTH = 560;
const CHART_HEIGHT = 200;
const PADDING = { top: 16, right: 16, bottom: 32, left: 44 };
const PLOT_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom;
const X_MIN = 0;
const X_MAX = 0.6;
const Y_MIN = 0;
const Y_MAX = 160;
const BUBBLE_MIN_SIZE = 6;
const BUBBLE_MAX_SIZE = 18;

export function OverviewSpaceEfficiencyChart() {
  const [tooltip, setTooltip] = useState<SpaceEfficiencyPoint | null>(null);

  const xScale = (v: number) =>
    PADDING.left + (PLOT_WIDTH * (v - X_MIN)) / (X_MAX - X_MIN);
  const yScale = (v: number) =>
    PADDING.top + PLOT_HEIGHT - (PLOT_HEIGHT * (v - Y_MIN)) / (Y_MAX - Y_MIN);

  const minMargin = Math.min(...SPACE_EFFICIENCY_DATA.map((d) => d.unitMargin));
  const maxMargin = Math.max(...SPACE_EFFICIENCY_DATA.map((d) => d.unitMargin));
  const marginRange = maxMargin - minMargin || 1;
  const bubbleScale = (v: number) =>
    BUBBLE_MIN_SIZE + ((v - minMargin) / marginRange) * (BUBBLE_MAX_SIZE - BUBBLE_MIN_SIZE);

  return (
    <div className="flex gap-4">
      <div className="relative flex-1 min-w-0">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="w-full h-[220px] min-h-[220px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {[40, 80, 120].map((y) => (
            <line
              key={y}
              x1={PADDING.left}
              y1={yScale(y)}
              x2={CHART_WIDTH - PADDING.right}
              y2={yScale(y)}
              stroke="var(--border)"
              strokeDasharray="4 4"
              strokeOpacity={2.0}
            />
          ))}
          {[0.15, 0.3, 0.45].map((xVal) => (
            <line
              key={xVal}
              x1={xScale(xVal)}
              y1={PADDING.top}
              x2={xScale(xVal)}
              y2={CHART_HEIGHT - PADDING.bottom}
              stroke="var(--border)"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
            />
          ))}
          {[0, 0.15, 0.3, 0.45, 0.6].map((xVal) => (
            <text key={xVal} x={xScale(xVal)} y={CHART_HEIGHT - 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">
              {`${xVal}kg`}
            </text>
          ))}
          {[40, 80, 120, 160].map((y) => (
            <text key={y} x={PADDING.left - 6} y={yScale(y) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">
              {y}
            </text>
          ))}
          {SPACE_EFFICIENCY_DATA.map((d, i) => {
            const r = bubbleScale(d.unitMargin);
            const cx = xScale(d.weightKg);
            const cy = yScale(d.revenuePerSqFt);
            const fill = d.isHighEfficiency ? "var(--chart-2)" : "#8b5cf6";
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill={fill}
                fillOpacity={0.85}
                stroke="var(--card)"
                strokeWidth={1}
                onMouseEnter={() => setTooltip(d)}
                onMouseLeave={() => setTooltip(null)}
                className="cursor-pointer"
              />
            );
          })}
        </svg>

        {tooltip && (
          <div className="absolute left-0 bottom-0 z-10 rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-xs pointer-events-none">
            <p className="font-semibold text-foreground">{tooltip.name}</p>
            <p>Weight: {tooltip.weightKg} kg</p>
            <p>Contrib/SqFt: ${tooltip.revenuePerSqFt.toFixed(2)}</p>
            <p>Unit Margin: ${tooltip.unitMargin.toFixed(2)}</p>
          </div>
        )}
      </div>
      <div className="shrink-0 rounded border border-border bg-card/95 px-2.5 py-2 text-[10px] text-muted-foreground w-[130px]">
        <p className="font-semibold text-foreground mb-1">How to read</p>
        <p>X = weight (kg)</p>
        <p>Y = revenue/sq ft</p>
        <p>bubble = unit margin</p>
        <p className="mt-1 text-chart-2">Green = high space-efficiency</p>
        <p className="text-indigo-400">Indigo = lower contribution/sq ft</p>
      </div>
    </div>
  );
}
