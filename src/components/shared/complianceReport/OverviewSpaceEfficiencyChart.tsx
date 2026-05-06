import { Info } from "lucide-react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

interface SpaceEfficiencyPoint {
  name: string;
  weightKg: number;
  revenuePerSqFt: number;
  unitMargin: number;
  isHighEfficiency: boolean;
}

const SPACE_EFFICIENCY_DATA: SpaceEfficiencyPoint[] = [
  {
    name: "Surface Cleaner A",
    weightKg: 0.2,
    revenuePerSqFt: 82.0,
    unitMargin: 4.9,
    isHighEfficiency: true,
  },
  {
    name: "Surface Cleaner B",
    weightKg: 0.35,
    revenuePerSqFt: 76.0,
    unitMargin: 4.2,
    isHighEfficiency: true,
  },
  {
    name: "Surface Cleaner C",
    weightKg: 0.5,
    revenuePerSqFt: 61.0,
    unitMargin: 3.7,
    isHighEfficiency: true,
  },
  {
    name: "Floor Cleaner A",
    weightKg: 0.65,
    revenuePerSqFt: 58.0,
    unitMargin: 3.2,
    isHighEfficiency: false,
  },
  {
    name: "Floor Cleaner B",
    weightKg: 0.82,
    revenuePerSqFt: 47.0,
    unitMargin: 2.8,
    isHighEfficiency: false,
  },
  {
    name: "Detergent A",
    weightKg: 0.92,
    revenuePerSqFt: 43.0,
    unitMargin: 2.5,
    isHighEfficiency: false,
  },
  {
    name: "Detergent B",
    weightKg: 0.72,
    revenuePerSqFt: 49.0,
    unitMargin: 3.1,
    isHighEfficiency: false,
  },
  {
    name: "Wipes Pack A",
    weightKg: 0.55,
    revenuePerSqFt: 73.0,
    unitMargin: 4.0,
    isHighEfficiency: true,
  },
  {
    name: "Wipes Pack B",
    weightKg: 0.48,
    revenuePerSqFt: 69.0,
    unitMargin: 3.8,
    isHighEfficiency: true,
  },
  {
    name: "Glass Cleaner A",
    weightKg: 0.28,
    revenuePerSqFt: 77.0,
    unitMargin: 4.3,
    isHighEfficiency: true,
  },
  {
    name: "Glass Cleaner B",
    weightKg: 0.33,
    revenuePerSqFt: 63.0,
    unitMargin: 3.6,
    isHighEfficiency: true,
  },
  {
    name: "Sanitizer A",
    weightKg: 0.1,
    revenuePerSqFt: 35.0,
    unitMargin: 2.0,
    isHighEfficiency: false,
  },
  {
    name: "Sanitizer B",
    weightKg: 0.14,
    revenuePerSqFt: 31.0,
    unitMargin: 1.8,
    isHighEfficiency: false,
  },
  {
    name: "Toilet Cleaner A",
    weightKg: 0.4,
    revenuePerSqFt: 52.0,
    unitMargin: 3.0,
    isHighEfficiency: false,
  },
  {
    name: "Toilet Cleaner B",
    weightKg: 0.44,
    revenuePerSqFt: 56.0,
    unitMargin: 3.3,
    isHighEfficiency: false,
  },
];

const X_MIN = 0;
const X_MAX = 1.0;
const Y_MIN = 0;
const Y_MAX = 90;
const BUBBLE_MIN_SIZE = 40;
const BUBBLE_MAX_SIZE = 220;

export function OverviewSpaceEfficiencyChart() {
  const minMargin = Math.min(...SPACE_EFFICIENCY_DATA.map((d) => d.unitMargin));
  const maxMargin = Math.max(...SPACE_EFFICIENCY_DATA.map((d) => d.unitMargin));
  const marginRange = maxMargin - minMargin || 1;
  const chartData = SPACE_EFFICIENCY_DATA.map((point) => ({
    ...point,
    bubbleSize:
      BUBBLE_MIN_SIZE +
      ((point.unitMargin - minMargin) / marginRange) *
        (BUBBLE_MAX_SIZE - BUBBLE_MIN_SIZE),
  }));
  const highEfficiencyData = chartData.filter(
    (point) => point.isHighEfficiency,
  );
  const lowEfficiencyData = chartData.filter(
    (point) => !point.isHighEfficiency,
  );

  return (
    <div className="relative w-full">
      <div className="mb-1 flex items-center gap-3 pl-1 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="bg-chart-2 size-2 rounded-full" aria-hidden />
          <span className="text-muted-foreground">High efficiency items</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#7c3aed]" aria-hidden />
          <span className="text-muted-foreground">Lower efficiency items</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ScatterChart margin={{ top: 14, right: 18, bottom: 26, left: 14 }}>
          <CartesianGrid
            stroke="var(--border)"
            strokeDasharray="4 4"
            strokeOpacity={0.7}
          />
          <XAxis
            type="number"
            dataKey="weightKg"
            domain={[X_MIN, X_MAX]}
            ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
            tickFormatter={(value) => `${value}kg`}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="number"
            dataKey="revenuePerSqFt"
            domain={[Y_MIN, Y_MAX]}
            ticks={[20, 40, 60, 80]}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <ZAxis
            type="number"
            dataKey="bubbleSize"
            range={[BUBBLE_MIN_SIZE, BUBBLE_MAX_SIZE]}
          />
          <Tooltip
            content={<SpaceEfficiencyTooltip />}
            cursor={{ stroke: "var(--border)" }}
          />
          <Scatter
            name="High efficiency items"
            data={highEfficiencyData}
            fill="var(--chart-2)"
            fillOpacity={0.85}
          />
          <Scatter
            name="Lower efficiency items"
            data={lowEfficiencyData}
            fill="#7c3aed"
            fillOpacity={0.85}
          />
        </ScatterChart>
      </ResponsiveContainer>

      <div className="absolute top-1 right-1 z-10">
        <div className="group relative">
          <button
            type="button"
            className="border-border bg-card/95 text-muted-foreground hover:bg-card flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium"
            aria-label="Show chart instructions"
          >
            <Info className="size-3" aria-hidden />
            Instructions
          </button>
          <div className="border-border bg-card/95 text-muted-foreground pointer-events-none absolute top-8 right-0 hidden w-[170px] rounded-md border px-2.5 py-2 text-[10px] shadow-lg group-hover:block">
            <p className="text-foreground mb-1 font-semibold">How to read</p>
            <p>X-axis: Weight (kg)</p>
            <p>Y-axis: Revenue / sq.ft</p>
            <p>Bubble size: unit margin</p>
            <p className="text-chart-2 mt-1">Green: high efficiency items</p>
            <p className="text-chart-1 mt-0.5">
              Purple: lower efficiency items
            </p>
            <p className="mt-1">Hover a bubble for item metrics</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpaceEfficiencyTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: SpaceEfficiencyPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="border-border bg-card rounded-md border px-2 py-1.5 text-[10px] shadow-lg">
      <p className="text-foreground font-semibold">{point.name}</p>
      <p className="text-muted-foreground">Weight: {point.weightKg} kg</p>
      <p className="text-muted-foreground">
        Contrib/SqFt: ${point.revenuePerSqFt.toFixed(2)}
      </p>
      <p className="text-muted-foreground">
        Unit Margin: ${point.unitMargin.toFixed(2)}
      </p>
    </div>
  );
}
