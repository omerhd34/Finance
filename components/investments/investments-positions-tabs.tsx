"use client";

import { useMemo } from "react";
import {
  formatGoldQuantityCell,
  goldSubtypeLabel,
} from "@/lib/investments/gold-subtypes";
import type { LiveInvestmentQuotes } from "@/lib/investments/investment-position-math";
import {
  costBasisTry,
  hasDisplayableMarketPrice,
  pnlTry,
  valueTry,
} from "@/lib/investments/investment-position-math";
import { cn, formatMoneyAmount, sentenceCaseFirstTr } from "@/lib/common/utils";
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
  const tableColSpan = 7;
  const tabHasTitleAndCode =
    tab === "FX" || tab === "STOCK" || tab === "CRYPTO" || tab === "COMMODITY";

  const categoryTotals = useMemo(() => {
    let cost = 0;
    let val = 0;
    for (const p of items) {
      cost += costBasisTry(p);
      val += valueTry(p, liveQuotes);
    }
    return { cost, val, pnl: val - cost };
  }, [items, liveQuotes]);

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
        <TabsTrigger value="COMMODITY" className="cursor-pointer">
          Emtia
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
                : tab === "COMMODITY"
                  ? "Emtia kayıtları"
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
                  {tabHasTitleAndCode && <TableHead>Tür</TableHead>}
                  {tab === "GOLD" && <TableHead>Tür</TableHead>}
                  <TableHead className="text-right">Miktar</TableHead>
                  <TableHead className="text-right">Alış fiyatı</TableHead>
                  <TableHead className="text-right">Güncel fiyat</TableHead>
                  <TableHead className="text-right">Değer</TableHead>
                  <TableHead className="text-right">Kar/Zarar</TableHead>
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
                  const liveTrySilver =
                    p.assetType === "SILVER"
                      ? liveQuotes?.silverTryPerGram
                      : undefined;
                  const liveTryPlatinum =
                    p.assetType === "PLATINUM"
                      ? liveQuotes?.platinumTryPerGram
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
                  const liveTryCommodity =
                    p.assetType === "COMMODITY" && p.ticker?.trim()
                      ? liveQuotes?.commodityByTicker?.[
                          p.ticker.trim().toUpperCase()
                        ]
                      : undefined;
                  const unitTryDisplay =
                    typeof liveTryGold === "number" && liveTryGold > 0
                      ? liveTryGold
                      : typeof liveTrySilver === "number" && liveTrySilver > 0
                        ? liveTrySilver
                        : typeof liveTryPlatinum === "number" &&
                            liveTryPlatinum > 0
                          ? liveTryPlatinum
                          : typeof liveTryStock === "number" && liveTryStock > 0
                            ? liveTryStock
                            : typeof liveTryFx === "number" && liveTryFx > 0
                              ? liveTryFx
                              : typeof liveTryCrypto === "number" &&
                                  liveTryCrypto > 0
                                ? liveTryCrypto
                                : typeof liveTryCommodity === "number" &&
                                    liveTryCommodity > 0
                                  ? liveTryCommodity
                                  : (p.marketPricePerUnitTry ?? undefined);
                  const instrumentBadgeLabel =
                    p.ticker?.trim().toUpperCase() || p.title?.trim() || "";
                  const instrumentBadgeDisplay =
                    (p.assetType === "STOCK" ||
                      p.assetType === "FX" ||
                      p.assetType === "CRYPTO" ||
                      p.assetType === "COMMODITY") &&
                    instrumentBadgeLabel
                      ? sentenceCaseFirstTr(instrumentBadgeLabel)
                      : instrumentBadgeLabel;
                  return (
                    <TableRow key={p.id}>
                      {tabHasTitleAndCode && (
                        <TableCell>
                          {tab === "COMMODITY" &&
                          (p.assetType === "PLATINUM" ||
                            p.assetType === "SILVER") ? (
                            <Badge variant="outline">Gram</Badge>
                          ) : instrumentBadgeDisplay ? (
                            <Badge variant="outline">
                              {instrumentBadgeDisplay}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      )}
                      {tab === "GOLD" && (
                        <TableCell>
                          <Badge variant="outline">
                            {goldSubtypeLabel(p.goldSubtype)}
                          </Badge>
                        </TableCell>
                      )}
                      <TableCell className="text-right tabular-nums">
                        {tab === "GOLD"
                          ? formatGoldQuantityCell(p.quantity, p.goldSubtype)
                          : tab === "COMMODITY" &&
                              (p.assetType === "PLATINUM" ||
                                p.assetType === "SILVER")
                            ? `${p.quantity.toLocaleString("tr-TR", {
                                maximumFractionDigits: 4,
                              })}`
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
                {items.length > 0 && !loading && (
                  <TableRow
                    className={cn(
                      "border-t-2 font-medium",
                      categoryTotals.pnl > 0 &&
                        "border-emerald-500/35 bg-emerald-500/10 hover:bg-emerald-500/14 dark:border-emerald-400/30 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/55",
                      categoryTotals.pnl < 0 &&
                        "border-red-500/35 bg-red-500/10 hover:bg-red-500/14 dark:border-red-400/30 dark:bg-red-950/40 dark:hover:bg-red-950/55",
                      categoryTotals.pnl === 0 &&
                        "border-border bg-muted/35 hover:bg-muted/45 dark:bg-muted/25 dark:hover:bg-muted/35",
                    )}
                  >
                    <>
                      <TableCell className="text-muted-foreground">
                        Toplam
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        —
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="tabular-nums">
                          <span className="text-muted-foreground text-xs">
                            Toplam maliyet
                          </span>
                          <div>
                            {formatMoneyAmount(categoryTotals.cost, currency)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        —
                      </TableCell>
                      <TableCell className="text-right">
                        {formatMoneyAmount(categoryTotals.val, currency)}
                      </TableCell>
                      <TableCell
                        className={`text-right tabular-nums ${
                          categoryTotals.pnl > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : categoryTotals.pnl < 0
                              ? "text-destructive"
                              : ""
                        }`}
                      >
                        {categoryTotals.pnl >= 0 ? "+" : ""}
                        {formatMoneyAmount(categoryTotals.pnl, currency)}
                      </TableCell>
                      <TableCell />
                    </>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
