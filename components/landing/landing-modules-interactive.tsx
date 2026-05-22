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

const MODULE_HIGHLIGHTS: Record<string, string[]> = {
  "01": [
    "Aylık gelir-gider trendini çubuk ve çizgi grafiklerle dönem dönem karşılaştır.",
    "Kategori bazlı pasta grafiğinde en çok hangi alana harcadığını anında gör.",
    "Tasarruf oranını ve önceki döneme göre değişimi öne çıkan KPI kartlarıyla takip et.",
    "Net bakiye, borç-alacak ve yatırım kar/zararını tek panoramada izle.",
  ],
  "02": [
    "Tarih, tutar ve kategori ağacıyla saniyeler içinde işlem ekle veya düzenle.",
    "Tekrarlayan faturalar ve abonelikler için vade planla, yaklaşan ödemelerde uyarı al.",
    "Premium’da fiş veya fatura fotoğrafını yükle; OCR tutar, tarih ve kategoriyi otomatik doldursun.",
    "Gelişmiş filtre ve arama ile binlerce işlem arasından ilgili kayda tek tıkla ulaş.",
  ],
  "03": [
    "Ev, tatil, acil durum veya emeklilik için ayrı birikim hedefleri tanımla.",
    "Hedef tutar, bugüne kadar biriken miktar ve kalan süreyi ilerleme çubuğuyla izle.",
    "Aylık katkı senaryolarını değiştirerek hedefe ne zaman ulaşacağını anında gör.",
    "Hedef yaklaştıkça akıllı bildirimlerle motivasyon ve hatırlatma al.",
  ],
  "04": [
    "Kişi veya kuruma olan borç ve alacaklarını ayrı kalemler halinde sınıflandır.",
    "Yapılan ödemelerle kalan bakiye, vade ve faiz bilgilerini anında güncelle.",
    "Toplam alacak, toplam borç ve net pozisyonu tek karta sığdırılmış özet panelden takip et.",
    "Vadesi gelen kayıtlar için otomatik hatırlatma ve geciken ödemelerde uyarı sistemi.",
  ],
  "05": [
    "TL, USD, EUR, GBP ve daha birçok dövizde işlem girerek ana paranı tek bir birime çevir.",
    "Güncel TCMB referans kurları ve gram altın gibi emtia fiyatlarını anlık olarak takip et.",
    "Çoklu para birimli işlemleri raporlara dahil ederek toplu, okunabilir özetler oluştur.",
    "Kur değişimlerine göre portföy değerinin nasıl etkilendiğini grafiklerle gör.",
  ],
  "06": [
    "Konut, ihtiyaç ve taşıt kredisi için aylık taksit, faiz ve toplam ödeme tablolarını üret.",
    "Mevduat faizi, KDV, birikim hedefi, enflasyon (TÜFE) ve BES senaryolarını tek modülde hesapla.",
    "Detaylı ödeme ve birikim planlarını çubuk ve çizgi grafiklerle karşılaştırmalı incele.",
    "Tüm hesaplama sonuçlarını Excel veya PDF olarak indirip arşivle ya da paylaş.",
  ],
  "07": [
    "Hisse senedi, altın, döviz, kripto ve emtia pozisyonlarını tek panelde topluca yönet.",
    "Canlı kotasyonlarla anlık değer, ortalama maliyet ve toplam kar/zararı eş zamanlı izle.",
    "Tür bazında dağılım grafikleriyle portföyünün risk konsantrasyonunu netçe gör.",
    "Yatırım kararlarını destekleyecek geçmişe yönelik kar/zarar trendlerini analiz et.",
  ],
  "08": [
    "Yapay zekâ; gelir-gider verilerinden kategori yorumları ve trend analizleri içeren tam metin rapor üretir.",
    "Tasarruf fırsatları, harcama anomalileri ve önerilen aksiyonlar kişiselleştirilmiş şekilde listelenir.",
    "Raporu PDF formatında indirip arşivleyebilir, güvendiğin biriyle veya danışmanınla paylaşabilirsin.",
    "Aylık raporlama akışıyla bir önceki dönemin gelişimini sistematik biçimde karşılaştır.",
  ],
  "09": [
    "Sohbet ekranından bütçe ve harcama alışkanlıklarını sor; yanıtlar gerçek kayıtlarına dayanır.",
    "Hangi kalemlere odaklanman gerektiği, ay sonu riskleri ve gelişim önerileri kişiye özel hazırlanır.",
    "Sıkça sorulan finansal sorulara saniyeler içinde veriye dayalı, kanıtlı yanıtlar alırsın.",
    "Asistan, yatırım, borç ve tasarruf konularında uygulanabilir, somut adımlar önerir.",
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
          <div className="flex items-start gap-2.5 pr-8">
            <ModuleNumberBadge id={module.id} active />
            <div className="min-w-0">
              <SheetTitle>{module.title}</SheetTitle>
              <SheetDescription className="mt-1 text-[13px] leading-snug">
                {module.description}
              </SheetDescription>
            </div>
            {module.premium ? <ModulePremiumBadge /> : null}
          </div>
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
    <div className="flex h-full min-w-0 flex-col rounded-2xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-black/5 sm:p-7 sm:px-9 sm:py-8 lg:px-10 lg:py-10 dark:ring-white/10">
      <div className="flex flex-wrap items-center gap-3">
        <ModuleNumberBadge id={module.id} active />
        <h3 className="min-w-0 wrap-break-word text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
          {module.title}
        </h3>
        {module.premium ? <ModulePremiumBadge /> : null}
      </div>
      <p className="mt-4 wrap-break-word text-[14px] leading-[1.7] text-muted-foreground sm:mt-5 sm:text-[15px] sm:leading-[1.75] lg:min-h-44 lg:text-base lg:leading-[1.8]">
        {module.description}
      </p>

      {highlights.length > 0 ? (
        <ul className="mt-5 flex flex-col gap-y-3 sm:mt-7 sm:gap-y-3.5">
          {highlights.map((item) => (
            <li
              key={item}
              className="flex min-w-0 items-start gap-2.5 text-[13px] leading-relaxed text-foreground sm:gap-3 sm:text-[14px] lg:text-[15px]"
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

      <div className="mt-auto flex justify-end pt-6 sm:pt-8">
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
              <p className="wrap-break-word text-[14px] leading-[1.7] text-muted-foreground sm:text-[15px] sm:leading-[1.75]">
                {module.description}
              </p>

              {highlights.length > 0 ? (
                <ul className="mt-4 flex flex-col gap-y-2.5 sm:mt-5 sm:gap-y-3">
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
        className="mt-16 hidden w-full max-w-full grid-cols-[380px_minmax(0,1fr)] gap-6 lg:grid"
      >
        <ModulesTabsList />

        {LANDING_MODULES.map((module) => (
          <TabsContent
            key={module.id}
            value={module.id}
            className="mt-0 min-w-0 outline-none"
          >
            <ModuleTabContent module={module} />
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
