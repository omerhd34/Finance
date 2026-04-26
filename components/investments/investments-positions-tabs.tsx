"use client";

import { formatGoldQuantityCell, goldSubtypeLabel } from "@/lib/gold-subtypes";
import type { LiveInvestmentQuotes } from "@/lib/investment-position-math";
import {
  costBasisTry,
  hasDisplayableMarketPrice,
  pnlTry,
  valueTry,
} from "@/lib/investment-position-math";
import { currencySymbolLabel, formatMoneyAmount } from "@/lib/utils";
import type {
  InvestmentAssetType,
  InvestmentPosition,
} from "@/types/investment";
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
import { Loader2, Pencil, Trash2 } from "lucide-react";

type TabValue = InvestmentAssetType;

type Props = {
  tab: TabValue;
  onTabChange: (tab: TabValue) => void;
  items: InvestmentPosition[];
  loading: boolean;
  currency: string;
  liveQuotes?: LiveInvestmentQuotes;
  onEdit: (position: InvestmentPosition) => void;
  onDelete: (id: string) => void;
};

export function InvestmentsPositionsTabs({
  tab,
  onTabChange,
  items,
  loading,
  currency,
  liveQuotes,
  onEdit,
  onDelete,
}: Props) {
  const tableColSpan = tab === "GOLD" ? 7 : 8;
  const tabHasTitleAndCode = tab !== "GOLD";

  return (
    <Tabs value={tab} onValueChange={(v) => onTabChange(v as TabValue)}>
      <TabsList>
        <TabsTrigger value="GOLD" className="cursor-pointer">
          Altın
        </TabsTrigger>
        <TabsTrigger value="FX" className="cursor-pointer">
          Döviz
        </TabsTrigger>
        <TabsTrigger value="STOCK" className="cursor-pointer">
          Hisse senedi
        </TabsTrigger>
        <TabsTrigger value="CRYPTO" className="cursor-pointer">
          Kripto
        </TabsTrigger>
      </TabsList>
      <TabsContent value={tab} className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {tab === "GOLD"
                ? "Altın kayıtları"
                : tab === "STOCK"
                  ? "Hisse kayıtları"
                  : tab === "FX"
                    ? "Döviz kayıtları"
                    : tab === "CRYPTO"
                      ? "Kripto kayıtları"
                      : "Kayıtlar"}
            </CardTitle>
            <CardDescription className="inline-flex min-h-5 items-center gap-2">
              {loading ? (
                <>
                  <Loader2
                    className="h-3.5 w-3.5 shrink-0 animate-spin text-primary"
                    aria-hidden
                  />
                  <span className="sr-only">Yükleniyor</span>
                </>
              ) : (
                `${items.length} kayıt`
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {tabHasTitleAndCode && <TableHead>Başlık</TableHead>}
                  {tab === "GOLD" && <TableHead>Altın türü</TableHead>}
                  {tabHasTitleAndCode && <TableHead>Kod</TableHead>}
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
                      colSpan={tableColSpan}
                      className="text-center text-muted-foreground"
                    >
                      Henüz kayıt yok. &quot;Kayıt ekle&quot; ile başlayın.
                    </TableCell>
                  </TableRow>
                )}
                {items.map((p) => {
                  const c = costBasisTry(p);
                  const v = valueTry(p, liveQuotes);
                  const pl = pnlTry(p, liveQuotes);
                  const hasM = hasDisplayableMarketPrice(p, liveQuotes);
                  const liveTryGold =
                    p.assetType === "GOLD" && p.goldSubtype
                      ? liveQuotes?.gold?.[p.goldSubtype]
                      : undefined;
                  const liveTryStock =
                    p.assetType === "STOCK" && p.ticker?.trim()
                      ? liveQuotes?.stockByTicker?.[
                          p.ticker.trim().toUpperCase()
                        ]
                      : undefined;
                  const liveTryFx =
                    p.assetType === "FX" && p.ticker?.trim()
                      ? liveQuotes?.fxByCode?.[p.ticker.trim().toUpperCase()]
                      : undefined;
                  const liveTryCrypto =
                    p.assetType === "CRYPTO" && p.ticker?.trim()
                      ? liveQuotes?.cryptoByTicker?.[
                          p.ticker.trim().toUpperCase()
                        ]
                      : undefined;
                  const unitTryDisplay =
                    typeof liveTryGold === "number" && liveTryGold > 0
                      ? liveTryGold
                      : typeof liveTryStock === "number" && liveTryStock > 0
                        ? liveTryStock
                        : typeof liveTryFx === "number" && liveTryFx > 0
                          ? liveTryFx
                          : typeof liveTryCrypto === "number" &&
                              liveTryCrypto > 0
                            ? liveTryCrypto
                            : (p.marketPricePerUnitTry ?? undefined);
                  return (
                    <TableRow key={p.id}>
                      {tabHasTitleAndCode && (
                        <TableCell className="font-medium">{p.title}</TableCell>
                      )}
                      {tab === "GOLD" && (
                        <TableCell>
                          <Badge variant="outline">
                            {goldSubtypeLabel(p.goldSubtype)}
                          </Badge>
                        </TableCell>
                      )}
                      {tabHasTitleAndCode && (
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
                        {unitTryDisplay != null &&
                        typeof unitTryDisplay === "number" &&
                        unitTryDisplay > 0
                          ? formatMoneyAmount(unitTryDisplay, currency)
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
                            className="cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive cursor-pointer"
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
