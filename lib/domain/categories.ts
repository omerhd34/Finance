import { z } from "zod";
import { cn } from "@/lib/common/utils";

export const EXPENSE_SUBCATEGORY_NONE = "__sub_none__";

export const DEBT_EXPENSE_CATEGORY = "Borç";
export const RECEIVABLE_INCOME_CATEGORY = "Alacak";

export function refineIncomeExpenseSubcategory<
  T extends {
    type: "income" | "expense";
    category: string;
    subcategory?: unknown;
  },
>(data: T, ctx: z.RefinementCtx, pathKey: "subcategory") {
  const norm = normalizeSubcategoryInput(data.subcategory);
  if (data.type === "income") {
    if (norm !== undefined) {
      ctx.addIssue({
        code: "custom",
        message: "Gelir işlemlerinde alt kategori kullanılmaz",
        path: [pathKey],
      });
    }
    return;
  }
  if (norm === undefined) return;
  if (!isValidExpenseSubcategory(data.category, norm)) {
    ctx.addIssue({
      code: "custom",
      message: "Geçersiz alt kategori",
      path: [pathKey],
    });
  }
}
export const EXPENSE_CATEGORY_TREE = [
  {
    group: "Yaşam",
    categories: [
      {
        category: "Konut",
        subcategories: [
          "Kira",
          "Aidat",
          "Tamirat / bakım",
          "Temizlik",
          "Emlak / Çevre Vergisi",
          "Diğer",
        ],
      },
      {
        category: "Faturalar",
        subcategories: [
          "Elektrik",
          "Su",
          "Doğalgaz",
          "İnternet",
          "Mobil hat",
          "TV / uydu",
          "Diğer",
        ],
      },
    ],
  },
  {
    group: "Alışveriş",
    categories: [
      {
        category: "Market",
        subcategories: [
          "Temel Gıda & Bakliyat",
          "Kahvaltılık",
          "Sebze & Meyve",
          "Et, Tavuk & Şarküteri",
          "Fırın & Unlu Mamuller",
          "Atıştırmalık",
          "Dondurulmuş Gıda",
          "İçecek",
          "Gıda Dışı / Temizlik",
          "Diğer",
        ],
      },
      {
        category: "Yiyecek & İçecek",
        subcategories: [
          "Hazır Yemek & Restoran",
          "Kafe",
          "Pastane",
          "Alkol & Tütün",
          "Diğer",
        ],
      },
      {
        category: "Elektronik",
        subcategories: [
          "Telefon",
          "Bilgisayar",
          "Tablet",
          "TV",
          "Beyaz eşya",
          "Küçük ev aletleri",
          "Aksesuar",
          "Diğer",
        ],
      },
      {
        category: "Ev & Yaşam",
        subcategories: [
          "Mobilya",
          "Dekorasyon",
          "Tekstil / Nevresim",
          "Mutfak Gereçleri",
          "Ev Aletleri & Donanım",
          "Banyo & Temizlik Gereçleri",
          "Bahçe & Balkon / Bitki",
          "Ev Düzenleme & Düzenleyiciler",
          "Diğer",
        ],
      },
      {
        category: "Giyim",
        subcategories: [
          "Günlük Giyim",
          "Dış Giyim",
          "Spor & Performans Giyimi",
          "Ayakkabı",
          "İç Giyim & Ev Giyimi",
          "Çanta & Valiz",
          "Aksesuar",
          "Diğer",
        ],
      },
      {
        category: "Çocuk & Bebek",
        subcategories: [
          "Oyuncak",
          "Bebek bezi",
          "Bebek maması",
          "Araç & Gereç (Bebek arabası vb.)",
          "Diğer",
        ],
      },
      {
        category: "Kozmetik & Bakım",
        subcategories: [
          "Makyaj ürünleri",
          "Cilt & Yüz bakımı",
          "Parfüm / Deodorant",
          "Vücut & Duş ürünleri",
          "Diğer",
        ],
      },
      {
        category: "Kırtasiye & Hobi",
        subcategories: [
          "Kırtasiye & Ofis Malzemeleri",
          "Kitap, Çizgi Roman & Dergi",
          "Sanat & El Sanatları",
          "Kutu Oyunları & Puzzle",
          "Maket, Model & Figür",
          "Diğer",
        ],
      },
      {
        category: "Evcil Hayvan",
        subcategories: [
          "Mama & Besin Takviyeleri",
          "Kedi Kumu & Hijyen",
          "Sağlık & Veteriner",
          "Bakım & Pet Kuaför",
          "Aksesuar & Oyuncak",
          "Diğer",
        ],
      },
      {
        category: "Spor & Outdoor",
        subcategories: [
          "Spor Ekipmanları & Kondisyon",
          "Sporcu Besinleri & Takviyeler",
          "Kamp & Doğa Sporları",
          "Outdoor Teknolojisi",
          "Diğer",
        ],
      },
      {
        category: "Takı & Mücevher",
        subcategories: ["Saat", "Lüks & Değerli Takı", "Bijuteri", "Diğer"],
      },
    ],
  },
  {
    group: "Ulaşım & Araç",
    categories: [
      {
        category: "Ulaşım",
        subcategories: [
          "Toplu taşıma",
          "Taksi",
          "Otopark",
          "Köprü & Otoyol",
          "Diğer",
        ],
      },
      {
        category: "Araç",
        subcategories: [
          "Yakıt",
          "Bakım / Servis",
          "Lastik",
          "Muayene",
          "Sigorta (Kasko / Trafik)",
          "Diğer",
        ],
      },
    ],
  },
  {
    group: "Kişisel",
    categories: [
      {
        category: "Kişisel bakım",
        subcategories: [
          "Kuaför / berber",
          "Güzellik / Estetik / Lazer",
          "Masaj / SPA",
          "Diğer",
        ],
      },
      {
        category: "Sağlık",
        subcategories: [
          "Eczane",
          "Hastane / Muayene",
          "Diş bakımı",
          "Optik",
          "Psikolojik Danışmanlık",
          "Laboratuvar / Test / Tahlil",
          "Diğer",
        ],
      },
      {
        category: "Spor",
        subcategories: ["Salon üyeliği", "Kurs / Özel Ders", "Diğer"],
      },
    ],
  },
  {
    group: "Eğitim & Kariyer",
    categories: [
      {
        category: "Eğitim",
        subcategories: [
          "Kurs & Özel Ders",
          "Online Eğitim & Platformlar",
          "Sertifika & Sınav Ücretleri",
          "Okul & Üniversite Taksiti",
          "Diğer",
        ],
      },
      {
        category: "İş",
        subcategories: [
          "Ofis, Çalışma Alanı & Kira",
          "Dijital Araçlar & Yazılım",
          "Donanım, Demirbaş & Cihaz",
          "Reklam, Pazarlama & Tanıtım",
          "İş Seyahati & Ağırlama",
          "Kargo, Lojistik & Kurye",
          "Mesleki Hizmet & Danışmanlık",
          "Diğer",
        ],
      },
    ],
  },
  {
    group: "Finans",
    categories: [
      {
        category: "Borç",
        subcategories: [],
      },
      {
        category: "Kredi & Kart",
        subcategories: [
          "Kredi kartı ekstrası",
          "Kredi taksidi",
          "Banka ücretleri",
          "Faiz & Komisyon",
          "Diğer",
        ],
      },
      {
        category: "Sigorta",
        subcategories: [
          "Hayat Sigortası",
          "Sağlık Sigortası",
          "Bireysel Emeklilik (BES)",
          "Diğer",
        ],
      },
      {
        category: "Vergi",
        subcategories: [
          "Gelir vergisi / Stopaj",
          "MTV",
          "Harç & Değerli Kağıt",
          "Diğer",
        ],
      },
      {
        category: "Yatırım & Birikim",
        subcategories: [
          "Hisse Senedi",
          "Kripto Varlıklar",
          "Fon / Altın",
          "Diğer",
        ],
      },
    ],
  },
  {
    group: "Sosyal & Yaşam",
    categories: [
      {
        category: "Eğlence",
        subcategories: [
          "Sinema & Tiyatro",
          "Konser & Festival",
          "Maç & Spor Etkinlikleri",
          "Oyun & İçi Satın Alım (Steam/PS)",
          "Dijital abonelik",
          "Diğer",
        ],
      },
      {
        category: "Seyahat",
        subcategories: [
          "Otel / Konaklama",
          "Uçak / Otobüs Bileti",
          "Tatilde harcama",
          "Diğer",
        ],
      },
      {
        category: "Hediye & Bağış",
        subcategories: ["Hediye", "Bağış", "Diğer"],
      },
    ],
  },
  {
    group: "Diğer",
    categories: [
      {
        category: "Diğer",
        subcategories: ["Genel / Tanımsız"],
      },
    ],
  },
] as const;

type ExpenseTreeGroup = (typeof EXPENSE_CATEGORY_TREE)[number];
type ExpenseTreeLeaf = ExpenseTreeGroup["categories"][number];

export type ExpenseCategory = ExpenseTreeLeaf["category"];

export type ExpenseCategoryGroupName = ExpenseTreeGroup["group"];

function expenseCategoryLeaves(): ReadonlyArray<{
  group: ExpenseCategoryGroupName;
  category: ExpenseTreeLeaf["category"];
  subcategories: ExpenseTreeLeaf["subcategories"];
}> {
  return EXPENSE_CATEGORY_TREE.flatMap((g) =>
    g.categories.map((c) => ({
      group: g.group,
      category: c.category,
      subcategories: c.subcategories,
    })),
  );
}

export const EXPENSE_CATEGORIES: readonly ExpenseCategory[] =
  expenseCategoryLeaves().map((x) => x.category);

export function getExpenseCategoryGroup(
  category: string,
): ExpenseCategoryGroupName | undefined {
  return expenseCategoryLeaves().find((x) => x.category === category)?.group;
}

export function expenseCategorySelectGroupLabelClassName(index: number) {
  return cn(
    "block w-full text-center text-xs font-semibold tracking-wide text-muted-foreground",
    "rounded-md border border-border/50 bg-muted/60 py-2.5 shadow-sm",
    index > 0 && "mt-2",
  );
}

export function getExpenseSubcategories(category: string): readonly string[] {
  const row = expenseCategoryLeaves().find((x) => x.category === category);
  return row ? [...row.subcategories] : [];
}

export function isValidExpenseSubcategory(
  category: string,
  subcategory: string,
): boolean {
  const subs = getExpenseSubcategories(category);
  return subs.includes(subcategory);
}

export function formValueToExpenseSubcategory(
  v: string | null | undefined,
): string | undefined {
  if (v == null || v === EXPENSE_SUBCATEGORY_NONE) return undefined;
  return v;
}

export function expenseSubcategoryToFormValue(
  v: string | null | undefined,
): string {
  const t = v?.trim();
  return t || EXPENSE_SUBCATEGORY_NONE;
}

export function formatExpenseCategoryLabel(
  category: string,
  subcategory?: string | null,
): string {
  const s = subcategory?.trim();
  if (!s) return category;
  return `${category} - ${s}`;
}

export function normalizeSubcategoryInput(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  if (t === "" || t === EXPENSE_SUBCATEGORY_NONE) return undefined;
  return t;
}

export const INCOME_CATEGORIES = [
  "Maaş",
  "Serbest çalışan (Freelancer)",
  "Yatırım",
  "Kira Geliri",
  "Alacak",
  "Diğer",
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];

export const MANUAL_EXPENSE_CATEGORIES = EXPENSE_CATEGORIES.filter(
  (category) => category !== DEBT_EXPENSE_CATEGORY,
);

export const MANUAL_INCOME_CATEGORIES = INCOME_CATEGORIES.filter(
  (category) => category !== RECEIVABLE_INCOME_CATEGORY,
);
