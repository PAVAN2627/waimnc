import PageLayout from "@/components/PageLayout";
import { ExternalLink, Globe, Search, ShieldCheck, Building2, Landmark, FileText, ShoppingBag, Wallet, Laptop, Radio, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface PortalItem {
  id: string;
  titleMr: string;
  titleEn: string;
  subTitleMr: string;
  subTitleEn: string;
  descMr: string;
  descEn: string;
  url: string;
  category: "admin" | "procurement" | "citizen" | "finance";
  categoryMr: string;
  categoryEn: string;
  icon: any;
  badge: string;
}

export const GOVT_PORTALS: PortalItem[] = [
  {
    id: "satara-govt-co-wai",
    titleMr: "सातारा जिल्हा प्रशासन (मुख्याधिकारी वाई)",
    titleEn: "Satara District Administration (Chief Officer Wai)",
    subTitleMr: "सातारा जिल्हा अधिकृत पोर्टल - मुख्याधिकारी वाई नागरी सुविधा",
    subTitleEn: "Satara District Official Portal - Chief Officer Wai Public Utility",
    descMr: "सातारा जिल्हा प्रशासनाच्या अधिकृत संकेतस्थळावरील वाई नगरपरिषद व मुख्याधिकारी कार्यालय संपर्क व सार्वजनिक माहिती पोर्टल.",
    descEn: "Official Satara District Administration directory & public utility portal for Wai Municipal Council and Chief Officer details.",
    url: "https://www.satara.gov.in/en/public-utility/chief-officer-wai/",
    category: "admin",
    categoryMr: "जिल्हा प्रशासन",
    categoryEn: "District Administration",
    icon: Landmark,
    badge: "जिल्हा प्रशासन",
  },
  {
    id: "gr-portal",
    titleMr: "शासन निर्णय (GR Portal)",
    titleEn: "Government Resolutions (GR Portal)",
    subTitleMr: "महाराष्ट्र शासन अधिकृत शासन निर्णय व परिपत्रके",
    subTitleEn: "Govt. of Maharashtra Official Resolutions & Circulars",
    descMr: "महाराष्ट्र शासनाचे सर्व विभागांचे अधिकृत शासन निर्णय (GR), परिपत्रके, राजपत्र व अधिसूचना शोधणे आणि डाऊनलोड करण्यासाठीचे अधिकृत पोर्टल.",
    descEn: "Official Government of Maharashtra portal to search and download Department Resolutions, Circulars, Gazettes, and Notifications.",
    url: "https://testgomv2.mahaitgov.in/1145/%E0%A4%B6%E0%A4%BE%E0%A4%B8%E0%A4%A8-%E0%A4%A8%E0%A4%BF%E0%A4%B0%E0%A5%8D%E0%A4%A3%E0%A4%AF",
    category: "admin",
    categoryMr: "प्रशासकीय",
    categoryEn: "Administrative",
    icon: FileText,
    badge: "शासकीय निर्णय",
  },
  {
    id: "mahaulb",
    titleMr: "MAHAULB (Urban Local Bodies)",
    titleEn: "MahaULB Urban Local Bodies Portal",
    subTitleMr: "नागरी स्थानिक स्वराज्य संस्था एकात्मिक पोर्टल",
    subTitleEn: "Integrated Urban Local Bodies Governance Platform",
    descMr: "महाराष्ट्रातील सर्व नगरपरिषदा, नगरपालिका व महानगरपालिकांच्या विविध नागरी सेवा, कर आकारणी व ऑनलाइन परवानग्यांसाठीचे राज्यस्तरीय पोर्टल.",
    descEn: "State-level integrated portal for Maharashtra Municipal Councils and Corporations providing online civic services, taxation, and building approvals.",
    url: "https://mahaulb.in/MahaULB/index",
    category: "citizen",
    categoryMr: "स्थानिक स्वराज्य",
    categoryEn: "Local Governance",
    icon: Building2,
    badge: "MahaULB",
  },
  {
    id: "sanchit",
    titleMr: "संचित पोर्टल (ULB Data Portal)",
    titleEn: "Sanchit ULB Data Portal",
    subTitleMr: "नगरपरिषद सांख्यिकी व डेटा व्यवस्थापन प्रणाली",
    subTitleEn: "Municipal Statistics & Integrated Data Management Portal",
    descMr: "नगरपरिषदेचे बजेट, विकासकामे, कर वसुली व आर्थिक अहवालांचे सांख्यिकी संकलन व सनियंत्रण करण्यासाठीचे अधिकृत डेटा पोर्टल.",
    descEn: "Official municipal statistical data and monitoring portal for budgets, development progress, revenue collection, and council reports.",
    url: "http://ulbdataportal.in/",
    category: "admin",
    categoryMr: "डेटा व सांख्यिकी",
    categoryEn: "Data & Reports",
    icon: Laptop,
    badge: "ULB Data",
  },
  {
    id: "aaple-sarkar",
    titleMr: "आपले सरकार तक्रार निवारण (Grievances)",
    titleEn: "Aaple Sarkar Grievance Redressal",
    subTitleMr: "महाराष्ट्र शासन नागरिक तक्रार निवारण मंच",
    subTitleEn: "Government of Maharashtra Citizen Grievance Portal",
    descMr: "शासकीय विभाग व स्थानिक स्वराज्य संस्थांच्या कामकाजाबाबत नागरिकांना थेट ऑनलाइन तक्रार नोंदवणे व पाठपुरावा करण्यासाठीचे राज्यस्तरीय तक्रार निवारण पोर्टल.",
    descEn: "Citizen grievance redressal platform to lodge complaints regarding government departments, municipal councils, and track resolution.",
    url: "https://grievances.maharashtra.gov.in/admin/mr/users/login",
    category: "citizen",
    categoryMr: "तक्रार निवारण",
    categoryEn: "Grievances",
    icon: ShieldCheck,
    badge: "आपले सरकार",
  },
  {
    id: "gem",
    titleMr: "GeM पोर्टल (Government e-Marketplace)",
    titleEn: "GeM (Government e-Marketplace)",
    subTitleMr: "शासकीय ई-खरेदी व पुरवठादार राष्ट्रीय पोर्टल",
    subTitleEn: "National Public Procurement Portal of India",
    descMr: "शासकीय कार्यालये, स्थानिक स्वराज्य संस्था व महामंडळांना वस्तू व सेवांची पारदर्शक व स्पर्धात्मक खरेदी करण्यासाठीचे राष्ट्रीय ई-मार्केटप्लेस.",
    descEn: "National e-commerce portal facilitating online procurement of common use goods & services required by government departments and urban local bodies.",
    url: "https://gem.gov.in/",
    category: "procurement",
    categoryMr: "शासकीय खरेदी",
    categoryEn: "Public Procurement",
    icon: ShoppingBag,
    badge: "GeM India",
  },
  {
    id: "etenders",
    titleMr: "ई-निविदा पोर्टल (Maha e-Tenders)",
    titleEn: "Maha e-Tenders Portal",
    subTitleMr: "महाराष्ट्र शासन ई-प्रोक्युर्मेन्ट व टेंडर प्रणाली",
    subTitleEn: "Maharashtra Govt. Electronic Procurement System",
    descMr: "नगरपरिषदेच्या सर्व बांधकाम, पुरवठा व सेवा निविदांची ऑनलाइन प्रसिद्धी, ई-निविदा सादरीकरण व तांत्रिक लिफाफे उघडण्याची अधिकृत प्रणाली.",
    descEn: "Official Maharashtra portal for online tender publishing, electronic bid submission, technical/financial opening, and contract awards.",
    url: "https://www.mahaetenders.gov.in/",
    category: "procurement",
    categoryMr: "ई-निविदा",
    categoryEn: "e-Tenders",
    icon: FileText,
    badge: "MahaTenders",
  },
  {
    id: "nps",
    titleMr: "NPS (National Pension System - Protean)",
    titleEn: "NPS (National Pension System - Protean CRA)",
    subTitleMr: "राष्ट्रीय पेन्शन योजना कर्मचारी सेवा पोर्टल",
    subTitleEn: "Central Recordkeeping Agency (CRA) for Pension",
    descMr: "नगरपरिषद अधिकारी व कर्मचाऱ्यांच्या नवीन निवृत्तीवेतन योजना (DCPS / NPS) खात्यांचे व्यवस्थापन, PRAN तपशील व जमा रकमा तपासणी पोर्टल.",
    descEn: "Protean CRA portal for municipal employees to check PRAN account status, NPS pension balance, statements, and contribution updates.",
    url: "http://www.npscra.proteantech.in/",
    category: "finance",
    categoryMr: "पेन्शन व भविष्य निर्वाह",
    categoryEn: "Pension / HR",
    icon: Wallet,
    badge: "NPS CRA",
  },
  {
    id: "dmarp",
    titleMr: "Repository Portal (DMA DR)",
    titleEn: "DMA Repository Portal (DMA DR)",
    subTitleMr: "नगरपरिषद प्रशासन संचालनालय दस्तऐवज भांडार",
    subTitleEn: "Directorate of Municipal Administration Data Repository",
    descMr: "महाराष्ट्र नगरपरिषद प्रशासन संचालनालय (DMA) यांच्या अखत्यारीतील सर्व नगरपालिकांचे परिपत्रके, विकास नियमावली व अहवालांचे केंद्रीय भांडार.",
    descEn: "Directorate of Municipal Administration (DMA) Maharashtra repository for council circulars, development guidelines, audits, and statutory orders.",
    url: "https://dmarp.in/",
    category: "admin",
    categoryMr: "DMA संचालनालय",
    categoryEn: "DMA Repository",
    icon: Landmark,
    badge: "DMA Portal",
  },
  {
    id: "eoffice",
    titleMr: "E-Office (महाराष्ट्र शासन)",
    titleEn: "E-Office (Government of Maharashtra)",
    subTitleMr: "कागदविरहित कार्यालयीन नस्ती व फाईल व्यवस्थापन प्रणाली",
    subTitleEn: "Paperless Workplace & File Tracking System",
    descMr: "शासकीय व नगरपालिका कार्यालयांमध्ये नस्ती (Files) व पत्रव्यवहार डिजिटल स्वरूपात हाताळण्यासाठीची सुरक्षित व पारदर्शक ई-ऑफिस प्रणाली.",
    descEn: "National e-Governance Mission paperless file management and digital letter workflow system for government and council administration.",
    url: "https://mahaeoffice.maharashtra.gov.in/",
    category: "admin",
    categoryMr: "ई-ऑफिस",
    categoryEn: "Paperless Office",
    icon: Laptop,
    badge: "e-Office",
  },
  {
    id: "mahasanchar",
    titleMr: "महासंचार पोर्टल (MahaSanchar)",
    titleEn: "MahaSanchar Portal (Public Works & Council)",
    subTitleMr: "सार्वजनिक बांधकाम व संवाद नियंत्रण पोर्टल",
    subTitleEn: "Infrastructure & Communications Management Platform",
    descMr: "महाराष्ट्र सार्वजनिक बांधकाम व नगरपालिका विकास प्रकल्पांच्या संवाद, प्रगती अहवाल आणि सनियंत्रणासाठीचे अधिकृत महासंचार पोर्टल.",
    descEn: "Maharashtra public infrastructure, road network communications, and civil projects monitoring portal.",
    url: "https://mahasanchar.emahapwd.com/",
    category: "admin",
    categoryMr: "महासंचार",
    categoryEn: "Communications",
    icon: Radio,
    badge: "MahaSanchar",
  },
];

export default function GovtPortals() {
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const categories = [
    { key: "all", label: t("सर्व पोर्टल्स (All)", "All Portals") },
    { key: "admin", label: t("प्रशासकीय व ई-ऑफिस", "Admin & e-Office") },
    { key: "citizen", label: t("नागरी सेवा व तक्रार", "Citizen Services & Grievances") },
    { key: "procurement", label: t("ई-निविदा व खरेदी (GeM)", "Tenders & GeM") },
    { key: "finance", label: t("कर्मचारी व पेन्शन (NPS)", "Employee & Pension") },
  ];

  const filtered = GOVT_PORTALS.filter((p) => {
    if (category !== "all" && p.category !== category) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.titleMr.toLowerCase().includes(q) ||
      p.titleEn.toLowerCase().includes(q) ||
      p.descMr.toLowerCase().includes(q) ||
      p.descEn.toLowerCase().includes(q) ||
      p.badge.toLowerCase().includes(q)
    );
  });

  return (
    <PageLayout>
      <div className="py-12 bg-gradient-to-b from-background via-muted/30 to-background border-b relative overflow-hidden">
        {/* Decorative Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Hero Card Banner */}
            <div className="gov-gradient rounded-3xl p-8 md:p-10 text-primary-foreground shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-bl-full pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm border border-white/30">
                    <Globe className="w-3.5 h-3.5" />
                    {t("उपयुक्त दुवे — अधिकृत पोर्टल दालन", "Useful Links — Official Portal Hub")}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black text-white">
                    {t("शासकीय पोर्टल्स", "Government Portals")}
                  </h1>
                  <p className="text-primary-foreground/90 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
                    {t(
                      "नगर परिषदेच्या कामकाजाशी संबंधित विविध शासकीय पोर्टल्सचे थेट दुवे. शासन निर्णय, महा-ULB, आपले सरकार, GeM, ई-निविदा व ई-ऑफिस एकाच ठिकाणी उपलब्ध.",
                      "Direct access to official Maharashtra and Central Government citizen portals related to municipal council operations. GR Portal, MahaULB, Aaple Sarkar, GeM, e-Tenders, and e-Office."
                    )}
                  </p>
                </div>

                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shadow-xl flex-shrink-0">
                  🌐
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card border border-border w-full sm:w-auto shadow-sm overflow-x-auto">
                {categories.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCategory(c.key)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                      category === c.key
                        ? "gov-gradient text-white shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("पोर्टल किंवा सेवा शोधा...", "Search portal or service...")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                />
              </div>
            </div>

            {/* Portals Grid - Entire card is clickable to open directly */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((portal) => {
                const IconComponent = portal.icon;
                return (
                  <a
                    key={portal.id}
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-card rounded-3xl p-6 md:p-7 border border-border hover:border-primary/60 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all flex-shrink-0 shadow-sm">
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary/20 transition-colors">
                              {portal.badge}
                            </span>
                            <h3 className="font-black text-base sm:text-lg text-foreground group-hover:text-primary transition-colors mt-1">
                              {lang === "mr" ? portal.titleMr : portal.titleEn}
                            </h3>
                          </div>
                        </div>

                        <div className="p-2 rounded-xl bg-muted/50 group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0">
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      </div>

                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        {lang === "mr" ? portal.subTitleMr : portal.subTitleEn}
                      </p>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {lang === "mr" ? portal.descMr : portal.descEn}
                      </p>
                    </div>

                    <div className="pt-5 mt-4 border-t border-border flex items-center justify-between gap-3">
                      <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>{t("अधिकृत शासकीय पोर्टल (क्लिक करून उघडा)", "Official Portal (Click to Open)")}</span>
                      </span>

                      <span
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gov-gradient text-white text-xs font-bold shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all flex-shrink-0"
                      >
                        <span>{t("पोर्टल उघडा", "Open Portal")}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="bg-card rounded-3xl p-12 text-center border border-border shadow-xl space-y-3">
                <Globe className="h-12 w-12 mx-auto text-muted-foreground opacity-40" />
                <h3 className="text-lg font-bold text-foreground">
                  {t("कोणतेही पोर्टल सापडले नाही.", "No portals match your search.")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t("कृपया वेगळा शोध शब्द टाईप करा.", "Please try a different search keyword.")}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </PageLayout>
  );
}

