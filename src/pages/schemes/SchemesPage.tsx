import { useEffect, useState } from "react";
import { ExternalLink, BookOpen, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Search, FileText, Gift, Award, Info, X, Send } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { subscribeToActiveSchemes, type SchemeRecord, type SchemeCategory } from "@/lib/schemes";

const CATEGORIES: { value: SchemeCategory | "all"; labelMr: string; labelEn: string; icon: string }[] = [
  { value: "all", labelMr: "सर्व योजना", labelEn: "All Schemes", icon: "🌐" },
  { value: "central", labelMr: "केंद्र सरकार योजना", labelEn: "Central Govt Schemes", icon: "🏛️" },
  { value: "state", labelMr: "राज्य सरकार योजना", labelEn: "State Govt Schemes", icon: "🏰" },
  { value: "local", labelMr: "स्थानिक नगरपरिषद योजना", labelEn: "Local Schemes", icon: "🏢" },
];

const SchemesPage = () => {
  const { t, language } = useLanguage();
  const [schemes, setSchemes] = useState<SchemeRecord[]>([]);
  const [activeCategory, setActiveCategory] = useState<SchemeCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchemeForApply, setSelectedSchemeForApply] = useState<SchemeRecord | null>(null);

  useEffect(() => subscribeToActiveSchemes(setSchemes), []);

  const filteredSchemes = schemes.filter((s) => {
    const matchesCategory = activeCategory === "all" || s.category === activeCategory;
    const title = (language === "mr" ? s.titleMr : s.titleEn || s.titleMr).toLowerCase();
    const desc = (language === "mr" ? s.descMr : s.descEn || s.descMr).toLowerCase();
    const matchesSearch = title.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PageLayout>
      <div className="py-12 bg-gradient-to-b from-background via-muted/30 to-background border-b relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto space-y-8">

            {/* Scheme Application Modal */}
            {selectedSchemeForApply && (
              <ApplySchemeModal
                scheme={selectedSchemeForApply}
                language={language}
                t={t}
                onClose={() => setSelectedSchemeForApply(null)}
              />
            )}

            {/* Hero Card */}
            <div className="gov-gradient rounded-3xl p-8 md:p-10 text-primary-foreground shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-bl-full pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm border border-white/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    {t("शासकीय जनकल्याण उपक्रम", "Welfare & Governance Portal")}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black text-white">{t("सरकारी योजना व उपक्रम", "Government Schemes")}</h1>
                  <p className="text-primary-foreground/90 text-sm md:text-base font-medium mt-2 max-w-xl">
                    {t(
                      "केंद्र सरकार, महाराष्ट्र शासन व वाई नगरपरिषदेच्या सर्व जनकल्याणकारी योजनांची सविस्तर माहिती व ऑनलाइन अर्ज सुविधा.",
                      "Comprehensive information and online application for Central, State & Wai Municipal schemes."
                    )}
                  </p>
                </div>

                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shadow-xl flex-shrink-0">
                  🎁
                </div>
              </div>
            </div>

            {/* Search & Category Filter Pills */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Search Bar */}
                <div className="relative w-full sm:flex-1">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("योजनेचे नाव किंवा शब्द शोधा...", "Search scheme by name...")}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setActiveCategory(cat.value)}
                      className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-sm ${
                        activeCategory === cat.value
                          ? "gov-gradient text-white shadow-md scale-105"
                          : "bg-card text-foreground hover:bg-muted border border-border"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{t(cat.labelMr, cat.labelEn)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scheme Cards Grid */}
            {filteredSchemes.length === 0 ? (
              <div className="bg-card rounded-3xl p-12 text-center border border-border shadow-xl space-y-3">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-40" />
                <h3 className="text-lg font-bold text-foreground">{t("कोणतीही योजना सापडली नाही.", "No schemes found.")}</h3>
                <p className="text-xs text-muted-foreground">{t("कृपया वेगळा शोध शब्द वापरून प्रयत्न करा.", "Please try searching with another keyword.")}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSchemes.map((scheme) => (
                  <SchemeCard
                    key={scheme.id}
                    scheme={scheme}
                    language={language}
                    t={t}
                    onApply={() => setSelectedSchemeForApply(scheme)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

function SchemeCard({
  scheme,
  language,
  t,
  onApply,
}: {
  scheme: SchemeRecord;
  language: string;
  t: (mr: string, en: string) => string;
  onApply: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const title = language === "mr" ? scheme.titleMr : scheme.titleEn || scheme.titleMr;
  const desc = language === "mr" ? scheme.descMr : scheme.descEn || scheme.descMr;
  const eligibility = language === "mr" ? scheme.eligibilityMr : scheme.eligibilityEn || scheme.eligibilityMr;
  const benefits = language === "mr" ? scheme.benefitsMr : scheme.benefitsEn || scheme.benefitsMr;

  const categoryBadge =
    scheme.category === "central"
      ? { label: t("केंद्र सरकार", "Central Govt"), color: "bg-blue-500/10 text-blue-600 border-blue-500/30" }
      : scheme.category === "state"
      ? { label: t("महाराष्ट्र शासन", "Govt of Maharashtra"), color: "bg-orange-500/10 text-orange-600 border-orange-500/30" }
      : { label: t("स्थानिक नगरपरिषद", "Wai Council"), color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" };

  return (
    <div className="bg-card rounded-3xl border border-border shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Card Image Banner */}
        {scheme.imageBase64 ? (
          <div className="aspect-video overflow-hidden relative border-b border-border/50">
            <img src={scheme.imageBase64} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute top-3 left-3">
              <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full backdrop-blur-md border ${categoryBadge.color}`}>
                {categoryBadge.label}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-border/50 bg-primary/5 flex items-center justify-between">
            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${categoryBadge.color}`}>
              {categoryBadge.label}
            </span>
            <Gift className="w-5 h-5 text-primary" />
          </div>
        )}

        <div className="p-5 space-y-3">
          <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors leading-snug">
            {title}
          </h3>

          {desc && <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{desc}</p>}

          {expanded && (
            <div className="space-y-3 pt-2 border-t border-border/60 text-xs animate-in fade-in duration-200">
              {eligibility && (
                <div>
                  <p className="font-bold text-primary mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t("पात्रता निकष", "Eligibility Criteria")}</span>
                  </p>
                  <ul className="text-muted-foreground space-y-1 list-disc list-inside pl-1">
                    {eligibility.split("\n").filter(Boolean).map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}

              {benefits && (
                <div>
                  <p className="font-bold text-primary mb-1 flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t("योजनेचे फायदे", "Key Benefits")}</span>
                  </p>
                  <p className="text-muted-foreground">{benefits}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-4 pt-0 border-t border-border/40 flex items-center justify-between gap-2 mt-auto">
        {(eligibility || benefits) && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            {expanded ? t("कमी दाखवा ▲", "Show less ▲") : t("अधिक माहिती ▼", "More info ▼")}
          </button>
        )}

        {scheme.externalUrl ? (
          <a
            href={scheme.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto"
          >
            <button className="px-3.5 py-1.5 rounded-xl gov-gradient text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1">
              <span>{t("अर्ज करा", "Apply")}</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </button>
          </a>
        ) : (
          <button
            onClick={onApply}
            className="ml-auto px-3.5 py-1.5 rounded-xl gov-gradient text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1"
          >
            <span>{t("ऑनलाइन अर्ज करा", "Apply Online")}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function ApplySchemeModal({
  scheme,
  language,
  t,
  onClose,
}: {
  scheme: SchemeRecord;
  language: string;
  t: (mr: string, en: string) => string;
  onClose: () => void;
}) {
  const title = language === "mr" ? scheme.titleMr : scheme.titleEn || scheme.titleMr;
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-card text-card-foreground rounded-3xl max-w-md w-full border border-border shadow-2xl overflow-hidden relative my-auto">
        <div className="gov-gradient text-primary-foreground p-6 pr-14 relative">
          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all hover:scale-110 shadow-lg border border-white/30"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30 uppercase tracking-wider">
            {t("योजना अर्ज नोंदणी", "Scheme Application")}
          </span>
          <h2 className="text-xl font-black text-white mt-1 leading-snug">{title}</h2>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-400">{t("अर्ज नोंदवला गेला!", "Application Registered!")}</h3>
              <p className="text-xs text-muted-foreground">{t("योजनेचा अर्ज आयडी तुमच्या नोंदणीकृत क्रमांकावर पाठवला जाईल.", "Application ID will be sent via SMS.")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">{t("पूर्ण नाव *", "Full Name *")}</label>
                <input required placeholder={t("तुमचे नाव...", "Enter name...")} className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">{t("मोबाइल नंबर *", "Mobile Number *")}</label>
                <input required type="tel" placeholder="98XXXXXXXX" className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">{t("आधार क्रमांक *", "Aadhaar Number *")}</label>
                <input required placeholder="XXXX-XXXX-XXXX" className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <button type="submit" className="w-full py-3 rounded-xl gov-gradient text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 mt-2">
                <span>{t("अर्ज सबमिट करा", "Submit Scheme Request")}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchemesPage;
