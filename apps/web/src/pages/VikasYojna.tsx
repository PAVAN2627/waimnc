import PageLayout from "@/components/PageLayout";
import { useEffect, useState } from "react";
import {
  Building2,
  Droplets,
  FolderOpen,
  Hammer,
  Leaf,
  Lightbulb,
  Zap,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  FileCheck2,
  Clock,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { subscribeToActiveProjects, type ProjectRecord } from "@/lib/projects";
import { Link } from "react-router-dom";

const iconMap: Record<string, React.ElementType> = {
  Building2,
  Droplets,
  Leaf,
  Lightbulb,
  Hammer,
  Zap,
  FolderOpen,
};

export default function VikasYojna() {
  const { t, lang } = useLanguage();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"projects" | "dp" | "wards">("projects");

  useEffect(() => {
    const unsub = subscribeToActiveProjects(setProjects);
    return () => unsub();
  }, []);

  const dpSectors = [
    {
      titleMr: "रस्ते व वाहतूक पायाभूत सुविधा",
      titleEn: "Roads & Transportation Infrastructure",
      descMr: "वाई शहरातील मुख्य बाजारपेठ, महामार्ग जोड रस्ते, अंतर्गत गल्ल्यांचे सिमेंट काँक्रीटीकरण, पदपथ व गटार व्यवस्था.",
      descEn: "Cement concretization of main market roads, highway access corridors, pedestrian pathways, and storm water drains.",
      progress: "८५% पूर्ण",
      icon: Hammer,
      badge: "पायाभूत सुविधा",
    },
    {
      titleMr: "कृष्णा नदी काठ संवर्धन व सुशोभीकरण",
      titleEn: "Krishna Riverfront Conservation & Ghats",
      descMr: "ऐतिहासिक गणपती घाट, ब्रम्हेंद्रस्वामी मठ घाट परिसर स्वच्छता, कारंजे, स्ट्रीट लाईटिंग व नदीकाठ सुशोभीकरण.",
      descEn: "Conservation of historic Ganpati Ghat, river cleaning, heritage lighting, fountains, and riverfront promenade development.",
      progress: "९०% पूर्ण",
      icon: Droplets,
      badge: "नदी संवर्धन",
    },
    {
      titleMr: "२४x७ शुद्ध पिण्याचे पाणी योजना",
      titleEn: "24x7 Clean Drinking Water Supply",
      descMr: "धोम धरण पाणी पुरवठा योजना, नवीन जलशुद्धीकरण केंद्र (WTP) व शहरातील सर्व प्रभागांमध्ये जलवाहिनी जाळे.",
      descEn: "Dhom Dam gravity water supply project, modern water treatment plant, and continuous distribution across all 17 wards.",
      progress: "७५% प्रगतीत",
      icon: Droplets,
      badge: "अमृत जल योजना",
    },
    {
      titleMr: "घनकचरा व्यवस्थापन व हरित वाई",
      titleEn: "Solid Waste Management & Green Wai",
      descMr: "१००% घरोघरी कचरा संकलन, आधुनिक कचरा डेपो खत निर्मिती प्रकल्प व वृक्षारोपण हरित पट्टा विकास.",
      descEn: "100% segregated door-to-door waste collection, compost processing plant, and city-wide green belt plantation.",
      progress: "९५% पूर्ण",
      icon: Leaf,
      badge: "स्वच्छ भारत मिशन",
    },
  ];

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
                    <Building2 className="w-3.5 h-3.5" />
                    {t("शहराचा सर्वांगीण विकास आराखडा", "Comprehensive City Development Plan")}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black text-white">
                    {t("विकास योजना व प्रकल्प", "City Development Plan & Projects")}
                  </h1>
                  <p className="text-primary-foreground/90 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
                    {t(
                      "वाई शहराच्या शाश्वत विकासासाठी नगरपरिषदेचा विकास आराखडा (DP Plan), चालू नागरी पायाभूत सुविधा प्रकल्प व प्रभागनिहाय विकास कामांची माहिती.",
                      "Wai Municipal Council Development Plan (DP Plan), ongoing infrastructure projects, riverfront beautification, and ward-wise development initiatives."
                    )}
                  </p>
                </div>

                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shadow-xl flex-shrink-0">
                  🏗️
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card border border-border shadow-sm overflow-x-auto w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab("projects")}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "projects"
                    ? "gov-gradient text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                <span>{t("चालू विकास प्रकल्प", "Ongoing Projects")} ({projects.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("dp")}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "dp"
                    ? "gov-gradient text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{t("शहर विकास आराखडा (DP Plan)", "City DP Plan & Master Vision")}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("wards")}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "wards"
                    ? "gov-gradient text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>{t("प्रभागनिहाय विकास कामे", "Ward-wise Development")}</span>
              </button>
            </div>

            {/* TAB 1: Real Ongoing Projects */}
            {activeTab === "projects" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span>{t("प्रगतीपथावरील नागरी प्रकल्प", "Active Municipal Projects")}</span>
                  </h2>
                  <span className="text-xs font-bold text-muted-foreground">
                    {t("एकूण प्रकल्प:", "Total Projects:")} {projects.length}
                  </span>
                </div>

                {projects.length === 0 ? (
                  <div className="bg-card rounded-3xl p-12 text-center border border-border shadow-md space-y-3">
                    <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
                    <p className="text-sm font-bold text-foreground">
                      {t("सध्या कोणतेही प्रकल्प उपलब्ध नाहीत.", "No active projects listed currently.")}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((p) => {
                      const Icon = iconMap[p.iconName] ?? Building2;
                      const isComplete = p.progress >= 100;
                      return (
                        <div
                          key={p.id}
                          className="bg-card rounded-3xl p-6 border border-border shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Icon className="w-6 h-6" />
                              </div>
                              <span
                                className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${
                                  isComplete
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                    : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                                } flex items-center gap-1.5`}
                              >
                                {isComplete ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{t("पूर्ण (१००%)", "Completed")}</span>
                                  </>
                                ) : (
                                  <>
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    <span>{p.progress}% {t("प्रगतीत", "In Progress")}</span>
                                  </>
                                )}
                              </span>
                            </div>

                            <h3 className="font-black text-lg text-foreground group-hover:text-primary transition-colors leading-snug mb-2">
                              {lang === "mr" ? p.titleMr : p.titleEn || p.titleMr}
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                              {lang === "mr" ? p.descMr : p.descEn || p.descMr}
                            </p>
                          </div>

                          <div className="space-y-2 pt-4 border-t border-border">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-muted-foreground">{t("प्रगती स्थिती", "Completion Status")}</span>
                              <span className="font-mono text-primary font-black">{p.progress}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden border border-border p-0.5">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  isComplete ? "bg-emerald-500" : "gov-gradient"
                                }`}
                                style={{ width: `${Math.min(100, Math.max(5, p.progress))}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: City DP Plan */}
            {activeTab === "dp" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dpSectors.map((sector) => {
                    const IconComp = sector.icon;
                    return (
                      <div
                        key={sector.titleMr}
                        className="bg-card rounded-3xl p-6 md:p-7 border border-border shadow-md hover:shadow-xl transition-all space-y-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                            <IconComp className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {sector.badge}
                            </span>
                            <h3 className="font-black text-base text-foreground mt-1">
                              {lang === "mr" ? sector.titleMr : sector.titleEn}
                            </h3>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {lang === "mr" ? sector.descMr : sector.descEn}
                        </p>

                        <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs font-bold">
                          <span className="text-muted-foreground">{t("लक्ष्य साध्य:", "Target Status:")}</span>
                          <span className="text-emerald-600 font-extrabold">{sector.progress}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* DP Map & Information Box */}
                <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-xl space-y-4">
                  <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    <span>{t("वाई शहर मंजूर विकास योजना (DP) ठळक बाबी", "Wai City Approved Development Plan Highlights")}</span>
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
                      <span className="font-black text-foreground block">{t("१. निवासी क्षेत्र (Residential Zone)", "1. Residential Zone")}</span>
                      <p className="text-muted-foreground">{t("शहरातील नागरिकांच्या गृहनिर्माण व नागरी वस्त्यांसाठी सुनियोजित क्षेत्र वाटप.", "Planned zone for housing and residential settlements.")}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
                      <span className="font-black text-foreground block">{t("२. व्यावसायिक व बाजारपेठ क्षेत्र", "2. Commercial & Market Zone")}</span>
                      <p className="text-muted-foreground">{t("पारंपरिक बाजारपेठ, व्यापारी संकुले व दुकानांसाठी विशेष आरक्षण व रुंद रस्ते.", "Market corridors, commercial spaces, and parking allocations.")}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
                      <span className="font-black text-foreground block">{t("३. हरित पट्टा व नदीकाठ आरक्षण", "3. Green Belt & Heritage Ghat Zone")}</span>
                      <p className="text-muted-foreground">{t("कृष्णा नदीकाठ १०० मीटर हरित क्षेत्र व ऐतिहासिक मंदिरांचे संवर्धन पट्टा.", "100m green buffer zone along Krishna river and temple heritage conservation.")}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Ward-wise Works */}
            {activeTab === "wards" && (
              <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-xl space-y-6">
                <div className="border-b border-border pb-4">
                  <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>{t("१७ प्रभागांमधील पायाभूत विकास कामे", "Infrastructure Across 17 Wards")}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(
                      "प्रत्येक प्रभागात रस्ते, पथदिवे, पिण्याचे पाणी व स्वच्छता कामांचे समान वाटप.",
                      "Equitable distribution of civic road, lighting, drinking water, and drainage works across all municipal wards."
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Array.from({ length: 17 }, (_, i) => i + 1).map((w) => (
                    <div key={w} className="p-3.5 rounded-2xl bg-muted/30 border border-border text-center space-y-1 hover:border-primary transition-colors">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{t("प्रभाग क्रमांक", "Ward")}</span>
                      <p className="text-xl font-black text-primary font-mono">{w}</p>
                      <span className="text-[10px] font-bold text-emerald-600 block">{t("कामे प्रगतीपथावर", "Active Works")}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border">
                  <p className="text-xs font-bold text-muted-foreground">
                    {t("आपल्या प्रभागातील तक्रार किंवा दुरुस्ती अर्ज करण्यासाठी नागरी तक्रार मंच वापरा.", "Use citizen grievance portal to report issues in your ward.")}
                  </p>
                  <Link
                    to="/services/complaint"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl gov-gradient text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    <span>{t("प्रभाग तक्रार नोंदवा", "Report Ward Issue")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </PageLayout>
  );
}

