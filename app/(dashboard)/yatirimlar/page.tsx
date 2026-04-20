"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { displayAmountToTry } from "@/lib/currency";
import { goldSubtypeLabel } from "@/lib/gold-subtypes";
import { parseOptionalUnitPrice } from "@/lib/investment-unit-price";
import { costBasisTry, valueTry } from "@/lib/investment-position-math";
import type { PositionFormValues } from "@/lib/investments-schema";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addInvestment,
  deleteInvestment,
  fetchInvestments,
  updateInvestment,
} from "@/store/slices/investmentsSlice";
import type { InvestmentPosition } from "@/types/investment";
import { DeleteInvestmentDialog } from "@/components/investments/delete-investment-dialog";
import { EditPositionDialog } from "@/components/investments/edit-position-dialog";
import { InvestmentsPageHeader } from "@/components/investments/investments-page-header";
import { InvestmentsPositionsTabs } from "@/components/investments/investments-positions-tabs";
import { InvestmentsSummaryCards } from "@/components/investments/investments-summary-cards";
import { PremiumPlanNotice } from "@/components/premium/premium-plan-notice";
import { normalizePlanTier } from "@/lib/plan-tier";

const PREMIUM_INVESTMENT_PERKS = [
  "Hisse senedi ve altın (gram, çeyrek vb.) pozisyonlarını ekleyip düzenlemek veya silmek",
  "Ortalama maliyet, güncel birim fiyat ve tahmini portföy değeri ile kar / zarar özeti",
  "Pozisyon bazında not tutmak ve fiyatları güncel tutmak",
  "Ana panelde yatırım Kar/Zarar kartı ile hisse ve altın özetlerini birlikte görmek",
] as const;

export default function InvestmentsPage() {
  const dispatch = useAppDispatch();
  const authPlanTier = useAppSelector((s) => s.auth.user?.planTier);
  const planPremium = normalizePlanTier(authPlanTier) === "premium";
  const { items, loading, error } = useAppSelector((s) => s.investments);
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const [tab, setTab] = useState<"GOLD" | "STOCK">("GOLD");
  const [newOpen, setNewOpen] = useState(false);
  const [editing, setEditing] = useState<InvestmentPosition | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!planPremium) return;
    void dispatch(fetchInvestments());
  }, [dispatch, planPremium]);

  const filtered = useMemo(
    () => items.filter((p) => p.assetType === tab),
    [items, tab],
  );

  const totals = useMemo(() => {
    let cost = 0;
    let val = 0;
    for (const p of filtered) {
      cost += costBasisTry(p);
      val += valueTry(p);
    }
    return { cost, val, pnl: val - cost };
  }, [filtered]);

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
            : (values.title ?? "").trim(),
        ticker:
          values.assetType === "STOCK"
            ? values.ticker?.trim().toUpperCase()
            : null,
        quantity: values.quantity,
        avgCostPerUnitTry: displayAmountToTry(values.avgCostPerUnit, currency),
        marketPricePerUnitTry:
          m != null ? displayAmountToTry(m, currency) : null,
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
              : (values.title ?? "").trim(),
          ticker:
            values.assetType === "STOCK"
              ? values.ticker?.trim().toUpperCase()
              : null,
          quantity: values.quantity,
          avgCostPerUnitTry: displayAmountToTry(
            values.avgCostPerUnit,
            currency,
          ),
          marketPricePerUnitTry:
            m === null ? null : displayAmountToTry(m, currency),
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

  return (
    <div className="space-y-6">
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

      <InvestmentsPageHeader
        newOpen={planPremium && newOpen}
        onNewOpenChange={(open) => {
          if (open && !planPremium) return;
          setNewOpen(open);
        }}
        listTab={tab}
        currency={currency}
        onCreate={onCreate}
        addDisabled={!planPremium}
      />

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
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
        onEdit={setEditing}
        onDelete={setDeletingId}
        actionsDisabled={!planPremium}
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
    </div>
  );
}
