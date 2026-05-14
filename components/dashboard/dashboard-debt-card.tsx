import { HandCoins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DashboardSectionActionLink } from "@/components/dashboard/dashboard-section-action-link";
import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
import { DashboardDebtMaturityChart } from "@/components/dashboard/dashboard-debt-maturity-chart";
import { buildDebtMaturityRows } from "@/lib/debts/debt-maturity-buckets";
import type { Debt } from "@/types/debt";

type Props = {
  items: Debt[];
  currency: string;
};

export function DashboardDebtCard({ items, currency }: Props) {
  const maturityRows = buildDebtMaturityRows(items, {
    omitEmptyBuckets: true,
  });
  return (
    <Card className="overflow-hidden">
      <DashboardSectionHeader
        icon={HandCoins}
        title="Borçlar ve Alacaklar"
        description="Vadeli kayıtlar bugüne göre takvim günüyle gruplanır; aynı etiket yaklaşan vade ve aynı süredeki gecikmeyi gösterir."
        action={
          <DashboardSectionActionLink
            href="/borc-ve-alacak"
            label="Tümünü gör"
          />
        }
      />
      <DashboardDebtMaturityChart data={maturityRows} currency={currency} />
    </Card>
  );
}
