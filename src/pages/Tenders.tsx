import PageLayout from "@/components/PageLayout";
import { Download, FileText, Calendar, Sparkles, Building2, Search, ArrowRight, CheckCircle2, AlertCircle, FileCheck2, ExternalLink, X, Eye } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TenderItem {
  id: string;
  title: string; titleEn: string;
  dept: string; deptEn: string;
  amount: string;
  emd: string;
  fee: string;
  startDate: string; startDateEn: string;
  endDate: string; endDateEn: string;
  status: "चालू" | "बंद"; statusEn: "Active" | "Closed";
  desc: string; descEn: string;
}

const tenders: TenderItem[] = [
  {
    id: "T-2026-001",
    title: "वाई शहर मुख्य रस्ता सिमेंट काँक्रीटीकरण व दुरुस्ती कामे", titleEn: "Wai City Main Road Concreting & Repair Work",
    dept: "बांधकाम विभाग", deptEn: "Civil Department",
    amount: "₹ 45,00,000", emd: "₹ 45,000", fee: "₹ 2,500",
    startDate: "01 मार्च 2026", startDateEn: "01 March 2026",
    endDate: "31 मार्च 2026", endDateEn: "31 March 2026",
    status: "चालू", statusEn: "Active",
    desc: "वाई नगरपरिषद क्षेत्रातील मुख्य बाजार पेठ रस्ता व जोड रस्त्यांचे रुंदीकरण, गटार उपसा व पेव्हिंग ब्लॉक कामे.",
    descEn: "Widening, drain cleaning, and paving block installation for main market road and connecting roads in Wai."
  },
  {
    id: "T-2026-002",
    title: "LED पथदिवे पुरवठा व स्मार्ट कंट्रोल सिस्टीम - टप्पा ३", titleEn: "LED Street Light Supply & Smart Control - Phase 3",
    dept: "विद्युत विभाग", deptEn: "Electrical Department",
    amount: "₹ 12,50,000", emd: "₹ 12,500", fee: "₹ 1,000",
    startDate: "10 मार्च 2026", startDateEn: "10 March 2026",
    endDate: "10 एप्रिल 2026", endDateEn: "10 April 2026",
    status: "चालू", statusEn: "Active",
    desc: "वाई नगरपरिषद हद्दीतील संपूर्ण १७ प्रभागांमध्ये ५०W ऊर्जाबचत LED स्ट्रीट लाईट्स पुरवणे व उभारणे.",
    descEn: "Supply and installation of 50W energy efficient LED street lights across all 17 wards of Wai Municipality."
  },
  {
    id: "T-2026-003",
    title: "कचरा संकलन ट्रॅक्टर व ऑटोरिक्षा हायड्रोलिक वाहने खरेदी", titleEn: "Garbage Collection Hydraulic Vehicles Purchase",
    dept: "आरोग्य व स्वच्छता", deptEn: "Health & Sanitation",
    amount: "₹ 28,00,000", emd: "₹ 28,000", fee: "₹ 1,500",
    startDate: "15 मार्च 2026", startDateEn: "15 March 2026",
    endDate: "15 एप्रिल 2026", endDateEn: "15 April 2026",
    status: "चालू", statusEn: "Active",
    desc: "घरोघरी ओला व सुका कचरा विलग संकलनासाठी नवीन ५ हायड्रोलिक कचरा वाहनांची खरेदी करणे.",
    descEn: "Procurement of 5 new hydraulic garbage collection vehicles for door-to-door waste segregation."
  },
  {
    id: "T-2025-045",
    title: "कृष्णा नदी काठ जलशुद्धीकरण व STP प्रकल्प उभारणी", titleEn: "Water Treatment Plant & STP Construction on Krishna River",
    dept: "पाणी पुरवठा", deptEn: "Water Supply",
    amount: "₹ 1,20,00,000", emd: "₹ 1,20,000", fee: "₹ 5,000",
    startDate: "01 डिसेंबर 2025", startDateEn: "01 December 2025",
    endDate: "31 जानेवारी 2026", endDateEn: "31 January 2026",
    status: "बंद", statusEn: "Closed",
    desc: "वाई शहरातील पिण्याच्या पाण्यासाठी नवीन ५ MLD जलशुद्धीकरण केंद्र उभारणी प्रकल्प.",
    descEn: "Establishment of new 5 MLD water purification treatment plant for Wai city drinking water."
  },
  {
    id: "T-2025-044",
    title: "नगरपालिका मुख्य प्रशासकीय इमारत नूतनीकरण व डिजिटल सेतू", titleEn: "Municipal Main Admin Building Renovation & Digital Setu",
    dept: "बांधकाम विभाग", deptEn: "Civil Department",
    amount: "₹ 35,00,000", emd: "₹ 35,000", fee: "₹ 2,000",
    startDate: "15 नोव्हेंबर 2025", startDateEn: "15 November 2025",
    endDate: "15 डिसेंबर 2025", endDateEn: "15 December 2025",
    status: "बंद", statusEn: "Closed",
    desc: "नागरिक सुविधा केंद्राचे नूतनीकरण, वातानुकूलित अभ्यागत कक्ष व आधुनिक कॉन्फरन्स हॉल बांधकाम.",
    descEn: "Renovation of citizen facility centre, air-conditioned visitor lounge, and modern conference hall."
  },
  {
    id: "T-2025-043",
    title: "गणपती घाट व बाग उद्यान सुशोभीकरण प्रकल्प", titleEn: "Ganpati Ghat & Public Garden Beautification Project",
    dept: "नगररचना विभाग", deptEn: "Town Planning",
    amount: "₹ 18,00,000", emd: "₹ 18,000", fee: "₹ 1,000",
    startDate: "01 ऑक्टोबर 2025", startDateEn: "01 October 2025",
    endDate: "31 ऑक्टोबर 2025", endDateEn: "31 October 2025",
    status: "बंद", statusEn: "Closed",
    desc: "पर्यटन स्थळांच्या सुशोभीकरणासाठी लाईटिंग, कारंजे, जॉगिंग ट्रॅक व मुलांची खेळणी बसवणे.",
    descEn: "Beautification of tourism spots with ambient lighting, fountains, jogging track, and children play area."
  },
];

const Tenders = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"all" | "active" | "closed">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTender, setSelectedTender] = useState<TenderItem | null>(null);

  const filteredTenders = tenders.filter((td) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && td.status === "चालू") ||
      (activeTab === "closed" && td.status === "बंद");

    const title = (language === "mr" ? td.title : td.titleEn).toLowerCase();
    const id = td.id.toLowerCase();
    const dept = (language === "mr" ? td.dept : td.deptEn).toLowerCase();
    const matchesSearch =
      title.includes(searchQuery.toLowerCase()) ||
      id.includes(searchQuery.toLowerCase()) ||
      dept.includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const activeCount = tenders.filter((t) => t.status === "चालू").length;
  const closedCount = tenders.filter((t) => t.status === "बंद").length;

  return (
    <PageLayout>
      <div className="py-12 bg-gradient-to-b from-background via-muted/30 to-background border-b relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Tender Modal */}
            {selectedTender && (
              <TenderDetailModal
                tender={selectedTender}
                language={language}
                t={t}
                onClose={() => setSelectedTender(null)}
              />
            )}

            {/* Hero Card */}
            <div className="gov-gradient rounded-3xl p-8 md:p-10 text-primary-foreground shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-bl-full pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm border border-white/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    {t("ई-प्रोक्युर्मेन्ट व निविदा दालन", "E-Procurement Portal")}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black text-white">{t("ई-निविदा / टेंडर्स", "Municipal Tenders")}</h1>
                  <p className="text-primary-foreground/90 text-sm md:text-base font-medium mt-2 max-w-xl">
                    {t(
                      "वाई नगरपरिषदेच्या विविध विकास कामे, खरेदी व सेवांसाठीच्या अधिकृत निविदा सूचना व ई-टेंडर दस्तऐवज.",
                      "Official tender notices, e-procurement documents & RFP for Wai Municipal Council development works."
                    )}
                  </p>
                </div>

                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shadow-xl flex-shrink-0">
                  📑
                </div>
              </div>
            </div>

            {/* Controls Bar: Search & Status Tabs */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Status Tabs */}
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card border border-border w-full sm:w-auto shadow-sm">
                {[
                  { key: "active", label: `${t("चालू निविदा", "Active Tenders")} (${activeCount})` },
                  { key: "closed", label: `${t("बंद निविदा", "Closed Tenders")} (${closedCount})` },
                  { key: "all", label: `${t("सर्व निविदा", "All Tenders")} (${tenders.length})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex-1 sm:flex-none text-center ${
                      activeTab === tab.key
                        ? "gov-gradient text-white shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("निविदा आयडी किंवा नाव शोधा...", "Search tender ID or name...")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                />
              </div>
            </div>

            {/* Tender Cards Grid */}
            {filteredTenders.length === 0 ? (
              <div className="bg-card rounded-3xl p-12 text-center border border-border shadow-xl space-y-3">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-40" />
                <h3 className="text-lg font-bold text-foreground">{t("कोणतीही निविदा सापडली नाही.", "No tenders found.")}</h3>
                <p className="text-xs text-muted-foreground">{t("कृपया शोध शब्द किंवा फिल्टर बदलून पहा.", "Please try changing your search query or tab filter.")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {filteredTenders.map((tender) => (
                  <div
                    key={tender.id}
                    className="bg-card rounded-3xl p-6 border border-border shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold px-3 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {tender.id}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          tender.status === "चालू"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-muted text-muted-foreground border-border"
                        }`}>
                          {t(tender.status, tender.statusEn)}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-primary" />
                          <span>{t(tender.dept, tender.deptEn)}</span>
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base md:text-lg text-foreground group-hover:text-primary transition-colors leading-snug">
                        {t(tender.title, tender.titleEn)}
                      </h3>

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {t(tender.desc, tender.descEn)}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-1">
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                          <span className="text-muted-foreground font-normal">{t("अंदाजित रक्कम", "Est. Amount")}:</span>
                          <span className="font-extrabold font-mono">{tender.amount}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span>{t("अंतिम मुदत", "Deadline")}: <strong className="text-foreground font-mono">{t(tender.endDate, tender.endDateEn)}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col items-center gap-2 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-border">
                      <button
                        onClick={() => setSelectedTender(tender)}
                        className="flex-1 md:flex-none w-full px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary hover:text-white border border-primary/20 text-primary font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span>{t("तपशील पहा", "View Details")}</span>
                      </button>

                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          alert(t(`निविदा दस्तऐवज ${tender.id}.pdf डाऊनलोड होत आहे...`, `Downloading Tender PDF ${tender.id}.pdf...`));
                        }}
                        className="flex-1 md:flex-none w-full px-4 py-2.5 rounded-xl gov-gradient text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg"
                      >
                        <Download className="w-4 h-4" />
                        <span>{t("PDF डाउनलोड", "Download PDF")}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </PageLayout>
  );
};

import { createPortal } from "react-dom";

function TenderDetailModal({
  tender,
  language,
  t,
  onClose,
}: {
  tender: TenderItem;
  language: string;
  t: (mr: string, en: string) => string;
  onClose: () => void;
}) {
  const title = language === "mr" ? tender.title : tender.titleEn;
  const desc = language === "mr" ? tender.desc : tender.descEn;
  const dept = language === "mr" ? tender.dept : tender.deptEn;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto pt-24 md:pt-28 pb-10">
      <div className="bg-card text-card-foreground rounded-3xl max-w-lg w-full border border-border shadow-2xl overflow-hidden relative my-auto max-h-[85vh] flex flex-col">
        <div className="gov-gradient text-primary-foreground p-6 pr-14 relative flex-shrink-0">
          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all hover:scale-110 shadow-lg border border-white/30"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
              {tender.id}
            </span>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
              {t(tender.status, tender.statusEn)}
            </span>
          </div>

          <h2 className="text-xl font-black text-white leading-snug">{title}</h2>
          <p className="text-xs text-primary-foreground/90 mt-1 font-semibold">{t("विभाग", "Department")}: {dept}</p>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{t("निविदा तपशील", "Description")}</h3>
            <p className="text-xs md:text-sm text-foreground leading-relaxed bg-muted/50 p-3.5 rounded-2xl border border-border">{desc}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-muted/60 border border-border">
              <div className="text-[10px] font-semibold text-muted-foreground">{t("अंदाजित प्रकल्प रक्ककम", "Estimated Value")}</div>
              <div className="font-extrabold text-foreground font-mono text-sm mt-0.5">{tender.amount}</div>
            </div>

            <div className="p-3 rounded-2xl bg-muted/60 border border-border">
              <div className="text-[10px] font-semibold text-muted-foreground">{t("बयाणा रक्कम (EMD)", "EMD Fee")}</div>
              <div className="font-extrabold text-amber-600 dark:text-amber-400 font-mono text-sm mt-0.5">{tender.emd}</div>
            </div>

            <div className="p-3 rounded-2xl bg-muted/60 border border-border">
              <div className="text-[10px] font-semibold text-muted-foreground">{t("निविदा फॉर्म फी", "Tender Form Fee")}</div>
              <div className="font-extrabold text-foreground font-mono text-sm mt-0.5">{tender.fee}</div>
            </div>

            <div className="p-3 rounded-2xl bg-muted/60 border border-border">
              <div className="text-[10px] font-semibold text-muted-foreground">{t("फॉर्म विक्री/स्वीकृती मुदत", "Submission Period")}</div>
              <div className="font-bold text-foreground text-xs mt-0.5">{t(tender.startDate, tender.startDateEn)} {t("ते", "to")} {t(tender.endDate, tender.endDateEn)}</div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{t("निविदा सादर करण्याचा पत्ता", "Submission Address")}</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed pl-5">
              {t("मुख्य अधिकारी कक्ष, वाई नगर परिषद, मोतीबाग रोड, वाई - ४१२८०३ (ई-प्रोक्युर्मेन्ट पोर्टलद्वारे ऑनलाइन सादर करणे आवश्यक).", "Chief Officer Desk, Wai Municipal Council, Motibag Road, Wai - 412803 (Must submit online via e-Procurement portal).")}
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between gap-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert(t(`निविदा दस्तऐवज ${tender.id}.pdf डाऊनलोड होत आहे...`, `Downloading Tender PDF ${tender.id}.pdf...`));
            }}
            className="flex-1 py-2.5 px-4 rounded-xl gov-gradient text-white font-bold text-xs text-center transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>{t("अधिकृत PDF डाउनलोड", "Download Official Tender PDF")}</span>
          </a>

          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-card border border-border hover:bg-accent text-foreground font-semibold text-xs transition-colors"
          >
            {t("बंद करा", "Close")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default Tenders;
