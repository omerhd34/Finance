"use client";

import type { Debt } from "@/types/debt";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DebtCard } from "./debt-card";

type Props = {
  tab: "RECEIVABLE" | "PAYABLE";
  onTabChange: (tab: "RECEIVABLE" | "PAYABLE") => void;
  items: Debt[];
  loading: boolean;
  currency: string;
  onPay: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function DebtsList({
  tab,
  onTabChange,
  items,
  loading,
  currency,
  onPay,
  onEdit,
  onDelete,
}: Props) {
  return (
    <Tabs
      value={tab}
      onValueChange={(v) => onTabChange(v as "RECEIVABLE" | "PAYABLE")}
    >
      <TabsList>
        <TabsTrigger value="RECEIVABLE">Bana borçlular</TabsTrigger>
        <TabsTrigger value="PAYABLE">Benim borçlarım</TabsTrigger>
      </TabsList>
      <TabsContent value={tab} className="mt-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((d) => (
            <DebtCard
              key={d.id}
              debt={d}
              currency={currency}
              onPay={() => onPay(d.id)}
              onEdit={() => onEdit(d.id)}
              onDelete={() => onDelete(d.id)}
            />
          ))}
        </div>
        {!loading && items.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            Bu listede henüz kayıt yok.
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}
