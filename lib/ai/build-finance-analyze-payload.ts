import { debt, investmentPosition, prisma } from "@/lib/db/prisma";
import { goldSubtypeLabel } from "@/lib/investments/gold-subtypes";
import {
  costBasisTry,
  pnlTry,
  totalInvestmentPnlTry,
  valueTry,
} from "@/lib/investments/investment-position-math";
import { EXPENSE_CATEGORY_TREE } from "@/lib/domain/categories";
import type { Transaction } from "@prisma/client";
import type { Debt } from "@/types/debt";
import type {
  InvestmentAssetType,
  InvestmentPosition,
} from "@/types/investment";

export type FinanceTxPayload = {
  tarih: string;
  kategori: string;
  altKategori: string | null;
  tutar: unknown;
  aciklama: string | null;
}[];

export type FinanceGelirPayload = {
  tarih: string;
  kategori: string;
  tutar: unknown;
  aciklama: string | null;
}[];

export type FinanceDebtLine = {
  yon: "alacak" | "borç";
  karsiTaraf: string;
  toplamTutar: number;
  odenen: number;
  kalanTutar: number;
  vade: string | null;
  not: string | null;
};

export type FinanceAnalyzePayload = {
  kullaniciAyAyarlari: {
    ayBaslangicGunu: number;
    butceDonemiNotu: string;
  };
  harcamaPenceresi: { baslangic: string; bitis: string; not: string };
  gelirOzeti: {
    son30GunToplamGelir: number;
    gelirKayitSayisi: number;
  };
  referansAsgariUcretNetAylikTl: number | null;
  giderKategoriSemasi: typeof EXPENSE_CATEGORY_TREE;
  son30GunHarcamalar: FinanceTxPayload;
  son30GunGelirler: FinanceGelirPayload;
  borcVeAlacaklar: {
    kayitlar: FinanceDebtLine[];
    ozet: {
      toplamAlacakKalan: number;
      toplamBorcKalan: number;
      netPozisyon: number;
    };
  };
  yatirimlar: {
    aciklama: string;
    paraBirimi: string;
    ozet: {
      pozisyonSayisi: number;
      toplamMaliyetTry: number;
      tahminiToplamDegerTry: number;
      tahminiToplamPnlTry: number;
    };
    pozisyonlar: {
      varlikTuru: string;
      baslik: string;
      kod: string | null;
      altinAltTuru: string | null;
      miktar: number;
      birimMaliyetTry: number;
      kayitliGuncelBirimTry: number | null;
      maliyetToplamTry: number;
      tahminiDegerTry: number;
      tahminiPnlTry: number;
    }[];
  } | null;
};

export function resolveReferansAsgariUcretNetAylik(): number | null {
  const raw = process.env.AI_ANALYZE_NET_ASGARI_UCRET_REFERANS_TRY?.trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function kullaniciAyAyarlariForPayload(ayBaslangicGunu: number): {
  ayBaslangicGunu: number;
  butceDonemiNotu: string;
} {
  const d = Math.min(28, Math.max(1, Math.trunc(ayBaslangicGunu)));
  if (d === 1) {
    return {
      ayBaslangicGunu: d,
      butceDonemiNotu:
        "Kullanıcı standart takvim ayını kullanıyor: bir bütçe dönemi, her takvim ayının 1'i ile son günü arasıdır.",
    };
  }
  const sonGun = d - 1;
  return {
    ayBaslangicGunu: d,
    butceDonemiNotu: `Kullanıcı uygulama ayarlarında her ayın ${d}. gününü ay başlangıcı olarak seçmiş. Bir bütçe dönemi, bir ayın ${d}. günü başlayıp bir sonraki ayın ${sonGun}. gününün sonuna kadar sürer (ör.: başlangıç 15 ise 15 Ocak–14 Şubat tek dönem). “Bu ay” ve “gelecek ay” önerilerinde takvim ayının 1'ini değil bu kesiti esas al.`,
  };
}

function ensureIsoDates(p: InvestmentPosition): InvestmentPosition {
  const c = p.createdAt as unknown;
  const u = p.updatedAt as unknown;
  return {
    ...p,
    createdAt: typeof c === "string" ? c : (c as Date).toISOString(),
    updatedAt: typeof u === "string" ? u : (u as Date).toISOString(),
  };
}

function assetTypeTr(t: InvestmentAssetType): string {
  const m: Record<InvestmentAssetType, string> = {
    GOLD: "Altın",
    SILVER: "Gümüş",
    PLATINUM: "Platin (gram)",
    COMMODITY: "Emtia",
    STOCK: "Hisse",
    FX: "Döviz",
    CRYPTO: "Kripto",
  };
  return m[t] ?? t;
}

export type BuildFinancePayloadOpts = {
  referenceTime?: Date;
  truncate?: { maxExpenses?: number; maxIncomes?: number };
};

export async function buildFinanceAnalyzePayload(
  userId: string,
  opts?: BuildFinancePayloadOpts,
): Promise<FinanceAnalyzePayload> {
  const analizAnı = opts?.referenceTime ?? new Date();
  const since = new Date(analizAnı);
  since.setDate(since.getDate() - 30);

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { monthStartDay: true, currency: true },
  });
  if (!dbUser) {
    throw new Error("Kullanıcı bulunamadı.");
  }

  const kullaniciAyAyarlari = kullaniciAyAyarlariForPayload(
    dbUser.monthStartDay ?? 1,
  );

  const [transactions, incomeTransactions, debts, investmentRows] =
    await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: since },
          type: "expense",
        },
        orderBy: { date: "desc" },
      }),
      prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: since },
          type: "income",
        },
        orderBy: { date: "desc" },
      }),
      debt.findMany({
        where: { userId },
        orderBy: { dueDate: "asc" },
      }),
      investmentPosition.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

  const investmentPositions = investmentRows.map(ensureIsoDates);

  const fullExpenseSum = transactions.reduce((s, t) => s + t.amount, 0);
  const fullIncomeSum = incomeTransactions.reduce((s, t) => s + t.amount, 0);

  let son30GunHarcamalar: FinanceTxPayload = transactions.map(
    (t: Transaction) => ({
      tarih: t.date.toISOString(),
      kategori: t.category,
      altKategori: t.subcategory ?? null,
      tutar: t.amount,
      aciklama: t.description,
    }),
  );

  let son30GunGelirler: FinanceGelirPayload = incomeTransactions.map(
    (t: Transaction) => ({
      tarih: t.date.toISOString(),
      kategori: t.category,
      tutar: t.amount,
      aciklama: t.description,
    }),
  );

  const maxE = opts?.truncate?.maxExpenses;
  const maxI = opts?.truncate?.maxIncomes;
  let pencereNotu =
    "İşlem tarihine göre son 30 takvim günü (ay başlangıç ayarından bağımsız pencere).";
  if (maxE != null && son30GunHarcamalar.length > maxE) {
    son30GunHarcamalar = son30GunHarcamalar.slice(0, maxE);
    pencereNotu += ` Gider satırları yalnızca en güncel ${maxE} kayıtla sınırlandı (sohbet için). Tam dönem gider toplamı yaklaşık ${Math.round(fullExpenseSum)} TL; ${transactions.length} kayıt.`;
  }
  if (maxI != null && son30GunGelirler.length > maxI) {
    son30GunGelirler = son30GunGelirler.slice(0, maxI);
    pencereNotu += ` Gelir satırları yalnızca en güncel ${maxI} kayıtla sınırlandı (sohbet için). Tam dönem gelir toplamı yaklaşık ${Math.round(fullIncomeSum)} TL; ${incomeTransactions.length} kayıt.`;
  }

  const son30GunToplamGelir = fullIncomeSum;

  let toplamAlacakKalan = 0;
  let toplamBorcKalan = 0;
  const kayitlar: FinanceDebtLine[] = debts.map((d: Debt) => {
    const kalan = Math.max(0, d.totalAmount - d.paidAmount);
    if (d.direction === "RECEIVABLE") toplamAlacakKalan += kalan;
    else toplamBorcKalan += kalan;
    const vadeRaw = d.dueDate;
    return {
      yon: d.direction === "RECEIVABLE" ? "alacak" : "borç",
      karsiTaraf: d.counterparty,
      toplamTutar: d.totalAmount,
      odenen: d.paidAmount,
      kalanTutar: kalan,
      vade:
        vadeRaw != null
          ? new Date(vadeRaw as string | Date).toISOString()
          : null,
      not: d.note,
    };
  });

  const yatirimlar: FinanceAnalyzePayload["yatirimlar"] =
    investmentPositions.length === 0
      ? null
      : {
          aciklama:
            "Yatırım menüsündeki pozisyonların özeti. Tahmini değer ve PnL, kayıtlı güncel birim fiyatı veya ortalama maliyet üzerinden yaklaşıktır; canlı kotasyon garantisi yoktur.",
          paraBirimi: dbUser.currency ?? "TL",
          ozet: {
            pozisyonSayisi: investmentPositions.length,
            toplamMaliyetTry: investmentPositions.reduce(
              (s, p) => s + costBasisTry(p),
              0,
            ),
            tahminiToplamDegerTry: investmentPositions.reduce(
              (s, p) => s + valueTry(p),
              0,
            ),
            tahminiToplamPnlTry: totalInvestmentPnlTry(investmentPositions),
          },
          pozisyonlar: investmentPositions.map((p) => ({
            varlikTuru: assetTypeTr(p.assetType),
            baslik: p.title,
            kod: p.ticker,
            altinAltTuru:
              p.assetType === "GOLD" && p.goldSubtype
                ? goldSubtypeLabel(p.goldSubtype)
                : null,
            miktar: p.quantity,
            birimMaliyetTry: p.avgCostPerUnitTry,
            kayitliGuncelBirimTry: p.marketPricePerUnitTry,
            maliyetToplamTry: costBasisTry(p),
            tahminiDegerTry: valueTry(p),
            tahminiPnlTry: pnlTry(p),
          })),
        };

  return {
    kullaniciAyAyarlari,
    harcamaPenceresi: {
      baslangic: since.toISOString(),
      bitis: analizAnı.toISOString(),
      not: pencereNotu,
    },
    gelirOzeti: {
      son30GunToplamGelir,
      gelirKayitSayisi: incomeTransactions.length,
    },
    referansAsgariUcretNetAylikTl: resolveReferansAsgariUcretNetAylik(),
    giderKategoriSemasi: EXPENSE_CATEGORY_TREE,
    son30GunHarcamalar,
    son30GunGelirler,
    borcVeAlacaklar: {
      kayitlar,
      ozet: {
        toplamAlacakKalan,
        toplamBorcKalan,
        netPozisyon: toplamAlacakKalan - toplamBorcKalan,
      },
    },
    yatirimlar,
  };
}
