import type { FinanceAnalyzePayload } from "@/lib/ai/build-finance-analyze-payload";

function formatTry(n: number): string {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

function topExpenseCategories(
  rows: FinanceAnalyzePayload["mevcutDonemHarcamalar"],
  limit: number,
): { label: string; total: number }[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const label = r.altKategori
      ? `${r.kategori} – ${r.altKategori}`
      : r.kategori;
    const v = typeof r.tutar === "number" ? r.tutar : Number(r.tutar);
    if (!Number.isFinite(v)) continue;
    map.set(label, (map.get(label) ?? 0) + v);
  }
  return [...map.entries()]
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

function topIncomeCategories(
  rows: FinanceAnalyzePayload["mevcutDonemGelirler"],
  limit: number,
): { label: string; total: number }[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const v = typeof r.tutar === "number" ? r.tutar : Number(r.tutar);
    if (!Number.isFinite(v)) continue;
    map.set(r.kategori, (map.get(r.kategori) ?? 0) + v);
  }
  return [...map.entries()]
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

function formatVadeTr(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("tr-TR");
}

export function buildMessagingDigestFromPayload(
  payload: FinanceAnalyzePayload,
): string {
  const expenses = payload.mevcutDonemHarcamalar;
  const totalExpense = expenses.reduce((s, r) => {
    const v = typeof r.tutar === "number" ? r.tutar : Number(r.tutar);
    return s + (Number.isFinite(v) ? v : 0);
  }, 0);
  const incomes = payload.mevcutDonemGelirler;
  const { mevcutDonemToplamGelir, gelirKayitSayisi } = payload.gelirOzeti;
  const netFlow = mevcutDonemToplamGelir - totalExpense;
  const { toplamAlacakKalan, toplamBorcKalan, netPozisyon } =
    payload.borcVeAlacaklar.ozet;
  const topExp = topExpenseCategories(expenses, 5);
  const topInc = topIncomeCategories(incomes, 5);
  const donemGunSayisi = Math.max(1, payload.harcamaPenceresi.donemGunSayisi);
  const gunlukOrtGider = totalExpense / donemGunSayisi;
  const gunlukOrtGelir = mevcutDonemToplamGelir / donemGunSayisi;

  const lines: string[] = [
    `📊 IQfinansAI — kısa özet (${new Date().toLocaleDateString("tr-TR")})`,
    "",
    `Mevcut bütçe dönemi — ${donemGunSayisi} gün (pencere: ${payload.harcamaPenceresi.baslangic.slice(0, 10)} → ${payload.harcamaPenceresi.bitis.slice(0, 10)})`,
    `• Toplam gider: ${formatTry(totalExpense)} TL (${expenses.length} kayıt)`,
    `• Günlük ortalama gider: ~${formatTry(gunlukOrtGider)} TL`,
    `• Toplam gelir: ${formatTry(mevcutDonemToplamGelir)} TL (${gelirKayitSayisi} kayıt)`,
    `• Günlük ortalama gelir: ~${formatTry(gunlukOrtGelir)} TL`,
    `• Net (gelir − gider): ${formatTry(netFlow)} TL`,
  ];

  if (mevcutDonemToplamGelir > 0) {
    const tasarrufOrani = (netFlow / mevcutDonemToplamGelir) * 100;
    lines.push(
      `• Gelire göre net oran: ~${tasarrufOrani.toFixed(1).replace(".", ",")}%`,
    );
  }

  const refUcret = payload.referansAsgariUcretNetAylikTl;
  if (refUcret != null && refUcret > 0) {
    const kat = netFlow / refUcret;
    lines.push(
      "",
      `Referans net asgari ücret (~${formatTry(refUcret)} TL/ay, ortam değişkeni): mevcut dönem net akışının bu tutara oranı ~${kat.toFixed(2).replace(".", ",")}× (yalnızca kabaca ölçek; resmi hesap değildir).`,
    );
  }

  lines.push("", `Not (pencere): ${payload.harcamaPenceresi.not}`);

  const ayGun = payload.kullaniciAyAyarlari.ayBaslangicGunu;
  if (ayGun !== 1) {
    lines.push(
      "",
      `Bütçe dönemi: Ayın ${ayGun}. günü başlangıçlı özel dönem kullanılıyor (takvim ayı yerine bu kesit).`,
    );
  }

  lines.push(
    "",
    `Borç/alacak özeti: kalan alacak ${formatTry(toplamAlacakKalan)} TL, kalan borç ${formatTry(toplamBorcKalan)} TL, net ${formatTry(netPozisyon)} TL.`,
  );

  const borcDetay = [...payload.borcVeAlacaklar.kayitlar]
    .filter((k) => k.kalanTutar > 0)
    .sort((a, b) => b.kalanTutar - a.kalanTutar)
    .slice(0, 8);
  if (borcDetay.length > 0) {
    lines.push("", "Borç/alacak kalemleri (kalan tutara göre):");
    for (const k of borcDetay) {
      const yon = k.yon === "alacak" ? "Alacak" : "Borç";
      const vade = formatVadeTr(k.vade);
      const vadePart = vade ? `, vade ${vade}` : "";
      lines.push(
        `• ${yon}: ${k.karsiTaraf} — kalan ${formatTry(k.kalanTutar)} TL (toplam ${formatTry(k.toplamTutar)} TL, ödenen ${formatTry(k.odenen)} TL${vadePart})`,
      );
    }
  }

  if (topExp.length > 0) {
    lines.push("", "En yüksek gider kalemleri (kategori):");
    topExp.forEach((t, i) => {
      lines.push(`${i + 1}. ${t.label}: ${formatTry(t.total)} TL`);
    });
  }
  if (topInc.length > 0) {
    lines.push("", "En yüksek gelir kalemleri (kategori):");
    topInc.forEach((t, i) => {
      lines.push(`${i + 1}. ${t.label}: ${formatTry(t.total)} TL`);
    });
  }

  if (payload.yatirimlar) {
    const y = payload.yatirimlar.ozet;
    lines.push(
      "",
      `Yatırım özeti (kayıtlı): ${y.pozisyonSayisi} pozisyon, maliyet ~${formatTry(y.toplamMaliyetTry)} TL, tahmini değer ~${formatTry(y.tahminiToplamDegerTry)} TL, tahmini K/Z ~${formatTry(y.tahminiToplamPnlTry)} TL (${payload.yatirimlar.paraBirimi}).`,
    );
    const posTop = [...payload.yatirimlar.pozisyonlar]
      .sort((a, b) => b.tahminiDegerTry - a.tahminiDegerTry)
      .slice(0, 8);
    if (posTop.length > 0) {
      lines.push("", "En yüksek tahmini değerli pozisyonlar:");
      for (const p of posTop) {
        const kod = p.kod ? ` ${p.kod}` : "";
        const alt = p.altinAltTuru ? `, ${p.altinAltTuru}` : "";
        lines.push(
          `• ${p.baslik}${kod} (${p.varlikTuru}${alt}) — ~${formatTry(p.tahminiDegerTry)} TL, K/Z ~${formatTry(p.tahminiPnlTry)} TL`,
        );
      }
    }
  }
  lines.push(
    "",
    "Bu metin uygulamadaki kayıtlara dayanır; yatırım tavsiyesi değildir.",
  );
  return lines.join("\n");
}
