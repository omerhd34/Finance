"use client";

import {
  formatGoldQuantityCell,
  goldSubtypeLabel,
} from "@/lib/gold-subtypes";
import { costBasisTry, pnlTry, valueTry } from "@/lib/investment-position-math";
import { currencySymbolLabel, formatMoneyAmount } from "@/lib/utils";
import type { InvestmentPosition } from "@/types/investment";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2 } from "lucide-react";

type Props = {
  tab: "GOLD" | "STOCK";
  onTabChange: (tab: "GOLD" | "STOCK") => void;
  items: InvestmentPosition[];
  loading: boolean;
  currency: string;
  onEdit: (position: InvestmentPosition) => void;
  onDelete: (id: string) => void;
};

export function InvestmentsPositionsTabs({
  tab,
  onTabChange,
  items,
  loading,
  currency,
  onEdit,
  onDelete,
}: Props) {
  return (
    <Tabs
      value={tab}
      onValueChange={(v) => onTabChange(v as "GOLD" | "STOCK")}
    >
      <TabsList>
        <TabsTrigger value="GOLD">Altın</TabsTrigger>
        <TabsTrigger value="STOCK">Hisse senedi</TabsTrigger>
      </TabsList>
      <TabsContent value={tab} className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {tab === "GOLD" ? "Altın pozisyonları" : "Hisse pozisyonları"}
            </CardTitle>
            <CardDescription>
              {loading ? "Yükleniyor…" : `${items.length} kayıt`}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {tab === "STOCK" && <TableHead>Başlık</TableHead>}
                  {tab === "GOLD" && <TableHead>Altın türü</TableHead>}
                  {tab === "STOCK" && <TableHead>Kod</TableHead>}
                  <TableHead className="text-right">Miktar</TableHead>
                  <TableHead className="text-right">
                    Alış fiyatı ({currencySymbolLabel(currency)})
                  </TableHead>
                  <TableHead className="text-right">
                    Güncel fiyat ({currencySymbolLabel(currency)})
                  </TableHead>
                  <TableHead className="text-right">
                    Değer ({currencySymbolLabel(currency)})
                  </TableHead>
                  <TableHead className="text-right">
                    K/Z ({currencySymbolLabel(currency)})
                  </TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && !loading && (
                  <TableRow>
                    <TableCell
                      colSpan={tab === "GOLD" ? 7 : 8}
                      className="text-center text-muted-foreground"
                    >
                      Henüz kayıt yok. &quot;Pozisyon ekle&quot; ile başlayın.
                    </TableCell>
                  </TableRow>
                )}
                {items.map((p) => {
                  const c = costBasisTry(p);
                  const v = valueTry(p);
                  const pl = pnlTry(p);
                  const hasM = p.marketPricePerUnitTry != null;
                  return (
                    <TableRow key={p.id}>
                      {tab === "STOCK" && (
                        <TableCell className="font-medium">{p.title}</TableCell>
                      )}
                      {tab === "GOLD" && (
                        <TableCell>
                          <Badge variant="outline">
                            {goldSubtypeLabel(p.goldSubtype)}
                          </Badge>
                        </TableCell>
                      )}
                      {tab === "STOCK" && (
                        <TableCell>
                          {p.ticker ? (
                            <Badge variant="secondary">{p.ticker}</Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      )}
                      <TableCell className="text-right tabular-nums">
                        {tab === "GOLD"
                          ? formatGoldQuantityCell(p.quantity, p.goldSubtype)
                          : p.quantity.toLocaleString("tr-TR", {
                              maximumFractionDigits: 4,
                            })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="tabular-nums">
                          {formatMoneyAmount(p.avgCostPerUnitTry, currency)}{" "}
                          <span className="text-muted-foreground text-xs">
                            / birim
                          </span>
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Toplam: {formatMoneyAmount(c, currency)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {hasM
                          ? formatMoneyAmount(
                              p.marketPricePerUnitTry!,
                              currency,
                            )
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatMoneyAmount(v, currency)}
                      </TableCell>
                      <TableCell
                        className={`text-right tabular-nums ${
                          pl > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : pl < 0
                              ? "text-destructive"
                              : ""
                        }`}
                      >
                        {hasM ? (
                          <>
                            {pl >= 0 ? "+" : ""}
                            {formatMoneyAmount(pl, currency)}
                          </>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Düzenle"
                            onClick={() => onEdit(p)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            aria-label="Sil"
                            onClick={() => onDelete(p.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
