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

function formatZamanYerelTr(d: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    dateStyle: "long",
    timeStyle: "short",
  }).format(d);
}

function formatOptionalZamanYerelTr(d: Date | null | undefined): string | null {
  if (d == null) return null;
  return formatZamanYerelTr(d);
}

export type FinanceAnalyzePayload = {
  uygulamaHesabi: {
    hesapOlusturmaZamaniUtc: string;
    hesapOlusturmaYerelTr: string;
    not: string;
  };
  kullaniciProfili: {
    ad: string | null;
    meslek: string | null;
    sehir: string | null;
    ulke: string | null;
    kayitliEposta: string;
    ePostaDogrulandi: boolean;
    telefon: string | null;
    paraBirimi: string;
    bildirimlerAcik: boolean;
    plan: string;
    ayBaslangicGunu: number;
    premiumErisimBitisZamaniUtc: string | null;
    premiumErisimBitisYerelTr: string | null;
    not: string;
  };
  shopierOdemeKayitlari: {
    kayitlar: {
      siparisKodu: string;
      durum: string;
      tutarTry: number | null;
      odemeZamaniUtc: string | null;
      odemeYerelTr: string | null;
      planHakkiVerilmeZamaniUtc: string | null;
      planHakkiVerilmeYerelTr: string | null;
      siparisOlusturmaZamaniUtc: string;
      siparisOlusturmaYerelTr: string;
    }[];
    not: string;
  };
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

  const [
    dbUser,
    transactions,
    incomeTransactions,
    debts,
    investmentRows,
    shopierRows,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        monthStartDay: true,
        currency: true,
        createdAt: true,
        name: true,
        profession: true,
        city: true,
        country: true,
        email: true,
        emailVerified: true,
        phone: true,
        notificationsEnabled: true,
        planTier: true,
        premiumUntil: true,
      },
    }),
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
    prisma.shopierOrder.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        orderCode: true,
        status: true,
        amountTry: true,
        paidAt: true,
        planGrantedAt: true,
        createdAt: true,
      },
    }),
  ]);
  if (!dbUser) {
    throw new Error("Kullanıcı bulunamadı.");
  }

  const ayGun = dbUser.monthStartDay ?? 1;
  const kullaniciAyAyarlari = kullaniciAyAyarlariForPayload(ayGun);

  const kullaniciProfili: FinanceAnalyzePayload["kullaniciProfili"] = {
    ad: dbUser.name,
    meslek: dbUser.profession,
    sehir: dbUser.city,
    ulke: dbUser.country,
    kayitliEposta: dbUser.email,
    ePostaDogrulandi: dbUser.emailVerified != null,
    telefon: dbUser.phone,
    paraBirimi: dbUser.currency ?? "TL",
    bildirimlerAcik: dbUser.notificationsEnabled,
    plan: dbUser.planTier,
    ayBaslangicGunu: ayGun,
    premiumErisimBitisZamaniUtc: dbUser.premiumUntil?.toISOString() ?? null,
    premiumErisimBitisYerelTr: formatOptionalZamanYerelTr(dbUser.premiumUntil),
    not: "Kullanıcının IQfinans profil kaydıdır (şifre ve profil resmi JSON’da yoktur). `plan` güncel plan seviyesidir (ör. free, premium). `premiumErisimBitisZamaniUtc` Premium erişiminin bittiği anı gösterir; `plan` free iken geçmişten kalan bir tarih olabilir. “Ödeme ne zaman / son ödeme / premium ne zaman bitiyor?” sorularında bu alanlarla birlikte `shopierOdemeKayitlari` kayıtlarına bakın. Tarih ve saat kullanıcıya aktarırken yerel alanları (`*YerelTr`) tercih edin.",
  };

  const shopierOdemeKayitlari: FinanceAnalyzePayload["shopierOdemeKayitlari"] =
    {
      kayitlar: shopierRows.map((o) => ({
        siparisKodu: o.orderCode,
        durum: o.status,
        tutarTry: o.amountTry,
        odemeZamaniUtc: o.paidAt?.toISOString() ?? null,
        odemeYerelTr: formatOptionalZamanYerelTr(o.paidAt),
        planHakkiVerilmeZamaniUtc: o.planGrantedAt?.toISOString() ?? null,
        planHakkiVerilmeYerelTr: formatOptionalZamanYerelTr(o.planGrantedAt),
        siparisOlusturmaZamaniUtc: o.createdAt.toISOString(),
        siparisOlusturmaYerelTr: formatZamanYerelTr(o.createdAt),
      })),
      not: "Shopier üzerinden oluşturulan ödeme kayıtları (en yeniden eskiye). Başarılı ödemelerde genelde `odemeZamaniUtc` / `odemeYerelTr` doludur; Premium’un hesaba işlendiği an `planHakkiVerilmeZamaniUtc` ile gösterilebilir. `durum` örneğin PENDING veya PAID olabilir; kesin anlamı üretimdeki akışa bağlıdır.",
    };

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
    uygulamaHesabi: {
      hesapOlusturmaZamaniUtc: dbUser.createdAt.toISOString(),
      hesapOlusturmaYerelTr: formatZamanYerelTr(dbUser.createdAt),
      not: "Bu zaman damgası IQfinans’ta kullanıcı hesabınızın ilk oluşturulduğu andır. “Uygulamayı ne zamandır kullanıyorum / ne zaman kayıt oldum?” gibi sorularda yanıtı buna dayandırın; gerçek kullanım süresi ile kayıt süresi aynı olmayabilir ancak elimizdeki tek kesin kayıt budur. `hesapOlusturmaYerelTr` Türkiye saatidir (tarih ve saat-dakika).",
    },
    kullaniciProfili,
    shopierOdemeKayitlari,
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
