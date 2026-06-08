"use client";

import { useState, type ComponentType } from "react";
import { ArrowUpRight, ChevronDown, Eye } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/common/utils";
import {
  LANDING_MODULES,
  type LandingModuleItem,
} from "@/components/landing/landing-modules-content";
import { AnaPanelPreview } from "@/components/landing/dashboard-preview/ana-panel";
import { BorcVeAlacakPreview } from "@/components/landing/dashboard-preview/borc-ve-alacak";
import { ButcelerPreview } from "@/components/landing/dashboard-preview/butceler";
import { HesaplamalarPreview } from "@/components/landing/dashboard-preview/hesaplamalar";
import { IQfinansAIAnalizPreview } from "@/components/landing/dashboard-preview/iqfinansai-analiz";
import { IQfinansAIAsistaniPreview } from "@/components/landing/dashboard-preview/iqfinansai-asistani";
import { IslemlerPreview } from "@/components/landing/dashboard-preview/islemler";
import { KurDonusumPreview } from "@/components/landing/dashboard-preview/kur-donusum";
import { YatirimPreview } from "@/components/landing/dashboard-preview/yatirim";

const PREVIEW_BY_MODULE_ID: Record<string, ComponentType> = {
  "01": AnaPanelPreview,
  "02": IslemlerPreview,
  "03": ButcelerPreview,
  "04": BorcVeAlacakPreview,
  "05": KurDonusumPreview,
  "06": HesaplamalarPreview,
  "07": YatirimPreview,
  "08": IQfinansAIAnalizPreview,
  "09": IQfinansAIAsistaniPreview,
};

const PAGE_NAME_BY_MODULE_ID: Record<string, string> = {
  "01": "Ana Panel",
  "02": "İşlemler",
  "03": "Bütçeler",
  "04": "Borç ve Alacak",
  "05": "Kur Dönüşüm",
  "06": "Hesaplamalar",
  "07": "Yatırım",
  "08": "IQfinansAI Analiz",
  "09": "IQfinansAI Asistanı",
};

const MODULE_HIGHLIGHTS: Record<string, string[]> = {
  "01": [
    "Son ay gelir, gider ve net bakiyeni KPI kartlarında tek bakışta gör.",
    "Finansal sağlık skoru; tasarruf oranı, borç dengesi ve trende göre hesaplanır.",
    "Son 2–12 ay aralığında gelir-gider trendini ve tasarruf oranını grafikle izle.",
    "Kategori pasta grafiğiyle harcamalarının nereye gittiğini netleştir.",
    "Borç-alacak netini ve Premium yatırım kar/zararını aynı panelde takip et.",
    "Bütçe aşımı ve dönemsel sapmalar için uyarı kartlarıyla erken müdahale et.",
  ],
  "02": [
    "Gelir ve giderlerini hiyerarşik kategori ağacıyla hızlıca kaydet ve düzenle.",
    "Tarih, tutar, kategori ve metin aramasıyla binlerce işlem arasında saniyeler içinde bul.",
    "Filtrelenmiş listeyi CSV veya PDF olarak dışa aktar; rapor ve yedek için hazır kullan.",
    "Premium’da fiş veya fatura görseli yükle; tutar, tarih ve kategori alanları otomatik dolsun.",
    "Tekrarlayan faturalar ve abonelikler için ayrı modülde vade planla, hatırlatma al.",
    "Sayfa grafikleriyle dönemsel trendi ve kategori dağılımını tabloyla birlikte incele.",
  ],
  "03": [
    "Market, ulaşım, eğlence gibi kategorilere aylık harcama limiti belirle.",
    "Gerçekleşen harcamayı limite göre ilerleme çubuğu ve yüzdeyle anlık takip et.",
    "Belirlediğin uyarı eşiğinde veya limit aşımında görsel uyarılarla kontrolü elinde tut.",
    "Kategori bazında e-posta bildirimi aç; bütçe riskinde haberdar ol.",
    "Normal, sınırda ve aşılmış bütçeleri filtreleyerek önce müdahale gerekenleri gör.",
    "Her bütçeden ilgili işlem listesine tek tıkla geç; harcama kaynağını hemen incele.",
  ],
  "04": [
    "Kişi veya kuruma olan borç ve alacaklarını ayrı kayıtlar halinde yönet.",
    "Vade tarihi, faiz oranı ve geri ödeme planını her kayıt için ayrı tanımla.",
    "Ödeme veya ana para artışı girdiğinde kalan bakiye otomatik güncellenir.",
    "Toplam alacak, toplam borç ve net pozisyonu özet kartlardan izle.",
    "Vade olgunluk grafiğiyle yaklaşan ve geciken yükümlülükleri önceden gör.",
    "TL yanı sıra döviz ve altın birimli borç-alacak kayıtlarını destekler.",
  ],
  "05": [
    "Güncel kurlarla 40’tan fazla döviz kodu arasında anlık dönüşüm yap.",
    "Profilinde ana para birimini seç; panel ve işlemler bu birimde gösterilir.",
    "Kur dönüşüm aracıyla alışveriş veya transfer öncesi tutarı hızlıca hesapla.",
    "Canlı kur verisi güncellenir; manuel tablo aramaya gerek kalmaz.",
    "Farklı para birimlerindeki finansal kararları tek referans noktasından değerlendir.",
    "Yurtdışı harcama ve döviz pozisyonlarını günlük planlamada pratik biçimde kullan.",
  ],
  "06": [
    "Basit faiz, bileşik faiz ve vadeli mevduat senaryolarını tek ekranda hesapla.",
    "İhtiyaç, konut ve taşıt kredilerinde KKDF ve BSMV dahil aylık taksiti gör.",
    "KDV dahil ve hariç tutarları farklı oranlarla saniyeler içinde dönüştür.",
    "Hedef tutara ulaşmak için gereken aylık birikimi birikim hedefi aracıyla planla.",
    "Resmi TÜFE endeksine göre iki dönem arası satın alma gücü farkını hesapla.",
    "BES katkı payı, devlet katkısı ve stopaj dahil net birikim projeksiyonu üret.",
  ],
  "07": [
    "Hisse, döviz, kripto, altın, gümüş, platin ve emtia pozisyonlarını tek portföyde topla.",
    "Premium’da canlı fiyatlarla güncel değer, ortalama maliyet ve kar/zararı izle.",
    "Varlık türüne göre dağılım grafikleriyle portföyünün yoğunlaştığı alanları gör.",
    "Her pozisyona not ekleyerek alım gerekçeni ve hedefini kayıt altında tut.",
    "Ana panelde yatırım kar/zarar kartıyla genel finansal tablona entegre et.",
    "Alım-satım kararlarını maliyet ve getiri verisiyle destekleyerek daha bilinçli ver.",
  ],
  "08": [
    "Gelir-gider kayıtlarından yapay zekâ destekli, tam metin finans analiz raporu üret.",
    "Kategori yorumları, harcama trendleri ve tasarruf fırsatları kişisel verine göre listelenir.",
    "Raporu PDF olarak indir; arşivle veya danışmanınla paylaş.",
    "Geçmiş analizlere dönerek dönemler arası gelişimi karşılaştır.",
    "Aylık analiz kotasıyla düzenli raporlama alışkanlığı kur.",
    "Genel tavsiyeler yerine kendi kayıtlarına dayanan, somut aksiyon önerileri al.",
  ],
  "09": [
    "Sohbet ekranından bütçe, harcama ve finansal durumun hakkında doğal dilde sor.",
    "Finans sorularında yanıtlar güncel gelir-gider ve bütçe kayıtlarına dayanır.",
    "Ay sonu riski, tasarruf alanı ve odaklanman gereken kalemler kişiye özel özetlenir.",
    "Yatırım, borç ve tasarruf konularında uygulanabilir adımlar al.",
    "Finans dışı günlük sorularda da genel asistan olarak kullanılabilir.",
    "Tahmine değil, panelindeki gerçek verilere dayanan yanıtlarla karar ver.",
  ],
};

function ModulePremiumBadge() {
  return (
    <span className="inline-flex shrink-0 items-center rounded-md border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold  tracking-wider text-amber-800 dark:border-amber-400/35 dark:bg-amber-400/12 dark:text-amber-200">
      Premium
    </span>
  );
}

function ModuleNumberBadge({ id, active }: { id: string; active: boolean }) {
  return (
    <span
      className={
        active
          ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[13px] font-bold text-white shadow-md shadow-emerald-900/20 transition-colors dark:bg-emerald-500"
          : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-700 ring-1 ring-emerald-500/25 transition-colors dark:text-emerald-300"
      }
      aria-hidden
    >
      {id}
    </span>
  );
}

function ModulePreviewSheet({ module }: { module: LandingModuleItem }) {
  const Preview = PREVIEW_BY_MODULE_ID[module.id];
  if (!Preview) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-500/15 px-4 py-2.5 text-[15px] font-semibold tracking-tight text-emerald-700 ring-1 ring-emerald-500/25 transition-colors hover:bg-emerald-500/25 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:text-emerald-300 dark:hover:text-emerald-200"
        >
          <Eye className="h-4 w-4" aria-hidden />
          Canlı önizlemeyi aç
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl"
      >
        <SheetHeader>
          <div className="flex items-center gap-3 pr-8">
            <SheetTitle className="min-w-0 wrap-break-word text-lg font-bold tracking-tight sm:text-xl">
              {PAGE_NAME_BY_MODULE_ID[module.id] ?? module.title}
            </SheetTitle>
            {module.premium ? <ModulePremiumBadge /> : null}
          </div>
          <SheetDescription className="sr-only">
            {module.title} modülü canlı önizlemesi
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <Preview />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ModuleTabContent({ module }: { module: LandingModuleItem }) {
  const highlights = MODULE_HIGHLIGHTS[module.id] ?? [];

  return (
    <div className="flex h-full min-w-0 flex-col rounded-2xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-black/5 sm:p-7 sm:px-8 sm:py-8 lg:px-8 lg:py-9 xl:px-9 xl:py-10 dark:ring-white/10">
      <div className="flex flex-wrap items-center gap-3">
        <ModuleNumberBadge id={module.id} active />
        <h3 className="min-w-0 wrap-break-word text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
          {module.title}
        </h3>
        {module.premium ? <ModulePremiumBadge /> : null}
      </div>

      {highlights.length > 0 ? (
        <ul className="mt-6 flex flex-1 flex-col justify-between gap-y-3.5 sm:mt-7 sm:gap-y-4 lg:mt-8 lg:gap-y-5">
          {highlights.map((item) => (
            <li
              key={item}
              className="flex min-w-0 items-start gap-2.5 leading-relaxed text-foreground sm:gap-3 text-[13px] sm:text-[14px] lg:text-[16px]"
            >
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                aria-hidden
              />
              <span className="min-w-0 wrap-break-word">{item}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex justify-end pt-8 sm:pt-10">
        <ModulePreviewSheet module={module} />
      </div>
    </div>
  );
}

function MobileModuleAccordionItem({
  module,
  isOpen,
  onToggle,
}: {
  module: LandingModuleItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const highlights = MODULE_HIGHLIGHTS[module.id] ?? [];
  const panelId = `module-panel-${module.id}`;

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl border bg-card shadow-sm ring-1 ring-black/5 transition-colors dark:ring-white/10",
        isOpen ? "border-emerald-500/40" : "border-border/60",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full cursor-pointer items-center gap-3 p-4 text-left transition-colors hover:bg-muted/30 sm:p-5"
      >
        <ModuleNumberBadge id={module.id} active={isOpen} />
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="min-w-0 flex-1 wrap-break-word text-[15px] font-semibold tracking-tight text-foreground sm:text-base">
            {module.title}
          </span>
          {module.premium ? <ModulePremiumBadge /> : null}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
            isOpen && "rotate-180 text-emerald-600 dark:text-emerald-400",
          )}
          aria-hidden
        />
      </button>

      <div
        id={panelId}
        role="region"
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-4 pb-4 sm:px-5 sm:pb-5">
            <div className="border-t border-border/60 pt-4 sm:pt-5">
              {highlights.length > 0 ? (
                <ul className="flex flex-col gap-y-2.5 sm:gap-y-3">
                  {highlights.map((item) => (
                    <li
                      key={item}
                      className="flex min-w-0 items-start gap-2.5 text-[13px] leading-relaxed text-foreground sm:gap-3 sm:text-[14px]"
                    >
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                        aria-hidden
                      />
                      <span className="min-w-0 wrap-break-word">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileModulesAccordion() {
  const [openId, setOpenId] = useState<string | null>(LANDING_MODULES[0].id);

  return (
    <div className="mt-10 flex flex-col gap-3 sm:mt-12 sm:gap-3.5 lg:hidden">
      {LANDING_MODULES.map((module) => (
        <MobileModuleAccordionItem
          key={module.id}
          module={module}
          isOpen={openId === module.id}
          onToggle={() =>
            setOpenId((current) => (current === module.id ? null : module.id))
          }
        />
      ))}
    </div>
  );
}

function ModulesTabsList() {
  return (
    <TabsList className="flex h-auto w-full flex-col gap-0.5 rounded-2xl border border-border/60 bg-card/40 p-2 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
      {LANDING_MODULES.map((module) => (
        <TabsTrigger
          key={module.id}
          value={module.id}
          className="group/tab relative flex w-full cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground focus-visible:ring-emerald-500/50 data-[state=active]:border-emerald-500/30 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-foreground data-[state=active]:shadow-none"
        >
          <ModuleNumberBadge id={module.id} active={false} />
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <span className="min-w-0 flex-1 truncate">{module.title}</span>
            {module.premium ? <ModulePremiumBadge /> : null}
          </span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
}

export function LandingModulesInteractive() {
  return (
    <>
      <MobileModulesAccordion />

      <Tabs
        defaultValue={LANDING_MODULES[0].id}
        orientation="vertical"
        className="mt-16 hidden w-full min-w-0 lg:grid lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:gap-5 xl:grid-cols-[minmax(0,300px)_minmax(0,1fr)] xl:gap-6 2xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]"
      >
        <ModulesTabsList />

        <div className="min-w-0">
          {LANDING_MODULES.map((module) => (
            <TabsContent
              key={module.id}
              value={module.id}
              className="mt-0 min-w-0 outline-none"
            >
              <ModuleTabContent module={module} />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </>
  );
}
