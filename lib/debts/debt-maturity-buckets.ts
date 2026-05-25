import { differenceInCalendarDays, startOfDay } from "date-fns";
import type { Debt } from "@/types/debt";
import { debtRemaining } from "@/lib/debts/debt-remaining";
import { isTryAssetUnit } from "@/lib/debts/debt-asset-units";

type BucketKey = "vadesiz" | "d0_30" | "d31_60" | "d61_90" | "d90plus";

function dueDateToBucketKey(dueDate: string | null): BucketKey {
  if (dueDate === null) return "vadesiz";
  const due = startOfDay(new Date(dueDate));
  const today = startOfDay(new Date());
  const net = differenceInCalendarDays(due, today);
  const n = Math.abs(net);
  if (net >= 0) {
    if (n <= 30) return "d0_30";
    if (n <= 60) return "d31_60";
    if (n <= 90) return "d61_90";
    return "d90plus";
  }
  if (n <= 30) return "d0_30";
  if (n <= 60) return "d31_60";
  if (n <= 90) return "d61_90";
  return "d90plus";
}

export type DebtMaturityRow = {
  label: string;
  tooltipLabel: string;
  alacak: number;
  borc: number;
};

const BUCKET_ORDER: BucketKey[] = [
  "vadesiz",
  "d0_30",
  "d31_60",
  "d61_90",
  "d90plus",
];

const BUCKET_LABEL: Record<BucketKey, string> = {
  vadesiz: "Vadesiz",
  d0_30: "0-30",
  d31_60: "31-60",
  d61_90: "61-90",
  d90plus: "90+",
};

const BUCKET_TOOLTIP_LABEL: Record<BucketKey, string> = {
  vadesiz: "Vadesiz",
  d0_30: "0-30 gün",
  d31_60: "31-60 gün",
  d61_90: "61-90 gün",
  d90plus: "90+ gün",
};

export type BuildDebtMaturityRowsOptions = {
  omitEmptyBuckets?: boolean;
};

export function buildDebtMaturityRows(
  items: Debt[],
  options?: BuildDebtMaturityRowsOptions,
): DebtMaturityRow[] {
  const acc: Record<BucketKey, { alacak: number; borc: number }> = {
    vadesiz: { alacak: 0, borc: 0 },
    d0_30: { alacak: 0, borc: 0 },
    d31_60: { alacak: 0, borc: 0 },
    d61_90: { alacak: 0, borc: 0 },
    d90plus: { alacak: 0, borc: 0 },
  };

  for (const d of items) {
    if (!isTryAssetUnit(d.assetUnit)) continue;
    const rem = debtRemaining(d);
    if (rem <= 0) continue;
    const key = dueDateToBucketKey(d.dueDate);
    if (d.direction === "RECEIVABLE") acc[key].alacak += rem;
    else acc[key].borc += rem;
  }

  const rows = BUCKET_ORDER.map((k) => ({
    label: BUCKET_LABEL[k],
    tooltipLabel: BUCKET_TOOLTIP_LABEL[k],
    alacak: acc[k].alacak,
    borc: acc[k].borc,
  }));
  if (options?.omitEmptyBuckets) {
    return rows.filter((r) => r.alacak + r.borc > 0);
  }
  return rows;
}
