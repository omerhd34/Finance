"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import {
  displayAmountToTry,
  normalizeUserCurrency,
} from "@/lib/common/currency";
import { goldSubtypeLabel } from "@/lib/investments/gold-subtypes";
import { PLATINUM_INVESTMENT_TITLE } from "@/lib/investments/platinum-investment";
import { SILVER_INVESTMENT_TITLE } from "@/lib/investments/silver-investment";
import { parseOptionalUnitPrice } from "@/lib/investments/investment-unit-price";
import {
  costBasisTry,
  valueTry,
} from "@/lib/investments/investment-position-math";
import { useCommodityLiveQuotes } from "@/hooks/use-commodity-live-quotes";
import { useCryptoLiveQuotes } from "@/hooks/use-crypto-live-quotes";
import { useFxLiveQuotes } from "@/hooks/use-fx-live-quotes";
import { useGoldLivePrices } from "@/hooks/use-gold-live-prices";
import { usePlatinumLivePrices } from "@/hooks/use-platinum-live-prices";
import { useSilverLivePrices } from "@/hooks/use-silver-live-prices";
import { useStockLiveQuotes } from "@/hooks/use-stock-live-quotes";
import type { PositionFormValues } from "@/lib/investments/investments-schema";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addInvestment,
  deleteInvestment,
  fetchInvestments,
  updateInvestment,
} from "@/store/slices/investmentsSlice";
import type {
  InvestmentAssetType,
  InvestmentPosition,
} from "@/types/investment";
import { DeleteInvestmentDialog } from "@/components/investments/delete-investment-dialog";
import { EditPositionDialog } from "@/components/investments/edit-position-dialog";
import { InvestmentsPageHeader } from "@/components/investments/investments-page-header";
import { InvestmentsPortfolioCharts } from "@/components/investments/investments-portfolio-charts";
import { InvestmentsPositionsTabs } from "@/components/investments/investments-positions-tabs";
import { InvestmentsSummaryCards } from "@/components/investments/investments-summary-cards";
import { PremiumPlanNotice } from "@/components/premium/premium-plan-notice";
import { DataLoadingShell } from "@/components/ui/data-loading-shell";
import { DashboardEmailVerificationBanner } from "@/components/dashboard/dashboard-email-verification-banner";
import { normalizePlanTier } from "@/lib/premium/plan-tier";

const PREMIUM_INVESTMENT_PERKS = [
  "Hisse, döviz, kripto, emtia ve altın kayıtlarını ekleyip düzenlemek veya silmek",
  "Ortalama maliyet, güncel birim fiyat ve tahmini portföy değeri ile kar / zarar özeti",
  "Kayıt bazında not tutmak ve fiyatları güncel tutmak",
  "Ana panelde yatırım Kar/Zarar kartı ile özetleri birlikte görmek",
] as const;

export default function InvestmentsPage() {
  const dispatch = useAppDispatch();
  const authLoading = useAppSelector((s) => s.auth.loading);
  const authPlanTier = useAppSelector((s) => s.auth.user?.planTier);
  const planPremium = normalizePlanTier(authPlanTier) === "premium";
  const { items, loading, error } = useAppSelector((s) => s.investments);
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const [tab, setTab] = useState<InvestmentAssetType>("GOLD");
  const [newOpen, setNewOpen] = useState(false);
  const [editing, setEditing] = useState<InvestmentPosition | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const goldLive = useGoldLivePrices(planPremium);
  const silverLive = useSilverLivePrices(planPremium);
  const platinumLive = usePlatinumLivePrices(planPremium);
  const stockLive = useStockLiveQuotes(planPremium);
  const fxLive = useFxLiveQuotes(planPremium);
  const cryptoLive = useCryptoLiveQuotes(planPremium);
  const commodityLive = useCommodityLiveQuotes(planPremium);

  const liveQuotes = useMemo(
    () => ({
      gold: goldLive.prices,
      silverTryPerGram:
        typeof silverLive.priceTryPerGram === "number"
          ? silverLive.priceTryPerGram
          : undefined,
      platinumTryPerGram:
        typeof platinumLive.priceTryPerGram === "number"
          ? platinumLive.priceTryPerGram
          : undefined,
      stockByTicker: stockLive.byTicker,
      fxByCode: fxLive.byCode,
      cryptoByTicker: cryptoLive.byTicker,
      commodityByTicker: commodityLive.byTicker,
    }),
    [
      goldLive.prices,
      silverLive.priceTryPerGram,
      platinumLive.priceTryPerGram,
      stockLive.byTicker,
      fxLive.byCode,
      cryptoLive.byTicker,
      commodityLive.byTicker,
    ],
  );

  useEffect(() => {
    if (!planPremium) return;
    void dispatch(fetchInvestments());
  }, [dispatch, planPremium]);

  useEffect(() => {
    if (tab === "PLATINUM" || tab === "SILVER") setTab("COMMODITY");
  }, [tab]);

  const filtered = useMemo(() => {
    if (tab === "COMMODITY") {
      return items.filter(
        (p) =>
          p.assetType === "COMMODITY" ||
          p.assetType === "PLATINUM" ||
          p.assetType === "SILVER",
      );
    }
    return items.filter((p) => p.assetType === tab);
  }, [items, tab]);

  const totals = useMemo(() => {
    let cost = 0;
    let val = 0;
    for (const p of items) {
      cost += costBasisTry(p);
      val += valueTry(p, liveQuotes);
    }
    return { cost, val, pnl: val - cost };
  }, [items, liveQuotes]);

  const editingResolved = useMemo(() => {
    if (!editing) return null;
    return items.find((x) => x.id === editing.id) ?? editing;
  }, [editing, items]);

  async function onCreate(values: PositionFormValues) {
    const m = parseOptionalUnitPrice(values.marketPricePerUnit);
    await dispatch(
      addInvestment({
        assetType: values.assetType,
        goldSubtype:
          values.assetType === "GOLD" ? (values.goldSubtype ?? null) : null,
        title:
          values.assetType === "GOLD"
            ? goldSubtypeLabel(values.goldSubtype)
            : values.assetType === "STOCK"
              ? (values.ticker ?? "").trim().toUpperCase()
              : (values.title ?? "").trim(),
        ticker:
          values.assetType === "STOCK" ||
          values.assetType === "FX" ||
          values.assetType === "CRYPTO" ||
          values.assetType === "COMMODITY"
            ? values.ticker?.trim().toUpperCase()
            : null,
        quantity: values.quantity,
        avgCostPerUnitTry: displayAmountToTry(
          values.avgCostPerUnit,
          values.assetType === "COMMODITY"
            ? normalizeUserCurrency(values.avgCostEntryCurrency ?? currency)
            : normalizeUserCurrency(currency),
        ),
        marketPricePerUnitTry:
          m != null
            ? displayAmountToTry(
                m,
                values.assetType === "COMMODITY"
                  ? normalizeUserCurrency(
                      values.avgCostEntryCurrency ?? currency,
                    )
                  : normalizeUserCurrency(currency),
              )
            : null,
        note: values.note?.trim() ? values.note.trim() : null,
      }),
    );
    void dispatch(fetchInvestments());
  }

  async function onEditSave(positionId: string, values: PositionFormValues) {
    const m = parseOptionalUnitPrice(values.marketPricePerUnit);
    await dispatch(
      updateInvestment({
        id: positionId,
        body: {
          assetType: values.assetType,
          goldSubtype:
            values.assetType === "GOLD" ? (values.goldSubtype ?? null) : null,
          title:
            values.assetType === "GOLD"
              ? goldSubtypeLabel(values.goldSubtype)
              : values.assetType === "SILVER"
                ? SILVER_INVESTMENT_TITLE
                : values.assetType === "PLATINUM"
                  ? PLATINUM_INVESTMENT_TITLE
                  : values.assetType === "STOCK"
                    ? (values.ticker ?? "").trim().toUpperCase()
                    : (values.title ?? "").trim(),
          ticker:
            values.assetType === "STOCK" ||
            values.assetType === "FX" ||
            values.assetType === "CRYPTO" ||
            values.assetType === "COMMODITY"
              ? values.ticker?.trim().toUpperCase()
              : null,
          quantity: values.quantity,
          avgCostPerUnitTry: displayAmountToTry(
            values.avgCostPerUnit,
            values.assetType === "COMMODITY"
              ? normalizeUserCurrency(values.avgCostEntryCurrency ?? currency)
              : normalizeUserCurrency(currency),
          ),
          marketPricePerUnitTry:
            m === null
              ? null
              : displayAmountToTry(
                  m,
                  values.assetType === "COMMODITY"
                    ? normalizeUserCurrency(
                        values.avgCostEntryCurrency ?? currency,
                      )
                    : normalizeUserCurrency(currency),
                ),
          note: values.note?.trim() ? values.note.trim() : null,
        },
      }),
    );
    setEditing(null);
    void dispatch(fetchInvestments());
  }

  async function onConfirmDelete() {
    if (!deletingId) return;
    await dispatch(deleteInvestment(deletingId));
    setDeletingId(null);
    void dispatch(fetchInvestments());
  }

  const pageDataReady = !authLoading && !(planPremium && loading);

  return (
    <DataLoadingShell ready={pageDataReady}>
      <div className="space-y-6">
        <DashboardEmailVerificationBanner />
        {!planPremium ? (
          <>
            <div className="rounded-2xl border border-border/80 bg-card/50 p-5 shadow-sm">
              <p className="text-sm font-semibold text-foreground">
                Premium ile neler kazanırsınız?
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                {PREMIUM_INVESTMENT_PERKS.map((line) => (
                  <li key={line} className="flex gap-3">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500/90"
                      aria-hidden
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <PremiumPlanNotice title="Yatırım takibi Premium plandadır." />
          </>
        ) : null}

        {planPremium ? (
          <>
            <InvestmentsPageHeader
              newOpen={newOpen}
              onNewOpenChange={setNewOpen}
              listTab={tab}
              currency={currency}
              onCreate={onCreate}
            />

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            {goldLive.error && tab === "GOLD" && (
              <p className="text-sm text-muted-foreground" role="status">
                Canlı altın fiyatı yüklenemedi ({goldLive.error}). Güncel fiyat
                sütununda yalnızca kayıtlı değerler veya alış fiyatı kullanılır.
              </p>
            )}

            {silverLive.error &&
              tab === "COMMODITY" &&
              items.some((p) => p.assetType === "SILVER") && (
                <p className="text-sm text-muted-foreground" role="status">
                  Eski gümüş (gram) kayıtları için canlı fiyat yüklenemedi (
                  {silverLive.error}). Güncel fiyat sütununda yalnızca kayıtlı
                  değerler veya alış fiyatı kullanılır.
                </p>
              )}

            {platinumLive.error &&
              tab === "COMMODITY" &&
              items.some((p) => p.assetType === "PLATINUM") && (
                <p className="text-sm text-muted-foreground" role="status">
                  Eski platin (gram) kayıtları için canlı fiyat yüklenemedi (
                  {platinumLive.error}). Güncel fiyat sütununda yalnızca kayıtlı
                  değerler veya alış fiyatı kullanılır.
                </p>
              )}

            {stockLive.error && tab === "STOCK" && (
              <p className="text-sm text-muted-foreground" role="status">
                Canlı hisse fiyatları yüklenemedi ({stockLive.error}). Güncel
                fiyat sütununda yalnızca kayıtlı değerler veya alış fiyatı
                kullanılır.
              </p>
            )}

            {fxLive.error && tab === "FX" && (
              <p className="text-sm text-muted-foreground" role="status">
                Canlı döviz kurları yüklenemedi ({fxLive.error}). Güncel fiyat
                sütununda yalnızca kayıtlı değerler veya alış fiyatı kullanılır.
              </p>
            )}

            {cryptoLive.error && tab === "CRYPTO" && (
              <p className="text-sm text-muted-foreground" role="status">
                Canlı kripto fiyatları yüklenemedi ({cryptoLive.error}). Güncel
                fiyat sütununda yalnızca kayıtlı değerler veya alış fiyatı
                kullanılır.
              </p>
            )}

            {commodityLive.error && tab === "COMMODITY" && (
              <p className="text-sm text-muted-foreground" role="status">
                Canlı emtia fiyatları yüklenemedi ({commodityLive.error}).
                Güncel fiyat sütununda yalnızca kayıtlı değerler veya alış
                fiyatı kullanılır.
              </p>
            )}

            <InvestmentsSummaryCards
              totalCost={totals.cost}
              totalValue={totals.val}
              pnl={totals.pnl}
              currency={currency}
            />

            <InvestmentsPositionsTabs
              tab={tab}
              onTabChange={setTab}
              items={filtered}
              loading={loading}
              currency={currency}
              liveQuotes={liveQuotes}
              onEdit={setEditing}
              onDelete={setDeletingId}
            />

            <InvestmentsPortfolioCharts
              items={items}
              liveQuotes={liveQuotes}
              currency={currency}
            />

            <EditPositionDialog
              position={editingResolved}
              open={!!editing}
              onOpenChange={(o) => !o && setEditing(null)}
              currency={currency}
              onSave={onEditSave}
            />

            <DeleteInvestmentDialog
              open={!!deletingId}
              onOpenChange={(o) => !o && setDeletingId(null)}
              onConfirm={() => void onConfirmDelete()}
            />
          </>
        ) : null}
      </div>
    </DataLoadingShell>
  );
}
