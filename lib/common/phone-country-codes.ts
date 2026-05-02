export type PhoneCountryOption = { dial: string; name: string; iso2: string };

export const DEFAULT_PHONE_DIAL = "90";

export function flagEmoji(iso2: string): string {
  const u = iso2.toUpperCase();
  if (u.length !== 2) return "🌐";
  const A = 0x1f1e6;
  const codePoint = (c: string) => A + ((c.codePointAt(0) ?? 65) - 65);
  return String.fromCodePoint(codePoint(u[0]!), codePoint(u[1]!));
}

export const PHONE_COUNTRY_CODES: PhoneCountryOption[] = [
  { dial: "90", name: "Türkiye", iso2: "TR" },
  { dial: "1", name: "ABD / Kanada", iso2: "US" },
  { dial: "44", name: "İngiltere", iso2: "GB" },
  { dial: "91", name: "Hindistan", iso2: "IN" },
  { dial: "86", name: "Çin", iso2: "CN" },
  { dial: "49", name: "Almanya", iso2: "DE" },
  { dial: "33", name: "Fransa", iso2: "FR" },
  { dial: "39", name: "İtalya", iso2: "IT" },
  { dial: "34", name: "İspanya", iso2: "ES" },
  { dial: "31", name: "Hollanda", iso2: "NL" },
  { dial: "32", name: "Belçika", iso2: "BE" },
  { dial: "41", name: "İsviçre", iso2: "CH" },
  { dial: "43", name: "Avusturya", iso2: "AT" },
  { dial: "48", name: "Polonya", iso2: "PL" },
  { dial: "46", name: "İsveç", iso2: "SE" },
  { dial: "47", name: "Norveç", iso2: "NO" },
  { dial: "45", name: "Danimarka", iso2: "DK" },
  { dial: "358", name: "Finlandiya", iso2: "FI" },
  { dial: "351", name: "Portekiz", iso2: "PT" },
  { dial: "30", name: "Yunanistan", iso2: "GR" },
  { dial: "420", name: "Çekya", iso2: "CZ" },
  { dial: "40", name: "Romanya", iso2: "RO" },
  { dial: "36", name: "Macaristan", iso2: "HU" },
  { dial: "7", name: "Rusya / Kazakistan", iso2: "RU" },
  { dial: "380", name: "Ukrayna", iso2: "UA" },
  { dial: "81", name: "Japonya", iso2: "JP" },
  { dial: "82", name: "Güney Kore", iso2: "KR" },
  { dial: "61", name: "Avustralya", iso2: "AU" },
  { dial: "64", name: "Yeni Zelanda", iso2: "NZ" },
  { dial: "55", name: "Brezilya", iso2: "BR" },
  { dial: "52", name: "Meksika", iso2: "MX" },
  { dial: "54", name: "Arjantin", iso2: "AR" },
  { dial: "966", name: "Suudi Arabistan", iso2: "SA" },
  { dial: "971", name: "BAE", iso2: "AE" },
  { dial: "20", name: "Mısır", iso2: "EG" },
  { dial: "27", name: "Güney Afrika", iso2: "ZA" },
  { dial: "65", name: "Singapur", iso2: "SG" },
  { dial: "60", name: "Malezya", iso2: "MY" },
  { dial: "62", name: "Endonezya", iso2: "ID" },
  { dial: "84", name: "Vietnam", iso2: "VN" },
  { dial: "63", name: "Filipinler", iso2: "PH" },
  { dial: "92", name: "Pakistan", iso2: "PK" },
  { dial: "98", name: "İran", iso2: "IR" },
  { dial: "972", name: "İsrail", iso2: "IL" },
];

export function getPhoneCountryByDial(
  dial: string,
): PhoneCountryOption | undefined {
  return PHONE_COUNTRY_CODES.find((c) => c.dial === dial);
}

export const PHONE_COUNTRY_CODES_SORTED: PhoneCountryOption[] = [
  ...PHONE_COUNTRY_CODES,
].sort((a, b) => a.name.localeCompare(b.name, "tr"));

const dialsSortedByLength = [
  ...new Set(PHONE_COUNTRY_CODES.map((c) => c.dial)),
].sort((a, b) => b.length - a.length);

function isKnownDial(dial: string): boolean {
  return PHONE_COUNTRY_CODES.some((c) => c.dial === dial);
}

export function formatLocalDigitsForDial(
  dial: string,
  rawDigits: string,
): string {
  const digits = rawDigits.replace(/\D/g, "");
  if (!digits) return "";
  if (dial === "90") {
    const d = digits.slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
    if (d.length <= 8) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8)}`;
  }
  return digits.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}

export function parseInternationalPhone(stored: string | null | undefined): {
  dial: string;
  local: string;
} {
  if (!stored?.trim()) {
    return { dial: DEFAULT_PHONE_DIAL, local: "" };
  }
  const t = stored.trim();
  if (!t.startsWith("+")) {
    return {
      dial: DEFAULT_PHONE_DIAL,
      local: formatLocalDigitsForDial(DEFAULT_PHONE_DIAL, t),
    };
  }
  const afterPlus = t.slice(1).replace(/^\s*/, "");
  const digitsOnly = afterPlus.replace(/\D/g, "");
  for (const dial of dialsSortedByLength) {
    if (digitsOnly.startsWith(dial) && isKnownDial(dial)) {
      const restDigits = digitsOnly.slice(dial.length);
      return { dial, local: formatLocalDigitsForDial(dial, restDigits) };
    }
  }
  return {
    dial: DEFAULT_PHONE_DIAL,
    local: t.startsWith("+")
      ? formatLocalDigitsForDial(
          DEFAULT_PHONE_DIAL,
          afterPlus.replace(/\D/g, ""),
        )
      : t,
  };
}

export function combineInternationalPhone(dial: string, local: string): string {
  const digits = local.replace(/\D/g, "").trim();
  if (!digits) return "";
  const spaced = formatLocalDigitsForDial(dial, digits);
  return `+${dial} ${spaced}`;
}
