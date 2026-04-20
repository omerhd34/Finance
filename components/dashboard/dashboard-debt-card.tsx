import Link from "next/link";
import { HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { currencySymbolLabel, formatMoneyAmount } from "@/lib/utils";

type Props = {
  receivable: number;
  payable: number;
  currency: string;
};

export function DashboardDebtCard({ receivable, payable, currency }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="min-w-0 space-y-1.5">
          <CardTitle className="flex items-center gap-2">
            <HandCoins
              className="h-5 w-5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            Borç ve Alacak Özeti
          </CardTitle>
          <CardDescription>
            Yapılan ödemeler düşülmüş güncel kalan bakiyeler
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/borc-ve-alacak">Detaylar</Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 select-none">
        <div className="pointer-events-none outline-none">
          <p className="text-sm text-muted-foreground">
            Toplam alacak ({currencySymbolLabel(currency)})
          </p>
          <p className="text-xl font-semibold text-emerald-500">
            {formatMoneyAmount(receivable, currency)}
          </p>
        </div>
        <div className="pointer-events-none outline-none">
          <p className="text-sm text-muted-foreground">
            Toplam borç ({currencySymbolLabel(currency)})
          </p>
          <p className="text-xl font-semibold text-amber-500">
            {formatMoneyAmount(payable, currency)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
