"use client";

import { BudgetsClient } from "@/components/budgets/budgets-client";
import { useAppSelector } from "@/store/hooks";

export default function BudgetsPage() {
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  return <BudgetsClient currency={currency} />;
}
