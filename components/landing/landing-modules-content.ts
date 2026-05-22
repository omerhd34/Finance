export type LandingModuleItem = {
  id: string;
  title: string;
  premium?: boolean;
};

export const LANDING_MODULES: LandingModuleItem[] = [
  {
    id: "01",
    title: "Finansal Performans Analizi",
  },
  {
    id: "02",
    title: "Gelir-Gider Yönetimi",
  },
  {
    id: "03",
    title: "Tasarruf ve Hedef Takibi",
  },
  {
    id: "04",
    title: "Borç ve Alacak Yönetimi",
  },
  {
    id: "05",
    title: "Çoklu Para Birimi ve Kur",
  },
  {
    id: "06",
    title: "Finansal Hesaplama Araçları",
  },
  {
    id: "07",
    title: "Yatırım Portföyü",
    premium: true,
  },
  {
    id: "08",
    title: "IQfinansAI Analiz Raporu",
    premium: true,
  },
  {
    id: "09",
    title: "IQfinansAI Asistanı",
    premium: true,
  },
];
