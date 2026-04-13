import { NextResponse } from "next/server";

function parseTcmbNumber(raw: string): number {
  const t = raw.trim();
  if (t.includes(",") && t.includes(".")) {
    return parseFloat(t.replace(/\./g, "").replace(",", "."));
  }
  if (t.includes(",")) return parseFloat(t.replace(",", "."));
  return parseFloat(t);
}

function extractTcmbRate(xml: string, kod: string): number | null {
  const re = new RegExp(
    `<Currency[^>]*Kod="${kod}"[^>]*>([\\s\\S]*?)</Currency>`,
    "i",
  );
  const block = xml.match(re);
  if (!block) return null;
  const selling = block[1].match(/<ForexSelling>([^<]+)<\/ForexSelling>/i);
  const buying = block[1].match(/<ForexBuying>([^<]+)<\/ForexBuying>/i);
  const raw = (selling?.[1] ?? buying?.[1])?.trim();
  if (!raw) return null;
  const n = parseTcmbNumber(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function fetchFromTcmb(): Promise<Record<string, number> | null> {
  const res = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml", {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const xml = await res.text();
  const out: Record<string, number> = {};
  for (const code of ["USD", "EUR", "GBP"] as const) {
    const v = extractTcmbRate(xml, code);
    if (v != null) out[code] = v;
  }
  return Object.keys(out).length ? out : null;
}

async function fetchFromFrankfurter(): Promise<Record<string, number> | null> {
  const res = await fetch(
    "https://api.frankfurter.app/latest?from=TL&to=USD,EUR,GBP",
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { rates?: Record<string, number> };
  if (!data.rates) return null;
  const out: Record<string, number> = {};
  for (const code of ["USD", "EUR", "GBP"] as const) {
    const perTry = data.rates[code];
    if (typeof perTry === "number" && perTry > 0) {
      out[code] = 1 / perTry;
    }
  }
  return Object.keys(out).length ? out : null;
}

export async function GET() {
  try {
    let rates = await fetchFromTcmb();
    let source: "tcmb" | "frankfurter" = "tcmb";
    if (!rates) {
      rates = await fetchFromFrankfurter();
      source = "frankfurter";
    }
    if (!rates) {
      return NextResponse.json(
        { error: "Kurlar alınamadı", rates: null },
        { status: 503 },
      );
    }
    return NextResponse.json({
      rates,
      source,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Kurlar alınamadı", rates: null },
      { status: 503 },
    );
  }
}
