import type { PieLabelRenderProps } from "recharts";

export function pieSliceLabelTextFill(sliceFill: string | undefined): string {
  if (!sliceFill || !sliceFill.startsWith("#") || sliceFill.length < 7) {
    return "white";
  }
  const hex = sliceFill.slice(1);
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  if (!Number.isFinite(r + g + b)) return "white";
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#171717" : "#ffffff";
}

export function PieSliceLabel(props: PieLabelRenderProps & { fill?: string }) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, fill } = props;
  if (
    cx === undefined ||
    cy === undefined ||
    midAngle === undefined ||
    innerRadius === undefined ||
    outerRadius === undefined
  ) {
    return null;
  }
  if (percent == null || percent < 0.02) {
    return null;
  }
  const RADIAN = Math.PI / 180;
  const radius =
    Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5;
  const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
  const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);
  const pct = Math.round(percent * 100);
  const smallSlice = percent < 0.045;
  return (
    <text
      x={x}
      y={y}
      fill={pieSliceLabelTextFill(fill)}
      textAnchor="middle"
      dominantBaseline="central"
      className={`font-bold ${smallSlice ? "text-[9px]" : "text-[11px]"}`}
    >
      {pct}%
    </text>
  );
}
